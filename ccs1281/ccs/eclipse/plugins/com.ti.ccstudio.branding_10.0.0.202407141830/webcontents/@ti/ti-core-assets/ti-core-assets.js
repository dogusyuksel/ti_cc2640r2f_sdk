/**
 *  Copyright (c) 2019, Texas Instruments Incorporated
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:
 *
 *  *   Redistributions of source code must retain the above copyright
 *  notice, this list of conditions and the following disclaimer.
 *  notice, this list of conditions and the following disclaimer in the
 *  documentation and/or other materials provided with the distribution.
 *  *   Neither the name of Texas Instruments Incorporated nor the names of
 *  its contributors may be used to endorse or promote products derived
 *  from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 *  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import '../../assets/fonts/font-roboto/roboto.js'; //^ti-core-assets\ti-core-assets.tsx,29^
import '../ti-core-assets/lib/TiUtils'; //^ti-core-assets\ti-core-assets.tsx,31^
import '../ti-core-assets/lib/TiFiles'; //^ti-core-assets\ti-core-assets.tsx,32^
import '../ti-core-assets/lib/TiConsole'; //^ti-core-assets\ti-core-assets.tsx,33^
import '../ti-core-assets/lib/TiLocalStorage'; //^ti-core-assets\ti-core-assets.tsx,34^
/**
* Theme css switching using MutationObserver to the body attribute change.
* Only loaded once when added to the dom.
*/
//create ti-widget-theme-stylesheet on load, append to document
const style = document.createElement('style'); //^ti-core-assets\ti-core-assets.tsx,42^
style.setAttribute('title', 'ti-widget-theme-stylesheet'); //^ti-core-assets\ti-core-assets.tsx,43^
const element = document.head || document.body; //^ti-core-assets\ti-core-assets.tsx,44^
element.appendChild(style); //^ti-core-assets\ti-core-assets.tsx,45^
style.sheet.insertRule('html {}', 0); //^ti-core-assets\ti-core-assets.tsx,46^
const styleSheet = style.sheet.cssRules[0].style; //^ti-core-assets\ti-core-assets.tsx,47^
// modify stylesheet/css variables on theme attribute change in body
const observer = new MutationObserver((mutations) => {
    mutations.forEach(function (mutation) {
        switch (document.body.getAttribute('theme')) { //^ti-core-assets\ti-core-assets.tsx,52^
            case 'ti-theme': //^ti-core-assets\ti-core-assets.tsx,53^
                styleSheet.setProperty('--theme-primary-color', '#cc0000'); //^ti-core-assets\ti-core-assets.tsx,54^
                styleSheet.setProperty('--theme-secondary-color', '#115566'); //^ti-core-assets\ti-core-assets.tsx,55^
                styleSheet.setProperty('--theme-alternative-color', '#990000'); //^ti-core-assets\ti-core-assets.tsx,56^
                styleSheet.setProperty('--theme-background-color', '#fff'); //^ti-core-assets\ti-core-assets.tsx,57^
                styleSheet.setProperty('--theme-font-color', '#231F20'); //^ti-core-assets\ti-core-assets.tsx,58^
                styleSheet.setProperty('--theme-header-font-color', '#231F20'); //^ti-core-assets\ti-core-assets.tsx,59^
                break; //^ti-core-assets\ti-core-assets.tsx,60^
            case 'ti-dark': //^ti-core-assets\ti-core-assets.tsx,61^
                styleSheet.setProperty('--theme-primary-color', '#990000'); //^ti-core-assets\ti-core-assets.tsx,62^
                styleSheet.setProperty('--theme-secondary-color', '#115566'); //^ti-core-assets\ti-core-assets.tsx,63^
                styleSheet.setProperty('--theme-alternative-color', '#990000'); //^ti-core-assets\ti-core-assets.tsx,64^
                styleSheet.setProperty('--theme-background-color', '#2f2f2f'); //^ti-core-assets\ti-core-assets.tsx,65^
                styleSheet.setProperty('--theme-font-color', '#f2f2f2'); //^ti-core-assets\ti-core-assets.tsx,66^
                styleSheet.setProperty('--theme-header-font-color', '#f2f2f2'); //^ti-core-assets\ti-core-assets.tsx,67^
                break; //^ti-core-assets\ti-core-assets.tsx,68^
        } //^ti-core-assets\ti-core-assets.tsx,69^
    }); //^ti-core-assets\ti-core-assets.tsx,70^
}); //^ti-core-assets\ti-core-assets.tsx,71^
observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['theme'] //^ti-core-assets\ti-core-assets.tsx,75^
}); //^ti-core-assets\ti-core-assets.tsx,76^
