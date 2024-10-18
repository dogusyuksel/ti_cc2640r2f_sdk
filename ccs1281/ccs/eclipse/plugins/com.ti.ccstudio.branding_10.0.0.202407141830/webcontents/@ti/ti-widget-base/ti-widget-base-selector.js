/**
 *  Copyright (c) 2020, Texas Instruments Incorporated
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
import { TiWidgetBase } from './ti-widget-base'; //^ti-widget-base\ti-widget-base-selector.tsx,33^
/**
 * `TiWidgetBaseSelector` provides the base implementation for selector element.
 *
 * @isHidden
 */
export class TiWidgetBaseSelector extends TiWidgetBase {
    constructor(parent) {
        super(parent); //^ti-widget-base\ti-widget-base-selector.tsx,59^
        this.parent = parent;
        this.options = []; //^ti-widget-base\ti-widget-base-selector.tsx,50^
        this.valuesArray = []; //^ti-widget-base\ti-widget-base-selector.tsx,51^
        this.desired = undefined; //^ti-widget-base\ti-widget-base-selector.tsx,55^
        this.loaded = false; //^ti-widget-base\ti-widget-base-selector.tsx,57^
    } //^ti-widget-base\ti-widget-base-selector.tsx,60^
    componentDidLoad() {
        this.loaded = true; //^ti-widget-base\ti-widget-base-selector.tsx,63^
        this.labelsChanged(); //^ti-widget-base\ti-widget-base-selector.tsx,65^
        this.valuesChanged(); //^ti-widget-base\ti-widget-base-selector.tsx,66^
        this.sortedChanged(); //^ti-widget-base\ti-widget-base-selector.tsx,67^
        this.initialIndexChanged(); //^ti-widget-base\ti-widget-base-selector.tsx,68^
        this.selectedTextChanged(); //^ti-widget-base\ti-widget-base-selector.tsx,69^
        this.selectedValueChanged(); //^ti-widget-base\ti-widget-base-selector.tsx,70^
        this.selectedIndexChanged(); //^ti-widget-base\ti-widget-base-selector.tsx,71^
    } //^ti-widget-base\ti-widget-base-selector.tsx,72^
    setOptions(options) { } //^ti-widget-base\ti-widget-base-selector.tsx,79^
    getDisabledValues() { return new Array(); } //^ti-widget-base\ti-widget-base-selector.tsx,80^
    getSorted() { return false; } //^ti-widget-base\ti-widget-base-selector.tsx,81^
    getSortedNumerically() { return false; } //^ti-widget-base\ti-widget-base-selector.tsx,82^
    findOption(propertyName, value) {
        if (value !== null && value !== undefined && (propertyName !== 'index' || (value >= 0 && value < this.options.length))) { //^ti-widget-base\ti-widget-base-selector.tsx,85^
            for (let i = this.options.length; i-- > 0;) { //^ti-widget-base\ti-widget-base-selector.tsx,86^
                const option = this.options[i]; //^ti-widget-base\ti-widget-base-selector.tsx,87^
                if (option[propertyName] === value) { //^ti-widget-base\ti-widget-base-selector.tsx,89^
                    return { option: option, selectedIndex: i }; //^ti-widget-base\ti-widget-base-selector.tsx,90^
                } //^ti-widget-base\ti-widget-base-selector.tsx,91^
            } //^ti-widget-base\ti-widget-base-selector.tsx,92^
        } //^ti-widget-base\ti-widget-base-selector.tsx,93^
        return null; //^ti-widget-base\ti-widget-base-selector.tsx,94^
    } //^ti-widget-base\ti-widget-base-selector.tsx,95^
    // getIndexAfterSorting(indexBeforeSorting: number) {
    //     let indexAfterSorting = 0;
    //     for (let i = 0; i < this.options.length; i++) {
    //         if (this.options[i].index === indexBeforeSorting) {
    //             indexAfterSorting = i;
    //             break;
    //         }
    //     }
    //     return indexAfterSorting;
    // }
    updateProperties() {
        let result = null; //^ti-widget-base\ti-widget-base-selector.tsx,109^
        if (this.options.length > 0) { //^ti-widget-base\ti-widget-base-selector.tsx,111^
            if (this.desired === undefined) { //^ti-widget-base\ti-widget-base-selector.tsx,112^
                // update desired if needed
                if (this.parent.selectedText !== this.lastSelectedText) { //^ti-widget-base\ti-widget-base-selector.tsx,114^
                    this.desired = 'Text'; //^ti-widget-base\ti-widget-base-selector.tsx,115^
                    this.lastSelectedText = this.parent.selectedText; //^ti-widget-base\ti-widget-base-selector.tsx,116^
                } //^ti-widget-base\ti-widget-base-selector.tsx,117^
                if (this.parent.selectedValue !== this.lastSelectedValue) { //^ti-widget-base\ti-widget-base-selector.tsx,118^
                    this.desired = 'Value'; //^ti-widget-base\ti-widget-base-selector.tsx,119^
                    this.lastSelectedValue = this.parent.selectedValue; //^ti-widget-base\ti-widget-base-selector.tsx,120^
                } //^ti-widget-base\ti-widget-base-selector.tsx,121^
                if (this.parent.selectedIndex !== this.lastSelectedIndex) { //^ti-widget-base\ti-widget-base-selector.tsx,122^
                    this.desired = 'Index'; //^ti-widget-base\ti-widget-base-selector.tsx,123^
                    this.lastSelectedIndex = this.parent.selectedIndex; //^ti-widget-base\ti-widget-base-selector.tsx,124^
                } //^ti-widget-base\ti-widget-base-selector.tsx,125^
            } //^ti-widget-base\ti-widget-base-selector.tsx,126^
            result = //^ti-widget-base\ti-widget-base-selector.tsx,127^
                this.desired === undefined //^ti-widget-base\ti-widget-base-selector.tsx,128^
                    ? this.findOption('index', this.parent.initialIndex === undefined ? this.parent.selectedIndex : this.parent.initialIndex) //^ti-widget-base\ti-widget-base-selector.tsx,129^
                    : this.findOption(this.desired.toLowerCase(), this.parent['selected' + this.desired]); //^ti-widget-base\ti-widget-base-selector.tsx,130^
        } //^ti-widget-base\ti-widget-base-selector.tsx,131^
        if (!result) { //^ti-widget-base\ti-widget-base-selector.tsx,132^
            result = { option: { index: -1, text: '', value: -1 }, selectedIndex: -1 }; //^ti-widget-base\ti-widget-base-selector.tsx,133^
        } //^ti-widget-base\ti-widget-base-selector.tsx,134^
        const option = result.option; //^ti-widget-base\ti-widget-base-selector.tsx,136^
        if (this.desired !== 'Index' && this.parent.selectedIndex !== option.index) { //^ti-widget-base\ti-widget-base-selector.tsx,137^
            this.lastSelectedIndex = option.index; //^ti-widget-base\ti-widget-base-selector.tsx,138^
            this.parent.selectedIndex = option.index; //^ti-widget-base\ti-widget-base-selector.tsx,139^
        } //^ti-widget-base\ti-widget-base-selector.tsx,140^
        if (this.desired !== 'Text' && this.parent.selectedText !== option.text) { //^ti-widget-base\ti-widget-base-selector.tsx,141^
            this.lastSelectedText = option.text; //^ti-widget-base\ti-widget-base-selector.tsx,142^
            this.parent.selectedText = option.text; //^ti-widget-base\ti-widget-base-selector.tsx,143^
        } //^ti-widget-base\ti-widget-base-selector.tsx,144^
        if (this.desired !== 'Value' && this.parent.selectedValue !== option.value) { //^ti-widget-base\ti-widget-base-selector.tsx,145^
            this.lastSelectedValue = option.value; //^ti-widget-base\ti-widget-base-selector.tsx,146^
            this.parent.selectedValue = option.value; //^ti-widget-base\ti-widget-base-selector.tsx,147^
        } //^ti-widget-base\ti-widget-base-selector.tsx,148^
        if (result.selectedIndex !== this.getSelectedIndex()) { //^ti-widget-base\ti-widget-base-selector.tsx,149^
            this.setSelectedIndex(result.selectedIndex); //^ti-widget-base\ti-widget-base-selector.tsx,150^
        } //^ti-widget-base\ti-widget-base-selector.tsx,151^
    } //^ti-widget-base\ti-widget-base-selector.tsx,152^
    valuesChanged() {
        if (this.loaded) { //^ti-widget-base\ti-widget-base-selector.tsx,155^
            this.valuesArray = this.getValues(); //^ti-widget-base\ti-widget-base-selector.tsx,156^
            const disabledArray = this.getDisabledValues(); //^ti-widget-base\ti-widget-base-selector.tsx,157^
            if (this.valuesArray.length === 0) { //^ti-widget-base\ti-widget-base-selector.tsx,158^
                this.valuesArray = undefined; //^ti-widget-base\ti-widget-base-selector.tsx,159^
            } //^ti-widget-base\ti-widget-base-selector.tsx,160^
            for (let i = this.options.length; i-- > 0;) { //^ti-widget-base\ti-widget-base-selector.tsx,162^
                const option = this.options[i]; //^ti-widget-base\ti-widget-base-selector.tsx,163^
                option.value = this.valuesArray ? this.valuesArray[option.index] : option.index + 1; //^ti-widget-base\ti-widget-base-selector.tsx,164^
                option.disabled = option.value ? disabledArray.includes(option.value.toString()) : false; //^ti-widget-base\ti-widget-base-selector.tsx,165^
            } //^ti-widget-base\ti-widget-base-selector.tsx,166^
            this.setOptions(this.options); //^ti-widget-base\ti-widget-base-selector.tsx,167^
            this.updateProperties(); //^ti-widget-base\ti-widget-base-selector.tsx,168^
        } //^ti-widget-base\ti-widget-base-selector.tsx,169^
    } //^ti-widget-base\ti-widget-base-selector.tsx,170^
    labelsChanged() {
        if (this.loaded) { //^ti-widget-base\ti-widget-base-selector.tsx,173^
            const labelsArray = this.getLabels(); //^ti-widget-base\ti-widget-base-selector.tsx,174^
            const disabledArray = this.getDisabledValues(); //^ti-widget-base\ti-widget-base-selector.tsx,175^
            this.options = []; //^ti-widget-base\ti-widget-base-selector.tsx,176^
            for (let i = 0; i < labelsArray.length; i++) { //^ti-widget-base\ti-widget-base-selector.tsx,178^
                const value = this.valuesArray ? +this.valuesArray[i] : i + 1; //^ti-widget-base\ti-widget-base-selector.tsx,179^
                const option = {
                    index: i,
                    text: labelsArray[i],
                    value: value,
                    disabled: value ? disabledArray.includes(value.toString()) : false //^ti-widget-base\ti-widget-base-selector.tsx,184^
                }; //^ti-widget-base\ti-widget-base-selector.tsx,185^
                this.options.push(option); //^ti-widget-base\ti-widget-base-selector.tsx,186^
            } //^ti-widget-base\ti-widget-base-selector.tsx,187^
            if (this.getSorted()) { //^ti-widget-base\ti-widget-base-selector.tsx,189^
                this.doSort(); //^ti-widget-base\ti-widget-base-selector.tsx,190^
            } //^ti-widget-base\ti-widget-base-selector.tsx,191^
            this.setOptions(this.options); //^ti-widget-base\ti-widget-base-selector.tsx,193^
            // // Bug fix: chrome seems to have a problem if I set the index too quickly after setting labels.
            // // using async to delay the updating of the index seems to fix this issue.
            // Async.timeOut.run(() => {
            //     // refresh
            //     this.updateProperties();
            // });
        } //^ti-widget-base\ti-widget-base-selector.tsx,201^
    } //^ti-widget-base\ti-widget-base-selector.tsx,202^
    doSort() {
        if (this.options.length > 0) { //^ti-widget-base\ti-widget-base-selector.tsx,205^
            if (this.getSorted()) { //^ti-widget-base\ti-widget-base-selector.tsx,206^
                if (!this.getSortedNumerically()) { //^ti-widget-base\ti-widget-base-selector.tsx,207^
                    this.options = this.options.sort((a, b) => {
                        return a.text.toLocaleLowerCase().localeCompare(b.text.toLocaleLowerCase()); //^ti-widget-base\ti-widget-base-selector.tsx,209^
                    }); //^ti-widget-base\ti-widget-base-selector.tsx,210^
                }
                else { //^ti-widget-base\ti-widget-base-selector.tsx,211^
                    this.options = this.options.sort((a, b) => {
                        return +a.text - +b.text; //^ti-widget-base\ti-widget-base-selector.tsx,213^
                    }); //^ti-widget-base\ti-widget-base-selector.tsx,214^
                } //^ti-widget-base\ti-widget-base-selector.tsx,215^
            }
            else { //^ti-widget-base\ti-widget-base-selector.tsx,216^
                this.options = this.options.sort((a, b) => {
                    return a.index - b.index; //^ti-widget-base\ti-widget-base-selector.tsx,218^
                }); //^ti-widget-base\ti-widget-base-selector.tsx,219^
            } //^ti-widget-base\ti-widget-base-selector.tsx,220^
        } //^ti-widget-base\ti-widget-base-selector.tsx,221^
    } //^ti-widget-base\ti-widget-base-selector.tsx,222^
    sortedChanged() {
        if (this.loaded) { //^ti-widget-base\ti-widget-base-selector.tsx,225^
            this.doSort(); //^ti-widget-base\ti-widget-base-selector.tsx,226^
            // update widget with new order of options
            this.setOptions(this.options); //^ti-widget-base\ti-widget-base-selector.tsx,229^
            const result = this.findOption('index', this.parent.selectedIndex); //^ti-widget-base\ti-widget-base-selector.tsx,231^
            this.setSelectedIndex(result === null ? -1 : result.selectedIndex); //^ti-widget-base\ti-widget-base-selector.tsx,232^
        } //^ti-widget-base\ti-widget-base-selector.tsx,233^
    } //^ti-widget-base\ti-widget-base-selector.tsx,234^
    selectedValueChanged() {
        if (this.loaded && this.parent.selectedValue !== this.lastSelectedValue) { //^ti-widget-base\ti-widget-base-selector.tsx,237^
            this.lastSelectedValue = this.parent.selectedValue; //^ti-widget-base\ti-widget-base-selector.tsx,238^
            const i = this.getSelectedIndex(); //^ti-widget-base\ti-widget-base-selector.tsx,239^
            if (i >= 0 && i < this.options.length ? this.options[i].value !== this.parent.selectedValue : this.parent.selectedValue !== undefined) { //^ti-widget-base\ti-widget-base-selector.tsx,240^
                this.desired = 'Value'; //^ti-widget-base\ti-widget-base-selector.tsx,241^
                this.updateProperties(); //^ti-widget-base\ti-widget-base-selector.tsx,242^
            } //^ti-widget-base\ti-widget-base-selector.tsx,243^
            this.onSelectionChanged(); //^ti-widget-base\ti-widget-base-selector.tsx,245^
        } //^ti-widget-base\ti-widget-base-selector.tsx,246^
    } //^ti-widget-base\ti-widget-base-selector.tsx,247^
    selectedTextChanged() {
        if (this.loaded && this.parent.selectedText !== this.lastSelectedText) { //^ti-widget-base\ti-widget-base-selector.tsx,250^
            this.lastSelectedText = this.parent.selectedText; //^ti-widget-base\ti-widget-base-selector.tsx,251^
            const i = this.getSelectedIndex(); //^ti-widget-base\ti-widget-base-selector.tsx,252^
            if (i >= 0 && i < this.options.length ? this.options[i].text !== this.parent.selectedText : this.parent.selectedText !== undefined) { //^ti-widget-base\ti-widget-base-selector.tsx,253^
                this.desired = 'Text'; //^ti-widget-base\ti-widget-base-selector.tsx,254^
                this.updateProperties(); //^ti-widget-base\ti-widget-base-selector.tsx,255^
            } //^ti-widget-base\ti-widget-base-selector.tsx,256^
            this.onSelectionChanged(); //^ti-widget-base\ti-widget-base-selector.tsx,258^
        } //^ti-widget-base\ti-widget-base-selector.tsx,259^
    } //^ti-widget-base\ti-widget-base-selector.tsx,260^
    selectedIndexChanged() {
        if (this.loaded && this.parent.selectedIndex !== this.lastSelectedIndex) { //^ti-widget-base\ti-widget-base-selector.tsx,263^
            this.lastSelectedIndex = this.parent.selectedIndex; //^ti-widget-base\ti-widget-base-selector.tsx,264^
            const i = this.getSelectedIndex(); //^ti-widget-base\ti-widget-base-selector.tsx,265^
            if (i >= 0 && i < this.options.length ? this.options[i].index !== this.parent.selectedIndex : this.parent.selectedIndex !== undefined) { //^ti-widget-base\ti-widget-base-selector.tsx,266^
                this.desired = 'Index'; //^ti-widget-base\ti-widget-base-selector.tsx,267^
                this.updateProperties(); //^ti-widget-base\ti-widget-base-selector.tsx,268^
            } //^ti-widget-base\ti-widget-base-selector.tsx,269^
            this.onSelectionChanged(); //^ti-widget-base\ti-widget-base-selector.tsx,271^
        } //^ti-widget-base\ti-widget-base-selector.tsx,272^
    } //^ti-widget-base\ti-widget-base-selector.tsx,273^
    onSelectionChanged() {
        if (this.desired === undefined) { //^ti-widget-base\ti-widget-base-selector.tsx,276^
            // arbitrarily choose to preserve index if user makes changes before model does.
            this.desired = 'Index'; //^ti-widget-base\ti-widget-base-selector.tsx,278^
        } //^ti-widget-base\ti-widget-base-selector.tsx,279^
        const index = this.getSelectedIndex(); //^ti-widget-base\ti-widget-base-selector.tsx,281^
        const option = this.options[index]; //^ti-widget-base\ti-widget-base-selector.tsx,282^
        if (option) { //^ti-widget-base\ti-widget-base-selector.tsx,283^
            this.parent.selectedIndex = option.index; //^ti-widget-base\ti-widget-base-selector.tsx,284^
            this.parent.selectedValue = option.value; //^ti-widget-base\ti-widget-base-selector.tsx,285^
            this.parent.selectedText = option.text; //^ti-widget-base\ti-widget-base-selector.tsx,286^
        } /*else if (this.parent.allowEmptySelection) {
            // properties are cleared if user clears input and allowEmptySelection is enabled
            this.parent.selectedIndex = index;
            this.parent.selectedValue = undefined;
            this.parent.selectedText = '';
        }*/
        this.selectionChanged(index); //^ti-widget-base\ti-widget-base-selector.tsx,294^
    } //^ti-widget-base\ti-widget-base-selector.tsx,295^
    initialIndexChanged() {
        if (this.loaded && this.desired === undefined) { //^ti-widget-base\ti-widget-base-selector.tsx,298^
            const i = this.getSelectedIndex(); //^ti-widget-base\ti-widget-base-selector.tsx,299^
            if (i >= 0 && i < this.options.length ? this.options[i].index !== this.parent.initialIndex : this.parent.initialIndex !== undefined) { //^ti-widget-base\ti-widget-base-selector.tsx,300^
                this.updateProperties(); //^ti-widget-base\ti-widget-base-selector.tsx,301^
            } //^ti-widget-base\ti-widget-base-selector.tsx,302^
        } //^ti-widget-base\ti-widget-base-selector.tsx,303^
    } //^ti-widget-base\ti-widget-base-selector.tsx,304^
} //^ti-widget-base\ti-widget-base-selector.tsx,305^
