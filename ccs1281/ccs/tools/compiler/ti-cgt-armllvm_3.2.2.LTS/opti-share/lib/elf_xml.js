/* -----------------------------------------------------------------------------
Copyright (c) 2023, Texas Instruments Incorporated
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

-  Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

-  Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

-  Neither the name of Texas Instruments Incorporated nor the names of
   its contributors may be used to endorse or promote products derived
   from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, combined, OR PROFITS;
OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
----------------------------------------------------------------------------- */
const fs          = require('fs');
const {XMLParser} = require("fast-xml-parser");
const objectify   = x => x?.reduce((res,elm) => ({...res, [elm.id]:elm}), {});
const sym_refs    = (sectid, syms) => syms.filter(x => x.sectid == sectid).map(x => x.id);
const hex         = n => `0x${n.toString(16)}`;

//------------------------------------------------------------------------------
// xml_file function
//------------------------------------------------------------------------------
function xml_file(elf,idx,opts)
{
    const oc_ref_flatten  = (x) => x?.object_component_ref?.map(x=>x.idref);
    const sym_ref_flatten = (x) => x?.symbol_ref?.map(x=>x.idref);
    const lg_ref_flatten  = (x) => x?.logical_group_ref?.map(x=>x.idref);

    //--------------------------------------------------------------------------
    // Body of xml_file function
    //--------------------------------------------------------------------------
    const xmlParserAttrs = {
        attributeNamePrefix   : '',
        ignoreAttributes      : false,
        parseAttributeValue   : false,
        allowBooleanAttributes: true,
        parseTagValue         : true,

        // ensures that any tag that may be an array will be array
        isArray: (name, jpath, isLeafNode, isAttribute) => {
            const arrays = [
                'link_info.input_file_list_input_file',
                'link_info.object_component_list.object_component',
                'link_info.object_component_list.object_component.refd_ro_sections.object_component_ref',
                'link_info.object_component_list.object_component.refd_rw_sections.object_component_ref',
                'link_info.object_component_list.object_component.refd_linker_syms.symbol_ref',
                'link_info.logical_group_list.logical_group',
                'link_info.logical_group_list.logical_group.contents.object_component_ref',
                'link_info.logical_group_list.logical_group.placement_relative_symdefs.symbol_ref', // new
                'link_info.logical_group_list.output_section_group',
                'link_info.logical_group_list.output_section_group.contents.logical_group_ref',
                'link_info.logical_group_list.load_segment',
                'link_info.logical_group_list.load_segment.contents.logical_group_ref',
                'link_info.placement_map.memory_area',
                'link_info.placement_map.memory_area.usage_details.allocated_space', // new
                'link_info.placement_map.memory_area.usage_details.available_space', // new
                'link_info.veneer_list.veneer', // new
                'link_info.veneer_list.veneer.caller_list.veneer_call_site', // new
                'link_info.symbol_table.symbol',
                'link_info.symbol_table.symbol.callees.symbol_ref'
            ];
            return arrays.includes(jpath);
        }
    };

    const parser = new XMLParser(xmlParserAttrs);
    elf = parser.parse(fs.readFileSync(elf))['link_info'];

    // ------ logical_groups --------
    elf.logical_group_list.logical_group       ?.forEach(x=> x.contents = oc_ref_flatten(x.contents));
    elf.logical_group_list.output_section_group?.forEach(x=> x.contents = lg_ref_flatten(x.contents));
    elf.logical_group_list.load_segment        ?.forEach(x=> x.contents = lg_ref_flatten(x.contents));

    // ------ memopry <= placement_map.memory_area --------
    elf.memory = elf.placement_map?.memory_area;
    delete elf.placement_map;

    // ------ veneers <= veneer_list.veneer--------
    elf.veneers = elf.veneer_list?.veneer;
    delete elf.veneer_list;

    // ------ files <= input_file_list.input_file --------
    elf.files = objectify(elf.input_file_list?.input_file);
    delete elf.input_file_list;

    // ------ symbols <= symbol_table.symbol --------
    elf.symbols = elf.symbol_table?.symbol;
    delete elf.symbol_table;

    // remove truly unneeded symbols
    const unneeded_local = x => x.local && (x.name == '' || typeof x.name == 'object' || ['$','.'].includes(x.name[0]));
    let bogus_syms = elf.symbols.filter(x=>!x.function && unneeded_local(x)).map(x=>x.id);
    elf.symbols = elf.symbols.filter(x=>!bogus_syms.includes(x.id));

    // Simplify symbol internals
    elf.symbols.forEach(x=>{
        x.sectid = x.object_component_ref?.idref;
        delete x.object_component_ref;
        x.callees  = sym_ref_flatten(x.callees);
    });

    // ------ sections <= object_component_list.onbject_components --------
    elf.sections = elf.object_component_list?.object_component;
    delete elf.object_component_list;

    // for sections with same name on single core, resolve if possible by
    // appending # and hash
    elf.sections.forEach(x=>{
        let num_same_name = elf.sections.filter(sect=> sect.name == x.name).length;
        if (num_same_name > 1 && x.value) x.name = x.name+'#'+x.value;
    });

    // Simplify symbol internals
    elf.sections.forEach(x => {
        x.fidx          = idx;
        x.ref_ro        = oc_ref_flatten(x.refd_ro_sections); delete x.refd_ro_sections;
        x.ref_rw        = oc_ref_flatten(x.refd_rw_sections); delete x.refd_rw_sections;
        x.ref_lnksym    = sym_ref_flatten(x.refd_linker_syms)?.filter(sym=>!bogus_syms.includes(sym)); delete x.refd_linker_syms;
        x.load_address  = x.load_address || x.run_address;
        x.load_memtype  = addr_type(x.load_address, elf.memory);
        x.run_memtype   = addr_type(x.run_address, elf.memory);
        x.fileid        = x.input_file_ref?.idref; delete x.input_file_ref;
        x.def_syms      = sym_refs(x.id, elf.symbols);
    });

    // remove noload (.debug_) sections & logical groups
    if (opts.remove_debug_sections) {
        let debug_lgs    = elf.logical_group_list.logical_group.filter(x=>x.display == 'never');
        let noload_sects = debug_lgs.flatMap(x=>x.contents);
        elf.logical_group_list.logical_group = elf.logical_group_list.logical_group.filter(x=>x.display != 'never');
        elf.sections       = elf.sections.filter(x=> !noload_sects.includes(x.id));
    }

    return elf;
}

function addr_type (addr, memory)
{
    let range = memory?.find(x=> addr >= x.origin && addr < x.origin + x.length);
    return range ? range.name : hex(addr);
}

module.exports = xml_file;