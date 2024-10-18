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
const path        = require('path');
const commander   = require('commander');
const Table       = require('cli-table');
const xml_file    = require('../lib/elf_xml');
const print       = console.log;

//------------------------------------------------------------------------------
// Main
//------------------------------------------------------------------------------
commander.program
   .description('Opti-Save = Compare two ELF xml files for section size differences')
   .argument   ('<elf1>',    'The 1st input ELF xml files')
   .argument   ('[elf2]',    'The 2nd input ELF xml files')
   .option     ('-a, --all', 'Show all sections, even if no savings')
   .action     ((elf1, elf2, opts) => process(elf1, elf2, opts))
   .parse      ();

//------------------------------------------------------------------------------
// Process
//------------------------------------------------------------------------------
function process(elf1, elf2, opts)
{
    let data = {};
    let table;
    const chars = opts.ascii_table ? {} :
        { 'top'   :'' , 'top-mid'   :'' , 'top-left'   :'' , 'top-right'   :'',
          'bottom':'' , 'bottom-mid':'' , 'bottom-left':'' , 'bottom-right':'',
          'left'  :'' , 'left-mid'  :'' , 'mid'        :'' , 'mid-mid'     :'',
          'right' :'' , 'right-mid' :'' , 'middle'     :'' };


    let e1name = path.basename(elf1,'.xml');
    elf1 = xml_file(elf1,0,{remove_debug_sections:true}).logical_group_list.logical_group;
    elf1.forEach(x=>{
        if (!(x.name in data)) data[x.name] = [0,0,0];
        data[x.name][0] = x.size;
    });

    if (elf2) {
        let e2name = path.basename(elf2,'.xml');
        elf2 = xml_file(elf2,1,{remove_debug_sections:true}).logical_group_list.logical_group;
        elf2.forEach(x=>{
            if (!(x.name in data)) data[x.name] = [0,0,0];
            data[x.name][1] = x.size;
        });

        table = new Table({ head: ['Section', e1name, e2name, 'Saving'], chars});
        for (let key of Object.keys(data)) {
            data[key][2] = data[key][0] - data[key][1];
            if (!opts.all && !data[key][2]) continue;
            table.push([key, ... data[key]]);
        }
    }
    else {
        table = new Table({ head: ['Section', e1name], chars});
        for (let key of Object.keys(data))
            if (data[key][0]) table.push([key, data[key][0]]);
    }

    print(table.toString().replace(/\u001B\[[39][910]m/g, ""),'\n');
}