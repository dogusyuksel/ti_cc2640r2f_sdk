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
const commander   = require('commander');
const Table       = require('cli-table');
const Graph       = require('./lib/graph');
const xml_file    = require('./lib/elf_xml');
const print       = console.log;
const hex         = n => `0x${n.toString(16)}`;

const sectidref   = (elf, sectid)  => elf.sections .find(x => x.id == sectid);
const symidref    = (elf, symid)   => elf.symbols.find(x => x.id == symid);
const arrayeq     = (a,b) => JSON.stringify(a) === JSON.stringify(b);

//------------------------------------------------------------------------------
// Styling for printed tables
//------------------------------------------------------------------------------
const removeCodes = x => x.replace(/\u001B\[[39][910]m/g, "");
const style = {compact:true};
const chars = { 'top'        : '-', 'bottom'    : '-', 'mid'         : '-',
                'left'       : '|', 'right'     : '|', 'middle'      : '|',
                'top-left'   : '+', 'top-mid'   : '+', 'top-right'   : '+',
                'bottom-left': '+', 'bottom-mid': '+', 'bottom-right': '+',
                'left-mid'   : '+', 'mid-mid'   : '+',  'right-mid'  : '+'};


const default_ms_json = {
    "mem_spec": {
        "device_mem_regions": [
            { "name":"share_all", "kind":"system", "origin":0x0, "length":0xffffffff }
        ],
        "shared_mem_regions": [
            { "name":"OCRAM", "origin":0x70070000, "length":0x10000 }
        ],
        "shared_os_placement_instrs": [
            { "name":".shared.text","placement":"> OCRAM" },
            { "name":".shared.rodata","placement":"> OCRAM" },
            { "name":".shared.bss","placement":"> OCRAM" },
            { "name":".shared.data","placement":"> OCRAM" }
        ]
    }
};

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------
commander.program
   .description('Opti-Share: Create a linker command file to generate an SSO out file.')
   .argument   ('<elfs...>',           'The input ELF xml files')
   .option     ('-d, --debug',         'Debug mode')
   .option     ('-o, --output <file>', 'Name the output SSO linker command file', 'sso.cmd')
   .option     ('-s, --info_table [file]', 'Generate a shared section information table')
   .option     ('--nobss',             'Do not share BSS sections')
   .option     ('--nodata',            'Do not share DATA sections')
   .option     ('--mem_spec <file>',   'Name of memory specification JSON')
   .action     ((elfs, opts) => { process(elfs, opts); })
   .parse      ();

//------------------------------------------------------------------------------
// Process
//------------------------------------------------------------------------------
function process(elfs, opts)
{
    // Read each 'info' file into an obect
    let combined = elfs.map((elf,idx)=>xml_file(elf,idx,{remove_debug_sections:true}));
    if (opts.debug) fs.writeFileSync('__debug_elfs.json', JSON.stringify(combined));

    // Convert combined sections to a map, keyed by name, value is array of
    // sections of that name across all cores
    let sects = combined.flatMap(x=>x.sections).reduce((res,elm) => {
        (res[elm.name] || (res[elm.name] = [])).push(elm); return res;}, {});

    // Read in memory specification (if given) or use default
    // A list of device local memory regions is needed to avoid sharing functions
    // that are allocated to a local memory region (like TCM)
    let ms_data = get_memory_specification(opts);
    let device_local_regions = define_device_memory_regions(ms_data);
    let memdir = get_shared_memory_directive(ms_data);
    let outscn_specs = get_shared_section_placements(ms_data);

    disqualify(sects, combined, device_local_regions, opts);
    if (opts.debug) fs.writeFileSync('__debug_sects.json', JSON.stringify(sects));
    if (opts.debug) combined.forEach((elf,idx)=>dependence_graph(elf,idx));

    if (opts.debug) report(sects, combined, opts);
    print_info_table(sects,combined,opts);

    let output = create_shared_link_command_file(sects, combined, memdir, outscn_specs, opts);
    if (opts.output) fs.writeFileSync(opts.output, output);
}

//------------------------------------------------------------------------------
function file_path(sect, elf, adorn_member = true)
{
    let file = elf.files[sect.fileid];
    if (!file || !file.file) return undefined;
    let spec = `"${file.path}${file.file}"`;
    if (file.kind == 'archive' && adorn_member) spec += `<${file.name}>`;
    return spec;
}

//------------------------------------------------------------------------------
function disqualify(sects, combined, dlrs, opts)
{
    const sym_names = (sect, elf) => sect.def_syms.map(x => symidref(elf, x).name);

    for (const [sectname, instances] of Object.entries(sects)) {
        let hashes            = instances.map(x=>x.value).filter(x=>x!==undefined);
        let elf_indices       = instances.map(x=>x.fidx);
        let load_memtypes     = instances.map(x=>x.load_memtype);
        let run_memtypes      = instances.map(x=>x.run_memtype);
        let sizes             = instances.map(x=>x.size);
        let file_specs        = instances.map(x=>file_path(x, combined[x.fidx]));
        let def_sym_names     = instances.map(x=>sym_names(x, combined[x.fidx]));
        let categories        = instances.map(x=>categorize(x));
        let num_instances     = instances.length;
        let num_hashes        = hashes.length;
        let same_hashes       = hashes.every((val, i, arr) => val === arr[0]);
        let same_load_memtype = load_memtypes .every((val, i, arr) => val === arr[0]);
        let same_run_memtype  = run_memtypes  .every((val, i, arr) => val === arr[0]);
        let same_def_symbols  = def_sym_names .every((val, i, arr) => arrayeq(val, arr[0]));
        let same_sizes        = sizes .every((val, i, arr) => arrayeq(val, arr[0]));
        let elf_has_multi     = elf_indices.length !== new Set(elf_indices).size;
        let refs_linker_syms  = instances.map(x=>(x.ref_lnksym || []).length).some(x=>x>0);
        let uninitialized     = instances.map(x=>x.uninitialized).some(x=>x==='true'||x===true);
        let local_alloc       = instances.map(x=>x.run_address).some(x=>has_local_alloc(x,dlrs));
        let do_not_share      = instances.map(x=>x.of_notshared).some(x=>x==='true'||x===true);

        let disq = undefined;
        if (num_instances == 1)               disq = 'not shared';
        else if (elf_has_multi)               disq = 'multiple sections of same name in a elf';
        else if (!same_hashes)                disq = 'inconsistent hashes';
        else if (file_specs[0] === undefined) disq = 'missing file paths';
        else if (!same_def_symbols)           disq = 'inconsistent defined symbols';
        else if (!same_sizes)                 disq = 'inconsistent sizes';
        else if (num_hashes && num_hashes != num_instances) disq = 'inconsistent hash existance';
        else if (!num_hashes && !uninitialized) disq = 'no hashes to verify';
        else if (opts.nobss  && categories[0] === 'bss')  disq = '--nobss prevents sharing bss sections';
        else if (opts.nodata && categories[0] === 'data') disq = '--nodata prevents sharing data sections';
        else if (!same_load_memtype)          disq = 'inconsistent load addr memory range';  // TODO TBD
        else if (!same_run_memtype)           disq = 'inconsistent run addr memory range';   // TODO TBD
        else if (refs_linker_syms)            disq = 'linker generated symbols references';  // TODO TBD
        else if (local_alloc)                 disq = 'allocated to local memory';
        else if (do_not_share)                disq = 'do_not_share attribute';

        if (disq) instances.forEach(x=>x.disq = disq);
    }

    disqualify_based_on_descendants(sects, combined);
}

function disqualify_based_on_descendants(sects, combined)
{
    const is_disq  = (sects, sectname) => sects[sectname].map(x=>x.disq).some(x=>x!=undefined);
    const set_disq = (sects, sectname, reason) => sects[sectname].forEach(x=>x.disq=reason);

    for (let elf of combined) {

        // create a reference graph
        let g   = new Graph();
        elf.sections.forEach(sect => {
            g.addVertex(sect.id);
            sect.ref_ro?.forEach(s2 => g.addEdge(sect.id, s2));
            sect.ref_rw?.forEach(s2 => g.addEdge(sect.id, s2));
        });

        // remove nodes in cycles until graph is acyclic
        do {
            var v = g.isCyclic();
            if (v) {
                let sectname = sectidref(elf,v).name;
                set_disq(sects, sectname, 'cycle in reference graph');
                g.delVertex(v);
            }
        } while (v);

        // generate a topological order of nodes
        const topo = Object.keys(g.dfsTopSort());

        // iterate over sections and disqualify them if any child is disqualified
        for (let parent_id of topo) {
            let sect        = sectidref(elf, parent_id);
            let parent_name = sect.name;
            if (is_disq(sects, parent_name)) continue;

            let children = (sect.ref_ro || []).concat(sect.ref_rw || []);
            for (let child_id of children) {
                let child_name = sectidref(elf, child_id).name;
                if (is_disq(sects, child_name)) {
                    set_disq(sects, parent_name, 'child cannot be shared');
                    break;
                }
            }
        }
    }
}
//------------------------------------------------------------------------------
function get_memory_specification(opts)
{
    if (opts.mem_spec) {
      return JSON.parse(fs.readFileSync(opts.mem_spec, 'utf8'));
    }

    return default_ms_json;
}
//------------------------------------------------------------------------------
function define_device_memory_regions(ms_data)
{
   let device_local_regions = [];
   ms_data.mem_spec.device_mem_regions.forEach(region => {
     if (region.kind === "local") {
       if (device_local_regions.length === 0) {
         device_local_regions.push(region);
       }
       else {
         let in_region_start = parseInt(region.origin);
         let in_region_end = in_region_start + parseInt(region.length);
         for (let i = 0; i < device_local_regions.length; i++) {
           // region is after of current device local region
           if (region.origin >=
               (device_local_regions[i].origin + device_local_regions[i].length)) {
             continue;
           }
           else {
             let loc_region_start = parseInt(device_local_regions[i].origin);
             let loc_region_end = loc_region_start + parseInt(device_local_regions[i].length);
             // region is in front of current device local region
             if ((in_region_start < loc_region_start) &&
                 (in_region_end < loc_region_start)) {
               device_local_regions.splice(i, 0, region);
             }
             // region crosses a boundary of an existing region
             else if (((in_region_start < loc_region_start) &&
                       (in_region_end > loc_region_start)) ||
                      ((in_region_start >= loc_region_start) &&
                       (in_region_end > loc_region_end))) {
               console.log('WARNING: region ' + region.name + ' crosses previous region bounds, ignored');
             }
             break;
           }
         }
       }
     }
   });

   return device_local_regions;
}
//------------------------------------------------------------------------------
function get_shared_memory_directive(ms_data)
{
   let memdir = [];
   memdir.push('MEMORY {');
   ms_data.mem_spec.shared_mem_regions.forEach(region => {
     memdir.push(region.name + ': o=' + region.origin + ' l=' + region.length);
   });
   memdir.push('}');
   return memdir;
}
//------------------------------------------------------------------------------
function get_shared_section_placements(ms_data)
{
   let outscn_specs = new Map();
   ms_data.mem_spec.shared_os_placement_instrs.forEach(section => {
     if (section.name === ".shared.text") {
       outscn_specs.set("text",section.placement);
     }
     else if (section.name === ".shared.rodata") {
       outscn_specs.set("rodata",section.placement);
     }
     else if (section.name === ".shared.bss") {
       outscn_specs.set("bss",section.placement);
     }
     else if (section.name === ".shared.data") {
       outscn_specs.set("data",section.placement);
     }
     else {
       console.log('WARNING: invalid section: ' + section.name + ', ignored');
     }
   });

   return outscn_specs;
}
//------------------------------------------------------------------------------
function create_shared_link_command_file(sects, combined, memdir, outscn_specs, opts)
{
    let preamble = [
        '--map_file=sso.map',
        '--output_file=sso.out',
        '--no_entry_point',
        '--sso'
    ];


    let disqualified = [];
    let categories   = {};

    for (const [sectname, instances] of Object.entries(sects)) {
        let disqs = instances.map(x=>x.disq).filter(x=>x!==undefined);
        let sect  = instances[0];

        if (disqs.length)
        {
            disqualified.push(`// ${sectname} disqualified due to ${disqs[0]}`);
            continue;
        }
        let category = categorize(sect);

        (categories[category] || (categories[category] = [])).push(instances);
    }

    let info     = [];
    let sectspec = [];

    sectspec.push('SECTIONS {');
    for (const [category, sections] of Object.entries(categories)) {
        sectspec.push(`\n    .shared.${category} {`);
        let members = [];
        const priorities = {text:4,rodata:3,bss:2,data:1};
        let placement  = (category in priorities) ? outscn_specs.get(category) : '';
        const annotation = (category in priorities) ? `priority(${priorities[category]})` : '';
        placement = placement.concat(", ",annotation);

        sections.forEach(sect_instances=> {
            let cnt  = sect_instances.length;
            let sect = sect_instances[0];
            let sectname = sect.name.split('#')[0];

            let file_spec    = file_path(sect, combined[sect.fidx]);
            let section_spec = `${file_spec}(${sectname})`;

            info   .push(`// ${sectname} ${cnt} copies shared, saving ${(cnt-1)*sect.size} bytes`);
            members.push(`        . = align(${sect.alignment}); ${section_spec}`);

            //if (sect.run_memtype == sect.load_memtype || sect.uninitialized)
                    //spec += `> ${sect.run_memtype}}\n`;
            //else spec += `RUN = ${sect.run_memtype} LOAD = ${sect.load_memtype}}\n`;
        });
        sectspec = sectspec.concat(members.sort());
        sectspec.push(`    } ${placement}`);
    }
    sectspec.push(`}`);

    return preamble.join('\n') +
           '\n\n' + memdir.join('\n') +
           '\n\n' + sectspec.join('\n') +
           '\n\n' + info.sort().join('\n') +
           '\n\n' + disqualified.sort().join('\n');
}

function addr_type (addr, memory)
{
    let range = memory?.find(x=> addr >= x.origin && addr < x.origin + x.length);
    return range ? range.name : hex(addr);
}

function init_size(x)
{
    return x.contents || !x.size ? '' : `: { .+= ${x.size}; }`;
}

function memrange(name,x,elf)
{
    if (!x.load_address || x.load_address == x.run_address)
        print (`  ${name}${init_size(x)} > ${addr_type(x.run_address, elf.memory)}`);
    else
        print (`  ${name}${init_size(x)} RUN = ${addr_type(x.run_address, elf.memory)} LOAD = ${addr_type(x.load_address, elf.memory)}`);
}

function dependence_graph(elf,idx) {
    let g = new Graph();
    elf.sections.forEach(sect => {
        let color = 'green';
        if (sect.disq) {
            if (sect.disq.includes('child cannot be shared')) color = 'orange';
            else color = 'red';
        }
        let shape = 'oval';
        if (!sect.readonly) shape = 'box';

        g.addVertex(sect.id, color, shape, sect.name);
        sect.ref_ro?.forEach(s2 => g.addEdge(sect.id, s2));
        sect.ref_rw?.forEach(s2 => g.addEdge(sect.id, s2));
    });
    fs.writeFileSync(`__debug_graph${idx}.dot`, g.print());
}

function categorize(sect)
{
    let category = 'uncategorized';
    if      (!sect.uninitialized && sect.executable && sect.value)       category = 'text';
    else if (!sect.uninitialized && sect.readonly   && !sect.executable) category = 'rodata';
    else if ( sect.uninitialized && sect.readwrite  && sect.fileid)      category = 'bss';
    else if ( sect.uninitialized && sect.readwrite  && !sect.fileid)     category = 'common';
    else if (!sect.uninitialized && sect.readwrite)                      category = 'data';
    else if (!sect.uninitialized && sect.executable && !sect.value)      category = 'tramp';

    if (sect.name == '.stack')         category = 'stack';   // otherwise bss and common
    else if (sect.name == '.sysmem')   category = 'sysmem';  // otherwise bss and common
    else if (sect.name == '.vectors')  category = 'vectors'; // otherwise text

    return category;
}

function has_local_alloc (addr, dlrs)
{
    for (let i = 0; i < dlrs.length; i++) {
      let region_start = parseInt(dlrs[i].origin);
      let region_end = region_start + parseInt(dlrs[i].length);
      if ((addr >= region_start) && (addr < region_end)) {
        return true;
      }
    }

    return false;
}

//------------------------------------------------------------------------------
// Print out before and after predicted sizes based on section type
//------------------------------------------------------------------------------
function report(sects, combined, opts)
{
    let tally_pre  = {};
    let tally_post = {};
    let tally_sso  = {};
    const numCores = combined.length;

    for (const [sectname, instances] of Object.entries(sects)) {
        let disq  = instances.map(x=>x.disq).some(x=>x!=undefined);

        instances.forEach(x=> {
            let cat  = categorize(x);
            let size = x.size;
            let idx  = x.fidx;

            if (!tally_pre[cat]) tally_pre[cat] = Array(numCores).fill(0);
            tally_pre[cat][idx] += size;

            if (disq) {
                if (!tally_post[cat]) tally_post[cat] = Array(numCores+1).fill(0);
                tally_post[cat][idx] += size;
            }
        });

        if (!disq) {
            let sizes = [... new Set(instances.map(x=>x.size))];
            console.assert(sizes.length == 1);
            let size = sizes[0];

            let cats = [... new Set(instances.map(x=>categorize(x)))];
            console.assert(cats.length  == 1);
            let cat = cats[0];

            if (!tally_sso[cat]) tally_sso[cat] = 0;
            tally_sso[cat] += size;
        }
    }

    const header_pre = ['Memory Type', ...Array(numCores).keys()];
    let   table_pre  = new Table({ head: header_pre, chars, style });
    for (const [type, sizes] of Object.entries(tally_pre))
        table_pre.push([type, ... sizes]);
    print('\nInput Sizes');
    print(removeCodes(table_pre.toString()));

    for (const [cat, size] of Object.entries(tally_sso))
        if (size) tally_post[`shared_${cat}`] = (['text', 'rodata'].includes(cat))
                        ? Array(numCores).fill(0).concat([size])
                        : Array(numCores+1).fill(size);

    const header_post = ['Memory Type', ... Array(numCores).keys(), 'SSO'];
    let   table_post  = new Table({ head: header_post, chars, style });
    for (const [type, sizes] of Object.entries(tally_post))
        table_post.push([type, ... sizes]);
    print('\nOutput Sizes');
    print(removeCodes(table_post.toString()));
}

//------------------------------------------------------------------------------
// Print out informational section table
//------------------------------------------------------------------------------
function print_info_table(sects, combined, opts)
{
    if (!opts.info_table) return;

    const numCores  = combined.length;
    const head  = ['Section', ...Array(numCores).keys(), 'Shared'];
    let   table = new Table({ head, chars, style});

    for (const [sectname, instances] of Object.entries(sects)) {
        let coreSizes = Array(numCores).fill(' ');
        instances.forEach(x=>coreSizes[x.fidx]=x.size);
        table.push([sectname, ...coreSizes, instances[0].disq || 'Shared']);
    }

    let tableStr = removeCodes(table.toString());
    if (opts.info_table == true) print(tableStr);
    else fs.writeFileSync(opts.info_table, tableStr);
}

