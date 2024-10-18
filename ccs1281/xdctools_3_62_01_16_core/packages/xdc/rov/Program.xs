/* 
 *  Copyright (c) 2008-2020 Texas Instruments Incorporated
 *  All rights reserved. This program and the accompanying materials
 *  are made available under the terms of the Eclipse Public License v1.0
 *  which accompanies this distribution, and is available at
 *  http://www.eclipse.org/legal/epl-v10.html
 *
 *  Contributors:
 *      Texas Instruments - initial implementation
 *
 * */

/*
 *  ======== Program ========
 *  This module is structured such that all of the work of fetching and
 *  decoding structures is handled by the decoder, and all processing of view
 *  init code is done by Program.
 *
 *  The caching policy is that caching is done by the callee, so Program may
 *  request data from the decoder and expect that if the data is already
 *  available the decoder will return immediately.
 */

/* global xdc, Program */

var cmodTab = [];
var modTab = [];
var statusTab = new Array();
var timestampFunc;

var throwScanErrors = true; /* default to true for backward compatibility */

var Model = xdc.module("xdc.rov.Model");

/*
 *  ======== getSupportedTabs ========
 *  Functions of the form view$init$instance$* and view$init$module$* define
 *  the set of tabs supported by the module.
 */
function getSupportedTabs(modName)
{
    /*
     * Don't use getModuleDesc in order to avoid running useModule.
     * The initial call of useModule will take the longest, so put it off
     * until we have to.
     */
    var mod = this.getModuleDesc(modName);
    //var modCfg = Program.$modules[modName];

    var tabs = new Array();

    /*
     * If the module is missing from the package, return a fake tab which will
     * display an error message.
     */
    if (mod.loadFailed) {
        var tab = new Program.Tab();
        tab.name = Program.loadModFailed;
        tab.type = Program.getViewType(modName, tab.name);
        tabs[tabs.length] = tab;
        return (tabs);
    }

    /* Find the supported tabs in the module's view map */
    if (mod.viewInfo != null) {
        for each (var viewName in mod.viewInfo.viewMap.$keys) {
            var tab = new Program.Tab();
            tab.name = viewName;
            tab.type = Program.getViewType(modName, viewName);
            tabs[tabs.length] = tab;
        }

        /* Don't add the raw tab if showRawTab is false */
        if (mod.viewInfo.showRawTab == false) {
            return (tabs);
        }
    }

    /* if mod.viewInfo.showRawTab is true, add the Raw tab */
    var ViewInfo = xdc.useModule('xdc.rov.ViewInfo');
    var tab = new Program.Tab();
    tab.name = "Raw";
    tab.type = String(ViewInfo.RAW);
    tabs[tabs.length] = tab;

    return (tabs);
}

/*
 *  ======== getViewType ========
 *  Returns the view type of the specified tab as an xdc.rov.ViewInfo.ViewType.
 */
function getViewType(modName, tabName)
{
    tabName = _getTabName(tabName); /* remove any optional args */

    if (tabName.equals("Raw")) {
        var ViewInfo = xdc.useModule('xdc.rov.ViewInfo');
        return (String(ViewInfo.RAW));
    }

    var mod = this.getModuleDesc(modName);

    /*
     * If the load failed, there is only one tab, which will display
     * an error message.
     */
    if (mod.loadFailed) {
        var ViewInfo = xdc.useModule('xdc.rov.ViewInfo');
        return (String(ViewInfo.RAW));
    }

    /* Throw an error if the module does not support the tab */
    if (mod.viewInfo == null ||
        mod.viewInfo.viewMap[tabName] == null) {
        throw (new Error("Tab " + tabName + " not in module " + modName));
    }
    return  String(mod.viewInfo.viewMap[tabName].type);
}

/*
 *  ======== scanModuleView ========
 *  Processes the specified module-level view of the specified module.
 *  This function will verify that the specified module supports the specified
 *  tab, so that all other functions may assume that the tab is supported.
 */
function scanModuleView(modName, args)
{
    var tabName = _getTabName(args);
    var tabArgs = _getTabArgs(args);

    var modDesc = this.getModuleDesc(modName);

    /* Verify the module supports the requested tab */
    if (!modSupportsTab(modName, tabName)) {
        throw (new Error(modName + " does not support the tab '"
                         + tabName + "'"));
    }

    /* Check if the requested view has already been scanned */
    if (modDesc.viewMap[tabName] != undefined) {
        /* Before returning it, check if there were any problems */
        var view = modDesc.viewMap[tabName];
        if (throwScanErrors) {
            for (var field in view.$status) {
                if (view.$status[field]) {
                    throw (new Error("ROV detected errors in scan of '"
                                     + tabName
                                     + "' tab for module " + modName + "."));
                }
            }
        }
        return (view);
    }

    /*
     *  Make sure the module state is read in. Returns immediately if
     *  the state is already scanned, sets modDesc.state = null if there is no
     *  module state.
     */
    this.stateReader.fetchModuleState(modDesc);

    /* Run the view function */
    var noErrors = runViewInit(modDesc, modDesc, tabName, "module", tabArgs);

    /*
     * If there were errors, throw an exception, so that it must be caught and
     * handled if the caller wants to continue.
     */
    if (throwScanErrors && !noErrors) {
        throw (new Error("ROV detected errors in scan of '" + tabName +
                         "' tab for module " + modName + "."));
    }

    /* Return the view */
    return (modDesc.viewMap[tabName]);
}

/*
 *  ======== scanInstanceView ========
 *  Checks to see if the particular instance view has already been scanned.
 *  If it has, it simply returns. Otherwise, it calls in to the decoder as
 *  necessary to scan the instance view.
 *  Once the instance view is scanned, it can be accessed through:
 *  for (var i in mod.instances) {
 *      var instView = mod.instances[i].viewMap[tabName];
 *  }
 */
function scanInstanceView(modName, args)
{
    var tabName = _getTabName(args);
    var tabArgs = _getTabArgs(args);

    debugPrint("xdc.rov.Program: Scanning instance views for " + modName + " "
        + tabName);

    /* Get the module from cache or useModule */
    var mod = this.getModuleDesc(modName);

    /* Verify the module supports the requested tab */
    if (!modSupportsTab(modName, tabName)) {
        throw (new Error("Module does not support the requested view level"));
    }
    if (!('Instance_State' in mod.useMod)) {
        throw (new Error("Calling scanInstance on module that does not support instances"));
    }

    /*
     * Scan in the instance state structures.
     * Returns immediately if they were already scanned.
     */
    this.stateReader.fetchAllInstStates(mod);

    /* If there are no instances, return an empty array */
    if (mod.instances.length == 0) {
        return (new Array());
    }

    /* If we come across any problems, we'll throw an exception at the end */
    var error = false;

    /*
     * At this point, we have the instance states, but may not
     * have the requested view.
     *
     * For each of the module's instances, call the view function specified
     * by tabName, then add the resulting view to the instance's $viewMap.
     */
    debugPrint("xdc.rov.Program: Number of instances = " + mod.instances.length);
    for each (var instDesc in mod.instances) {
        debugPrint("xdc.rov.Program: Running view init on inst = 0x"
                   + Number(instDesc.state.$addr).toString(16));

        var res = runViewInit(mod, instDesc, tabName, "instance", tabArgs);

        /* Set the error flag true if even a single instance had errors */
        if (!res) {
            error = true;
        }
    }

    /*
     * If there were errors, throw an exception, so that it must be caught and
     * handled if the caller wants to continue.
     */
    if (throwScanErrors && error) {
        throw (new Error("ROV detected errors in scan of '" + tabName +
                         "' tab for module " + modName + "."));
    }

    /* Create an array of the requested instance views to return */
    var instArr = new Array();
    for each (var inst in mod.instances) {
        instArr[instArr.length] = inst.viewMap[tabName];
    }

    return (instArr);
}

/*
 *  ======== newViewStruct ========
 */
function newViewStruct(modName, tabName)
{
    /* Verify the module and tab names are valid */
    if (!modSupportsTab(modName, tabName)) {
        throw (new Error("Module " + modName + " does not support tab " +
                         tabName + "."));
    }

    var modDesc = this.getModuleDesc(modName);

    var structName = modDesc.viewInfo.viewMap[tabName].structName;

    /* Verify the specified structure exists in the module */
    if (!(structName in modDesc.useMod)) {
        throw (new Error("Module " + modName + " does not contain the " +
                         "view structure " + structName));
    }

    var struct = new modDesc.useMod[structName];

    /* Create the status map and bind it to the struct */
    var status = new Object();

    for (var p in struct) {
        status[p] = null;
    }
    struct.$$bind('$status', status);

    // TODO: Seal the map's domain? Would need to add address field before
    // sealing.

    return (struct);
}

/*
 *  ========= scanInstanceDataView ==========
 *  TODO - Added error handling
 */
function scanInstanceDataView(modName, args)
{
    var tabName = _getTabName(args);
    var tabArgs = _getTabArgs(args);

    /* Get the module from cache or useModule */
    var modDesc = this.getModuleDesc(modName);

    /* Verify the module supports the requested tab */
    if (!modSupportsTab(modName, tabName)) {
        throw (new Error("Module does not support the requested view level"));
    }

    /* Check if the view has already been scanned */
    if (modDesc.viewMap[tabName] != undefined) {
        /* TODO: Before returning check for errors; throw exception if found */
        return (modDesc.viewMap[tabName]);
    }

    var Program = xdc.useModule('xdc.rov.Program');

    /*
     * If there is any problem reading any of the state structures,
     * the scan will throw an exception.
     */
    var rawView = Program.scanRawView(modName);

    var viewInitFunc = getViewInitFunc(modDesc, tabName);

    var dataArr = new Array();

    /* Track whether any errors were encountered */
    var error = false;

    /*
     * If the module doesn't actually have RTSC instances, as is the case for
     * C modules just call the view function once without passing in anything.
     */
    if (modDesc.cfg == null) {
        try {
            dataArr = viewInitFunc.call(modDesc.userPrivate, tabArgs);
        }
        catch (e) {
            /*
             * Since there are no instances, there's nowhere to report
             * the exception.
             */
            debugPrint("xdc.rov.Program: Caught exception from view init: " +
                       Program.exToString(e));
        }
        for (var i = 0; i < dataArr.length; i++) {
            var viewPage = dataArr[i];
            for (var j = 0; j < viewPage.elements.length; j++) {
                if (viewPage.elements[j].constructor.name !=
                    modDesc.viewInfo.viewMap[tabName].structName) {
                        throw new Error("The view '" + tabName + "' returned "
                            + "an object whose type is different from '"
                            + modDesc.viewInfo.viewMap[tabName].structName
                            + "' on the page " + i + ", row " + j + ".");
                    }
            }
        }

        /*
         * Check abort flag again in case the view function caught the
         * abort signal.
         */
        if (Model.getICallBackInst().getAbortFlag()) {
            throw (new Error("abort"));
        }

        /* Add the view to the module's viewMap */
        modDesc.viewMap[tabName] = dataArr;

        /*
         * Check if there were any errors reported on any fields.
         * Add any errors to the status table.
         */
        for (var i = 0; i < dataArr.length; i++) {
            var view = dataArr[i];
            for (var j = 0; j < view.elements.length; j++) {
                for (var p in view.elements[j]) {
                    if (view.elements[j].$status[p]) {
                        /* Record status in the status table for reference */
                        addStatusEntry(modName, tabName, view.label, p,
                                       view.elements[j].$status[p]);

                        error = true;
                    }
                }
            }
        }
    }
    /*
     * Otherwise, if the module does have instances, call the view function
     * once per instance, passing in a view structure and the instance state.
     */
    else {
        for each (var instDesc in modDesc.instances) {

            var instDataView = new Program.InstDataView;

            /* Run the view init function for this instance */
            try {
                viewInitFunc.call(modDesc.userPrivate, instDataView, instDesc.state, tabArgs);
            }
            catch (e) {
                var exception = "Caught exception in view init code: " + e.toString();

                /* Add the exception to the error map to display */
                instDesc.errorMap[tabName] = exception;

                debugPrint("xdc.rov.Program: " + exception);

                /* Record the exception in the status table for reference */
                addStatusEntry(modName, tabName, instDataView.label, "N/A", exception);
            }

            /*
             * Check abort flag again in case the view function caught the
             * abort signal.
             */
            if (Model.getICallBackInst().getAbortFlag()) {
                throw (new Error("abort"));
            }

            /* Add the view to the array to return */
            dataArr[dataArr.length] = instDataView;

            /* Add the view to the instance's viewMap */
            instDesc.viewMap[tabName] = instDataView;

            /*
             * Check if there were any errors reported on any fields.
             * Add any errors to the status table.
             */
            for each (var view in instDataView.elements) {
                for (var p in view.$status) {
                    if (view.$status[p]) {
                        /* Record status in the status table for reference */
                        addStatusEntry(modName, tabName, instDataView.label, p,
                                       view.$status[p]);

                        error = true;
                    }
                }
            }
        }
    }

    /*
     * If there were errors, throw an exception, so that it must be caught and
     * handled if the caller wants to continue.
     */
    if (throwScanErrors && error) {
        throw (new Error("ROV detected errors in scan of '" + tabName +
                         "' tab for module " + modName + "."));
    }

    return (dataArr);
}

/*
 *  ========= scanModuleDataView ==========
 *
 */
function scanModuleDataView(modName, args)
{
    var tabName = _getTabName(args);
    var tabArgs = _getTabArgs(args);

    /* Get the module from cache or useModule */
    var modDesc = this.getModuleDesc(modName);

    /* Verify the module supports the requested tab */
    if (!modSupportsTab(modName, tabName)) {
        throw (new Error("Module does not support the requested view level"));
    }

    /* Check if the view has already been scanned */
    if (modDesc.viewMap[tabName] != undefined) {
        /* TODO: Before returning check for errors; throw exception if found */
        return (modDesc.viewMap[tabName]);
    }

    var viewInitFunc = getViewInitFunc(modDesc, tabName);

    var modDataView = new Program.ModDataView;

    /* If the view code throws an exception, let it propagate up and be
     * displayed to the user. This means the user won't see any partial data
     * if there is any, but there's no other logical place to display the
     * exception message.
     * C-ROV modules return a view instead of filling up 'modDataView', so we
     * don't even pass 'modDataView'.
     */
    var dataView;
    if (modDesc.cfg == null) {
        dataView = viewInitFunc.call(modDesc.userPrivate, tabArgs);
        /* Translate dataView into modDataView. If the function did not return
         * the right type of objects, we need to report an error because the
         * returned object needs to have $status property for each cell. If a
         * user invokes Program.displayError() on a view of a wrong type,
         * there will be an assignment to an undefined property.
         */
        if (dataView instanceof Array) {
            if (dataView.length > 0
                && (dataView[0].constructor.name !=
                    modDesc.viewInfo.viewMap[tabName].structName)) {
                throw new Error("The function '" + viewInitFunc.name + "' is "
                    + "not returning objects of the type '"
                    + modDesc.viewInfo.viewMap[tabName].structName + "'.");
            }
            modDataView.elements = dataView;
        }
        else {
            if (dataView.constructor.name !=
                modDesc.viewInfo.viewMap[tabName].structName) {
                throw new Error("The function '" + viewInitFunc.name + "' is "
                    + "not returning objects of the type '"
                    + modDesc.viewInfo.viewMap[tabName].structName + "'.");
            }
            var ar = new Array();
            ar[0] = dataView;
            modDataView.elements = ar;
        }
    }
    else {
        dataView = viewInitFunc.call(modDesc.userPrivate, modDataView, tabArgs);
    }
    /* Add the view to the module's viewMap */
    modDesc.viewMap[tabName] = modDataView;

    var error = false;

    /* TODO - check for any errors and throw exception */
    for (var i = 0; i < modDataView.elements.length; i++) {
        var view = modDataView.elements[i];
        for (var p in view) {
            if (view.$status[p]) {
                /* Record status in the status table for reference */
                addStatusEntry(modName, tabName, "N/A", p, view.$status[p]);
                error = true;
            }
        }
    }
    /*
    if (throwScanErrors && error && !tabName.match("Scan for")) {
        throw (new Error("ROV detected errors in scan of '" + tabName +
                         "' tab for module " + modName + "."));
    }
    */
    return (modDataView);
}

/*
 *  ======== runViewInit ========
 *  Process the view init code for the given descriptor and tabName.
 *  Returns false if any of the status fields report an error, returns true
 *  otherwise.
 *
 *  This function is only used for instance and module type views.
 */
function runViewInit(mod, desc, tabName, type, tabArgs)
{
    /* Check for abort flag before running view function */
    if (Model.getICallBackInst().getAbortFlag()) {
        throw (new Error("abort"));
    }

    /* Check if the view has already been scanned by scanHandle */
    if (desc.viewMap[tabName] != undefined) {
        var view = desc.viewMap[tabName];
        for (var p in view.$status) {
            if (view.$status[p]) {
                return (false);
            }
        }
        return (true);
    }

    /* Create an empty view */
    var view = newViewStruct(mod.name, tabName);

    /* Add the address field to the view structure */
    view.$$bind("address", String(desc.addr));
    view.$status["address"] = null;

    /* Get the view$init function from the capsule */
    var viewInitFunc = getViewInitFunc(mod, tabName);

    try {
        /*
         * Run from the context of an object the module writer can assign
         * stuff to.
         */
        var state = desc.state == null ? {} : desc.state;
        viewInitFunc.call(mod.userPrivate, view, state, tabArgs);
    }
    catch (e) {
        var exception = "Caught exception in view init code: " + Program.exToString(e);

        /* Add the exception to the descriptor so that it can be displayed */
        desc.errorMap[tabName] = exception;

        debugPrint("xdc.rov.Program: " + exception);

        /* Record the exception in the status table for reference */
        addStatusEntry(mod.name, tabName, getInstLabel(desc, view), "N/A", exception);
    }

    /*
     * Check abort flag again in case the view function caught the
     * abort signal.
     */
    if (Model.getICallBackInst().getAbortFlag()) {
        throw (new Error("abort"));
    }

    /* Add the view to the descriptor's viewMap */
    desc.viewMap[tabName] = view;

    /*
     * Check if there were any errors reported on any fields.
     * Add any errors to the status table, and return 'false' to indicate
     * errors are present.
     */
    var noErrors = true;
    for (var p in view.$status) {
        if (view.$status[p]) {
            /* Record the status in the status table for reference */
            addStatusEntry(mod.name, tabName, getInstLabel(desc, view), p, view.$status[p]);

            noErrors = false;
        }
    }
    return (noErrors);
}

/*
 *  ======== scanHandleView ========
 *  This function is called to scan a module from a different module's
 *  view$init code.
 *  Returns the instance object with the attached $viewMap.
 */
function scanHandleView(modName, instAddr, args)
{
    var tabName = _getTabName(args);
    var tabArgs = _getTabArgs(args);
    var mod = this.getModuleDesc(modName);

    /* Read in the handle's instance state */
    var inst = this.stateReader.fetchHandleState(mod, Number(instAddr));

    /* Check if the view has already been scanned */
    if (inst.viewMap[tabName] != undefined) {
        return (inst.viewMap[tabName]);
    }

    runViewInit(mod, inst, tabName, "instance", tabArgs);

    /* Return the inst object since they would have to go find it otherwise */
    return (inst.viewMap[tabName]);
}

/*
 *  ======== scanRawView ========
 */
function scanRawView(modName)
{
    /* Get the module from cache or useModule */
    var mod = this.getModuleDesc(modName);

    /* Move the state data into a RawView structure to return */
    var Program = xdc.useModule('xdc.rov.Program');
    var rawView = new Program.RawView;

    /*
     * Make sure the module state is read in.
     * Returns immediately if the state is already scanned, and returns null
     * if the module does not have module state.
     */
    this.stateReader.fetchModuleState(mod);

    rawView.modState = mod.state;

    /*
     * Scan in the instance state structures. Returns immediately
     * if they were already scanned.
     */
    if ('Instance_State' in mod.useMod) {
        this.stateReader.fetchAllInstStates(mod);

        var instStates = new Array();
        /* Add all of the instances... */
        for each (var inst in mod.instances) {
            instStates[instStates.length] = inst.state;
        }

        rawView.instStates = instStates;
    }

    rawView.modCfg = mod.cfg;

    return (rawView);
}

/*
 *  ======== scanObjectView ========
 *  When this function returns, the object that was passed in will now have
 *  a $viewMap field attached where the view can be accessed.
 */
function scanObjectView(modName, obj, args)
{
    var tabName = _getTabName(args);
    var tabArgs = _getTabArgs(args);

    /* Get the module from cache or useModule */
    var mod = this.getModuleDesc(modName);

    /* Verify the module supports the requested tab */
    if (!modSupportsTab(modName, tabName)) {
        throw (new Error("Module does not support the requested view level"));
    }
    if (!('Instance_State' in mod.useMod)) {
        throw(new Error("Calling scanInstance on module that does not support instances"));
    }

    var objDesc = this.stateReader.getInstDesc(mod, obj, -1);

    /* Check if the view has already been scanned */
    if (objDesc.viewMap[tabName] != undefined) {
        /* Before returning it, check if there were any problems */
        var view = objDesc.viewMap[tabName];
        if (throwScanErrors) {
            for (var field in view.$status) {
                if (view.$status[field]) {
                    throw (new Error("ROV detected errors in scan of '"
                                     + tabName
                                     + "' tab for module " + modName + "."));
                }
            }
        }
        return (view);
    }

    /* Create an empty view */
    var view = newViewStruct(modName, tabName);

    /* Add the address field */
    view.$$bind("address", String(obj.$addr));
    view.$status["address"] = null;

    /* Get the view$init function from the capsule */
    var viewInitFunc = getViewInitFunc(mod, tabName);

    /* Call view init */
    viewInitFunc.call(mod.userPrivate, view, obj, tabArgs);

    /* Add the view to the instance's viewMap */
    objDesc.viewMap[tabName] = view;

    // TODO - Check view status before returning.

    /* Return the descriptor directly so user doesn't have to search for it */
    return (view);
}

/*
 *  ======== scanTreeTableView ========
 */
function scanTreeTableView(modName, args)
{
    return (scanTreeView.call(this, modName, args));
}

/*
 *  ======== scanTreeView ========
 *  TODO - This function is currently identical to scanTreeTableView.
 */
function scanTreeView(modName, args)
{
    var tabName = _getTabName(args);
    var tabArgs = _getTabArgs(args);

    /* Get the module from cache or useModule */
    var modDesc = this.getModuleDesc(modName);

    /* Verify the module supports the requested tab */
    if (!modSupportsTab(modName, tabName)) {
        throw (new Error("Module does not support the requested view level"));
    }

    /* Check if the view has already been scanned */
    if (modDesc.viewMap[tabName] != undefined) {
        /* TODO: Before returning check for errors; throw exception if found */
        return (modDesc.viewMap[tabName]);
    }

    var viewInitFunc = getViewInitFunc(modDesc, tabName);

    /*
     * If the view code throws an exception, let it propagate up and be
     * displayed to the user. This means the user won't see any partial data
     * if there is any, but there's no other logical place to display the
     * exception message.
     */
    var treeView = viewInitFunc.call(modDesc.userPrivate, tabArgs);

    if (modDesc.cfg == null) {
        /* Pure c modules return pure JavaScript arrays or objects */
        var realView = new Program.TreeNodeArr();
        realView.length++;
        realView[0] = new Program.TreeNode();
        if (treeView.$label != undefined) {
            realView[0].label = treeView.$label;
        }
        else {
            realView[0].label = tabName;
        }

        if (treeView instanceof Array) {
            //viewObj[0].properties = new Array();
            for (var i = 0; i < treeView.length; i++) {
                realView[0].properties[realView[0].properties.length++] =
                    treeView[i];
            }
        }
        else {
            realView[0].properties[realView[0].properties.length++] =
                    treeView;
        }
        treeView = realView;
    }

    /* Add the view to the module's viewMap */
    modDesc.viewMap[tabName] = treeView;

    if (!("$status" in treeView)) {
        return (treeView);
    }

    for (var p in treeView.$status) {
        if (treeView.$status[p]) {
            /* Record the status in the status table for reference */
            addStatusEntry(modName, tabName, "N/A", p, treeView.$status[p]);
        }
    }

    /* TODO - check for any errors and throw exception */
    /*
    if (error) {
        throw (new Error("ROV detected errors in scan of '" + tabName +
                         "' tab for module " + modName + "."));
    }
    */
    return (treeView);
}

/*
 *  ======== modSupportsTab ========
 *  Returns true if the module supports the given tab.
 */
function modSupportsTab(modName, tabName)
{
    var mod = this.getModuleDesc(modName);

    if (mod.viewInfo == null) {
        return (false);
    }

    return (tabName in mod.viewInfo.viewMap);
}

/*
 *  ======== getViewInitFunc ========
 *  Retrieves the function associated with the specified tabName for the
 *  specified mod.
 */
function getViewInitFunc(mod, tabName)
{
    var funcName = mod.viewInfo.viewMap[tabName].viewInitFxn;

    if (!(funcName in mod.useMod.$capsule)) {
        throw (new Error("The viewInitFxn '" + funcName
                         + "' specified for " + mod.name
                         + " - " + tabName + " does not exist."));
    }

    return (mod.useMod.$capsule[funcName]);
}

/*
 *  ======== addCMod ========
 */
function addCMod(cmod)
{
    var ViewInfo = xdc.useModule('xdc.rov.ViewInfo');
    var mod = new Program.ROVModuleDesc;
    mod.name = cmod.name;
    mod.viewInfo = ViewInfo.create();
    mod.cfg = null; // this is how we know it's not a RTSC module
    mod.viewInfo.showRawTab = false;
    mod.loadFailed = false;
    mod.useMod = {};
    mod.useMod.$capsule = cmod.capsule;
    if (cmod.viewMap.length > 0) {
        for (var i = 0; i < cmod.viewMap.length; i++) {
            var vMap = new Array();
            //var vMap = {};
            if (cmod.viewMap[i].viewType == undefined) {
                vMap["type"] = ViewInfo.MODULE_DATA;
            }
            else if (cmod.viewMap[i].viewType == "Table") {
                vMap["type"] = ViewInfo.MODULE_DATA;
            }
            else if (cmod.viewMap[i].viewType == "Pages") {
                vMap["type"] = ViewInfo.INSTANCE_DATA;
            }
            else {
                throw new Error("The property viewType for the view '"
                    + cmod.viewMap[i].name + "' in '" + cmod.capsule.$path
                    + "' must be either 'Table' or 'Pages'.");
            }
            vMap["viewInitFxn"] = cmod.viewMap[i].fxn;
            vMap["structName"] = cmod.viewMap[i].structName;
            vMap["argsName"] = cmod.viewMap[i].argsName;
            mod.viewInfo.viewMap[cmod.viewMap[i].name] = vMap;
            if (cmod.viewMap[i].structName in cmod.capsule) {
                mod.useMod[cmod.viewMap[i].structName] =
                    cmod.capsule[cmod.viewMap[i].structName];
            }
            else {
                throw new Error(
                  "The definition for " + cmod.viewMap[i].structName
                  + " is not found in " + cmod.capsule.$path);
            }

            /* Check if we already encountered this structure. Nothing is
             * stopping two different views sharing the same view structure.
             */
            var pt = mod.useMod[cmod.viewMap[i].structName].prototype;
            if (!("$status" in pt)) {
                /* Create the status map and bind it to the struct */
                var status = new Object();
                for (var p in new mod.useMod[cmod.viewMap[i].structName]()) {
                    status[p] = null;
                }

                Object.freeze(status);
                /* $status is intentionally not enumerable and not writable to
                 * prevent adding it as a column later. Object.freeze() above
                 * was added because to prevent changing values in '$status',
                 * while 'writable' prevents assigning something else to
                 * '$status'.
                 * The property $status is added to the prototype to serve as a
                 * default that is used only if no error was reported by calling 
                 * Program.displayError().
                 */
                Object.defineProperty(pt, "$status",
                    {enumerable: false, writable: false, value: status});
            }
        }
    }
    if (cmod.argsMap && cmod.argsMap.length > 0) {
        for (var ki = 0; ki < cmod.argsMap.length; ki++) {
            var args = cmod.argsMap[ki];
            mod.viewInfo.argsMap[args.name] = {description: args.description, args: args.args};
        }
    }
    cmodTab[mod.name] = mod;
}

/*
 *  ======== getModuleDesc ========
 *  Gets the module from the cache or brings it in.
 */
function getModuleDesc(modName)
{
    if (cmodTab[modName]) {
        return (cmodTab[modName]);
    }
    if (modName.indexOf('.') == -1 && cmodTab["C." + modName]) {
        return (cmodTab["C." + modName]);
    }
    /* If the module has already been brought in, just return it */
    if (modTab[modName]) {
        return (modTab[modName]);
    }

    /*
     * $modules maps module names to their configurations. This comes from the
     * ROV recap file; if a module is not in this map, then it is not in this
     * application.
     */
    var modCfg = Program.$modules[modName];
    if (!modCfg) {
        throw (new Error("Module " + modName
            + " does not exist in the application's configuration"));
    }

    var mod = new Program.ROVModuleDesc;

    /* Initialize fields */
    mod.name = modName;
    mod.instMap = {};
    mod.readAllAddrs = false;

    /*
     * Place for users to store data. This is the calling context of view init
     * functions.
     */
    mod.userPrivate = {};

    /* Add the module's configuration to it as $config */
    mod.cfg = modCfg;

    /* Bring in the module */
    try {
        mod.loadFailed = false;

        mod.useMod = xdc.useModule(modName);
    }
    catch (e) {
        mod.loadFailed = true;
        mod.loadFailedMsg = String(e);
        mod.viewInfo = null;
        /* Store the module in our cache */
        modTab[modName] = mod;

        return (mod);
    }

    /*
     * Updated the structure size information based on whether this module
     * has named instances. This should only be done once, so check
     * allModsRead.
     */
    if (!this.$private.allModsRead
            && ('Instance_State' in mod.useMod)
            && modCfg.common$.namedInstance
            && !("__name" in xdc.om[modName + '$$Instance_State'])) {

        /* add the __name property to the module's $$Instance_State object */
        var po = xdc.om[modName + '$$Instance_State'];
        po.$$fld('__name', $$PAdr('xdc_runtime_Types_CordAddr__*', 'PE'),
            undefined, 'w');

        /*
         * Modules with instances but no Instance_State structure won't
         * have $$sizes. We catch these in the decoder by seeing that
         * Instance_State does not have a $sizeof field and we just return
         * an empty object.
         */
        if ('$$sizes' in mod.useMod.Instance_State) {
            mod.useMod.Instance_State.$$sizes.push(['__name', 'UPtr']);
        }
    }

    /* Retrieve the ROV ViewInfo for the module */
    var modSpec = mod.useMod.$spec;
    var facetConfig = modSpec.queryFacet('xdc.rov.ViewInfo');

    Program.debugPrint("Facet config for " + modName + " = " + facetConfig);

    /* Set viewInfo to null if this module does not have a ViewInfo facet */
    if (facetConfig == null) {
        mod.viewInfo = null;
    }
    else {
        mod.viewInfo = mod.cfg[facetConfig];
        if (mod.viewInfo == null) {
            /*  should only happen if version of module used at config time
             *  is different from the module found by ROV
             */
            Program.debugPrint(
                "warning: xdc.rov.Program: no Config.ViewInfo facet for "
                + modName);
        }
    }

    /* Store the module in our cache */
    modTab[modName] = mod;

    return (mod);
}

/*
 *  ======== fetchStruct ========
 *  Fetches the specified structure from the target.
 */
function fetchStruct(desc, addr, addrCheck)
{
    return (Program.strDec.fetchStruct(xdc.om[desc.type], Number(addr),
                                       addrCheck));
}

/*
 *  ======== fetchArray ========
 *  Retrieves the specified array from the target.
 */
function fetchArray(desc, addr, len, addrCheck)
{
    return (Program.strDec.fetchArray(xdc.om[desc.type], Number(addr), len,
                                      desc.isScalar, addrCheck));
}

/*
 *  ======== _decodeBuffer ========
 *  Internal method to decode a primitive value from buffer
 *
 *  This method should never be directly called by code outside the xdc.rov
 *  package; future changes to an executables debug format will result in 
 *  compatibility breaks.
 *
 *  @param(buffer)     buffer with each element containing one MAU from memory
 *  @param(offset)     location in buffer where a primitive value starts
 *  @param(len)        size in MAUs
 *  @param(encoding)   one of the following Dwarf encodings (DW_AT_encoding)
 *                     0x01 DW_ATE_address
 *                     0x02 DW_ATE_boolean
 *                     0x04 DW_ATE_float
 *                     0x05 DW_ATE_signed
 *                     0x06 DW_ATE_signed_char
 *                     0x07 DW_ATE_unsigned
 *                     0x08 DW_ATE_unsigned_char
 *
 *                     The following encodings are not supported
 *                     0x03 DW_ATE_complex_float
 *                     0x09 DW_ATE_imaginary_float
 *                     0x0a DW_ATE_packed_decimal
 *                     0x0b DW_ATE_numeric_string
 *                     0x0c DW_ATE_edited
 *                     0x0d DW_ATE_signed_fixed
 *                     0x0e DW_ATE_unsigned_fixed
 *                     0x0f DW_ATE_decimal_float
 *                     0x10 DW_ATE_UTF
 *                     0x11 DW_ATE_UCS
 *                     0x12 DW_ATE_ASCII
 * @a(Returns) a scalor value (via `{@link StructureDecoder StructureDecoder._decodeScalar}`)
 */
function _decodeBuffer(buffer, offset, len, encoding)
{
    if (encoding < 1 || encoding > 8) {
        throw new Error("unsupported encoding for the location 0x" +
            Number(buffer).toString(16));
    }
    if (encoding == 3) {
        throw new Error("complex numbers are not supported - location 0x" +
            Number(buffer).toString(16));
    }

    var buf = {};
    buf.buffer = buffer;
    buf.off = offset;
    var type = {};
    type.align = 1;
    type.size = len;
    type.signed = false;
    if (encoding == 5 || encoding == 6) {
        type.signed = true;
    }
    type.isAddr = false;
    if (encoding == 1) {
        type.isAddr = true;
    }
    type.isEnum = false;
    if (encoding == 4) {
        if (type.size == 8) {
            type.fldType = "TDouble";
        }
        else if (type.size == 4) {
            type.fldType = "TFloat";
        }
    }
    return (Program.strDec._decodeScalar(type, buf));
}

/*
 *  ======== fetchVariableByPtr ========
 *  Dereferences a pointer variable and reads the content as the pointed-to type
 *
 */
function fetchVariableByPtr(varName)
{
    var javaType = Program.ofReader.getPtrType(varName);
    if (javaType == null) {
        throw new Error("'" + varName + "' is not a global variable, or its "
            + "type is not a pointer type.");
    }
    var typespec = _convertType(javaType);
    var addr = Program.lookupSymbolValue(varName);
    if (addr == -1) {
        throw new Error("Cannot determine the address for '" + varName + "'.");
    }
    var ptrSize = Model.$private.recap.build.target.stdTypes.t_Ptr.size;
    var ptdBuf = Model.getMemoryImageInst().readMaus(addr, ptrSize, false);
    var ptdLocation = _decodeBuffer(ptdBuf, 0, ptrSize, 1);
    var newObj = {};
    var buf = Model.getMemoryImageInst().readMaus(ptdLocation, typespec.size,
                                                  false);
    _createObject(buf, 0, typespec, newObj, "top");
    return (newObj["top"]);
}

/*
 *  ======== fetchFromAddr ========
 *  Reads a content from the address according to the spec for 'typeName'
 *
 */
function fetchFromAddr(addr, typeName, count)
{
    var typespec = Program.lookupType(typeName);
    if (typespec == null) {
        throw new Error("Type '" + typeName + "' can't be found");
    }
    if (count != null && count > 1) {
        var newAr = [];
        var buf = Model.getMemoryImageInst().readMaus(addr,
            typespec.size * count, false);
        for (var i = 0; i < count; i++) {
            var newObj = {};
            _createObject(buf, i * typespec.size, typespec, newObj, "top");
            newAr.push(newObj["top"]);
        }
        return (newAr);
    }
    var buf = Model.getMemoryImageInst().readMaus(addr, typespec.size, false);
    var newObj = {};
    _createObject(buf, 0, typespec, newObj, "top");
    return (newObj["top"]);
}

/*
 *  ======== fetchVariable ========
 *  Reads a variable from memory and returns a corresponding JavaScript object
 *
 */
function fetchVariable(varName)
{
    var typespec = Program.lookupTypeByVariable(varName);
    if (typespec == null) {
        throw new Error("Variable '" + varName + "' does not exist, or it is "
            + "not a global variable.");
    }

    var addr = Program.lookupSymbolValue(varName);
    if (addr == -1) {
        throw new Error("Cannot determine the address for '" + varName + "'.");
    }
    var buf = Model.getMemoryImageInst().readMaus(addr, typespec.size, false);
    var newObj = {};
    _createObject(buf, 0, typespec, newObj, "top");
    return (newObj["top"]);
}

/*
 *  ======== _createObject ========
 *  Internal method to create a JavaScript object representing a C object
 *
 *  This method should never be directly called by code outside
 *  the xdc.rov package; future changes to an executables debug format
 *  will result is compatibility breaks.
 *
 *  @param(buf)      buffer with each element containing one MAU from memory
 *  @param(offset)   offset in buffer of MAUs to be interpreted
 *  @param(typespec) type specification for the object from memory
 *  @param(prnt)     already created object to which a new object is added
 *  @param(name)     name for the new object within `prnt`
 *
 *  Typespec is a JavaScript object.
 */
 function _createObject(buf, offset, typespec, prnt, name)
{
    if (typespec.member == null) {
        prnt[name] = _decodeBuffer(buf, offset, typespec.size,
                                   typespec.encoding);
    }
    else if (typespec.elnum == null || typespec.elnum == 0) {
        prnt[name] = {};
        for (var prop in typespec.member) {
            var val = typespec.member[prop];
            _createObject(buf, offset + val.offset, val, prnt[name], prop);
        }
    }
    else if (typespec.elnum > 0) {
        prnt[name] = [];
        var elemspec = typespec.member[0];
        if (elemspec.encoding != 0) {
            for (var i = 0; i < typespec.elnum; i++) {
                prnt[name][i] = _decodeBuffer(buf, offset + i * elemspec.offset,
                    elemspec.size, elemspec.encoding);
            }
        }
        else {
            for (i = 0; i < typespec.elnum; i++) {
                _createObject(buf, offset + i * elemspec.offset, elemspec,
                             prnt[name], "temp");
                prnt[name][i] = prnt[name].temp;
                delete prnt[name].temp;
            }
        }
    }
}

/*
 *  ======== fetchString ========
 *  Retrieves the string starting at the specified address from the target.
 */
function fetchString(addr, addrCheck)
{
    return (Program.strReader.findString(Number(addr), addrCheck));
}

/*
 *  ======== fetchStaticString ========
 *  Retrieves the string at the specified address using an object file reader.
 */
function fetchStaticString(addr)
{
    return (Program.ofReader.findString(Number(addr)));
}

/*
 *  ======== getPrivateData ========
 */
function getPrivateData(modName) {
    var modDesc = this.getModuleDesc(modName);
    return (modDesc.userPrivate);
}

/*
 *  ======== getModuleConfig ========
 *  Returns the module config object for the requested module.
 */
function getModuleConfig(modName)
{
    return (this.getModuleDesc(modName).cfg);
}

/*
 *  ======== lookupFuncName ========
 */
function lookupFuncName(addr)
{
    var Model = xdc.useModule("xdc.rov.Model");
    var symInst = Model.getISymbolTableInst();
    var syms = symInst.lookupFuncName(Number(addr));

    return (filterSymbols(syms));
}

/*
 *  ======== lookupDataSymbol ========
 *  Uses the SymbolTable to find the labels at the given address.
 */
function lookupDataSymbol(addr)
{
    var Model = xdc.useModule("xdc.rov.Model");
    var symInst = Model.getISymbolTableInst();
    var syms = symInst.lookupDataSymbol(Number(addr));

    return (filterSymbols(syms));
}

/*
 *  ======== _convertType ========
 *  Converts a Java representation of a type (with HashMaps and inherited Java
 *  properties) to a simple JavaScript representation.
 *
 *  'javaType' is always a TypeSpec Java object.
 */
function _convertType(javaType) {
    var jsType = {};
    for (var prop in javaType) {
        /* these are the only properties, other than 'members', that we need
         * to copy from Java to JavaScript. They are all integers of various
         * sizes, and they can be easily copied to the JavaScript object.
         */
        if (prop == "elnum" || prop == "offset" || prop == "size"
            || prop == "encoding") {
            jsType[prop] = javaType[prop];
        }
        else if (prop == "members" && javaType.members != null) {
            var entrySet = javaType.members.entrySet().toArray();
            if (javaType.elnum != 0) {
                /* It's an array type, which means the only element in the map
                 * is a description of the array's element type.
                 */
                jsType.member = [];
                jsType.member[0] = _convertType(entrySet[0].getValue());
            }
            else {
                /* It's a structure, we need to copy each type description
                 * from 'members'.
                 */
                jsType.member = {};
                for (var i = 0; i < entrySet.length; i++) {
                    jsType.member[entrySet[i].getKey()]
                        = _convertType(entrySet[i].getValue());
                }
            }
        }
        else if (prop == "members") {
            jsType.member = null;
        }
    }
    return (jsType);
}

/*
 *  ======== lookupType ========
 */
function lookupType(typename)
{
    var javaType = Program.ofReader.getType(typename);
    if (javaType == null) {
        /* try one of the standard C99 types */
        var typespec = _c99Type(typename);
        if (typespec == null) {
            return null;
        }
        /* typespec is already a native JavaScript object, no need to call
         * _convertType.
         */
        return (typespec)
    }
    else {
        return (_convertType(javaType));
    }
}

/*
 *  ======== lookupTypeByVariable ========
 */
function lookupTypeByVariable(name)
{
    var javaType = Program.ofReader.getTypeByVariable(name);
    if (javaType == null) {
        return (null);
    }
    var jsType = _convertType(javaType);
    return (jsType);
}

/*
 *  ======== filterSymbols ========
 *  Helper function used by lookupFuncName and lookupDataSymbol.
 *  There may be multiple symbols at a given address. To improve the chances
 *  of the first symbol in the array being the correct one:
 *    - Sort the symbols by length (shorter symbol is more likely correct)
 *    - Move any symbols containing '$' to the end
 */
function filterSymbols(jSyms)
{
    if (String(jSyms) != "null") {
        jSyms = java.util.Arrays.asList(jSyms).get(0);
    }
    else {
        jSyms = null;
    }

    if (jSyms == null || jSyms.length == 0) {
        return (new Array());
    }

    /*
     * Copy the Java String array to a JavaScript array. Filter out any symbols
     * containing '$' and store these separately.
     */
    var symsArr = new Array();
    var dSyms = new Array();
    for each (var sym in jSyms) {
        if (sym.indexOf("$") != -1) {
            dSyms.push(sym);
        }
        else {
            symsArr.push(sym);
        }
    }

    /*
     * Sort the array by symbol length, from smallest to largest. In general,
     * user given names are shorter than generated symbols.
     */
    function compare(a, b) {
        return (a.length - b.length);
    }

    symsArr.sort(compare);
    dSyms.sort(compare);

    /* Add the '$' symbols back on to the end */
    return(symsArr.concat(dSyms));
}

/*
 *  ======== lookupSymbolValue ========
 */
function lookupSymbolValue(symName)
{
    var Model = xdc.useModule("xdc.rov.Model");
    var symInst = Model.getISymbolTableInst();
    return (symInst.getSymbolValue(symName));
}

/*
 *  ======== getSymbolValue ========
 */
function getSymbolValue(symName)
{
    var Model = xdc.useModule("xdc.rov.Model");
    var symInst = Model.getISymbolTableInst();
    return (symInst.getSymbolValue(symName));
}

/*
 *  ======== displayError ========
 *
 */
function displayError(view, fieldName, errorMsg)
{
    if (!(fieldName in view)) {
        throw (new Error("Trying to set error for field '" + fieldName +
                         "' which does not exist in this view. The error " +
                         "message was: " + errorMsg));
    }

    if ("hasOwnProperty" in view && view.hasOwnProperty("$status") != true) {
        var status = new Object();
        for (var p in view) {
            status[p] = null;
        }
        Object.defineProperty(view, "$status",
                {enumerable: false, value: status, writable: true});
    }
    view.$status[fieldName] = errorMsg;
}

/*
 *  ======== ptrToHex ========
 */
function ptrToHex(ptr)
{
    return ('0x' + String(ptr).substr(1));
}

/*
 *  ======== getShortName ========
 *  Parses canonical name for short name, returns either short name
 *  or empty string "".
 */
function getShortName(name)
{
    /* Example: ti.sysbios.knl.Task@8000c5e9:myTsk0 */
    var index;
    if ((index = name.indexOf(':')) != -1) {
        return (name.substring(index + 1, name.length));
    }

    return ("");
}

var traceEnable;

/*
 *  ======== debugPrint ========
 */
function debugPrint(msg)
{
    if (traceEnable === undefined) {
        /* XDC_ROV_TRACE has to be set outside of CCS for ROV to get its
         * value. Anything else will work for classic ROV but not for the
         * current version.
         */
        traceEnable = xdc.jre.java.lang.System.getProperty("xdc.rov.traceEnable");
        if (traceEnable == null) {
            traceEnable = xdc.jre.java.lang.System.getenv("XDC_ROV_TRACE");
        }
    }

    if (traceEnable == "true") {
        print("[Server    ] " + msg);
    }
}

/*
 *  ======== print ========
 */
function print(msg)
{
    try {
        var Monitor = xdc.module("xdc.rov.runtime.Monitor");
        Monitor.println(msg);
    }
    catch (e) {
        ; /* ignore missing Monitor */
    }

    xdc.global.print(msg);
}

/*
 *  ======== timestamp ========
 */
function timestamp(msg) {
    if (timestampFunc != undefined) {
        timestampFunc(msg);
    }
    else {
        var time = xdc.jre.java.lang.System.currentTimeMillis();
        Program.debugPrint("+++ (" + time + "ms) " + msg);
    }
}

/*
 *  ======== setTimestampFunc ========
 */
function setTimestampFunc(func)
{
    timestampFunc = func;
}

/*
 *  ======== resetMods ========
 */
function resetMods()
{
    modTab = new Object();
    statusTab = new Array();
    /* For C modules, we can't just create a new cmodTab because we don't have
     * rov.js files available to recreate it. Instead, we delete these modules'
     * views from cache.
     */
    for (var cmod in cmodTab) {
        for (var prop in cmodTab[cmod].viewMap) {
            delete cmodTab[cmod].viewMap[prop];
        }
    }
}

/*
 *  ======== setThrowViewErrors ========
 */
function setThrowViewErrors(flag)
{
    throwScanErrors = flag;
}

/*
 *  ======== exToString ========
 */
function exToString(e)
{
    /* Don't include the file name and line number if they're not present */
    if ((e.message == undefined) || (e.fileName == undefined)
        || (e.fileName == "")) {
        return("" + e);
    }
    else {
        return('"' + e.fileName + '", line ' + e.lineNumber + ': ' + e.message);
    }
}

/*
 *  ======== moduleIdToName ========
 */
function moduleIdToName(mid)
{
    var Registry = xdc.useModule('xdc.runtime.Registry');

    if (Registry.isMemberRov(mid)) {
        return (Registry.lookupModIdRov(mid));
    }

    var modCfg = this.$modules['#' + mid];

    return !modCfg ? null : modCfg.$name;
}

/*
 *  ======== addStatusEntry ========
 */
function addStatusEntry(mod, tab, inst, field, message)
{
    var status = new Program.StatusEntry();

    status.mod = mod;
    status.tab = tab;
    status.inst = inst;
    status.field = field;
    status.message = message;

    statusTab[statusTab.length] = status;
}

/*
 *  ======== getStatusTable ========
 */
function getStatusTable()
{
    return (statusTab);
}

/*
 *  ======== getInstLabel ========
 *  Returns something to display in the 'inst' field of the status table for
 *  the given view object.
 */
function getInstLabel(desc, view)
{
    var Program = xdc.useModule('xdc.rov.Program');

    /* If desc is a module descriptor, the inst field is "N/A" */
    if (desc.$type.equals("xdc.rov.Program.ROVModuleDesc")) {
        return ("N/A");
    }

    /* If a 'label' was specified, just return that */
    if (('label' in view) &&
        (view.label != null) &&
        (view.label != undefined) &&
        (view.label != "")) {
        return (view.label);
    }

    /* Otherwise, return the handle address in parentheses */
    return ("(0x" + Number(view.address).toString(16) + ")");
}

/*
 *  ======== _c99Type ========
 *  Returns a typespec for most of the standard C99 types. This function is
 *  called if the description of the type is not available in .dwarf_info.
 */
function _c99Type(typename) {
    var spec = {
        size: null,
        encoding: null,
        member: null,
        offset: null,
        elnum: null
    };

    var elfTarget = Program.ofReader.getTarget();
    var stdTypes = Program.build.target.stdTypes;
    switch (typename) {
        case "uint8_t":
            if (elfTarget.charsize > 1) {
                return (null);
            }
            spec.encoding = 7;
            spec.size = 1;
            return (spec);
        case "int8_t":
            if (elfTarget.charsize > 1) {
                return (null);
            }
            spec.encoding = 5;
            spec.size = 1;
            return (spec);
        case "uint16_t":
            spec.encoding = 7;
            spec.size = 16/(elfTarget.charsize * 8);
            return (spec);
        case "int16_t":
            spec.encoding = 5;
            spec.size = 16/(elfTarget.charsize * 8);
            return (spec);
        case "uint32_t":
            spec.encoding = 7;
            spec.size = 32/(elfTarget.charsize * 8);
            return (spec);
        case "int32_t":
            spec.encoding = 5;
            spec.size = 32/(elfTarget.charsize * 8);
            return (spec);
        case "uint64_t":
            spec.encoding = 7;
            spec.size = 64/(elfTarget.charsize * 8);
            return (spec);
        case "int64_t":
            spec.encoding = 5;
            spec.size = 64/(elfTarget.charsize * 8);
            return (spec);

        case "uint_least8_t":
            spec.encoding = 7;
            spec.size = stdTypes.t_Int8.size;;
            return (spec);
        case "int_least8_t":
            spec.encoding = 5;
            spec.size = stdTypes.t_Int8.size;
            return (spec);
        case "uint_least16_t":
            spec.encoding = 7;
            spec.size = stdTypes.t_Int16.size;
            return (spec);
        case "int_least16_t":
            spec.encoding = 5;
            spec.size = stdTypes.t_Int16.size;
            return (spec);
        case "uint_least32_t":
            spec.encoding = 7;
            spec.size = stdTypes.t_Int32.size;
            return (spec);
        case "int_least32_t":
            spec.encoding = 5;
            spec.size = stdTypes.t_Int32.size;
            return (spec);
        case "uint_least64_t":
            spec.encoding = 7;
            spec.size = stdTypes.t_Int64.size;
            return (spec);
        case "int_least64_t":
            spec.encoding = 5;
            spec.size = stdTypes.t_Int64.size;
            return (spec);
        case "unsigned char":
        case "char":
            /* This is implementation specific for "char". It is an unsigned
             * encoding because that's how it is on Arm.
             */
            spec.encoding = 8;
            spec.size = stdTypes.t_Char.size;
            return (spec);
        case "signed char":
            spec.encoding = 6;
            spec.size = stdTypes.t_Char.size;
            return (spec);
        case "unsigned short":
            spec.encoding = 7;
            spec.size = stdTypes.t_Short.size;
            return (spec);
        case "signed short":
        case "short":
            spec.encoding = 5;
            spec.size = stdTypes.t_Short.size;
            return (spec);
        case "unsigned":
        case "unsigned int":
            spec.encoding = 7;
            spec.size = stdTypes.t_Int.size;
            return (spec);
        case "signed int":
        case "int":
            spec.encoding = 5;
            spec.size = stdTypes.t_Int.size;
            return (spec);
        case "unsigned long":
        case "unsigned long int":
            spec.encoding = 7;
            spec.size = stdTypes.t_Long.size;
            return (spec);
        case "signed long":
        case "long":
        case "long int":
            spec.encoding = 5;
            spec.size = stdTypes.t_Long.size;
            return (spec);
        case "unsigned long long":
        case "unsigned long long int":
            spec.encoding = 7;
            spec.size = stdTypes.t_LLong.size;
            return (spec);
        case "signed long long":
        case "long long":
        case "long long int":
            spec.encoding = 5;
            spec.size = stdTypes.t_LLong.size;
            return (spec);
        case "float":
            spec.encoding = 4;
            spec.size = stdTypes.t_Float.size;
            return (spec);
        case "double":
            spec.encoding = 4;
            spec.size = stdTypes.t_Double.size;
            return (spec);
        case "long double":
            spec.encoding = 4;
            spec.size = stdTypes.t_LDouble.size;
            return (spec);
        case "uintptr_t":
            spec.encoding = 7;
            spec.size = stdTypes.t_IArg.size;
            return (spec);
        case "intptr_t":
            spec.encoding = 5;
            spec.size = stdTypes.t_IArg.size;
            return (spec);
        case "size_t":
            spec.encoding = 7;
            spec.size = stdTypes.t_SizeT.size;
            return (spec);
        default:
            return (null);
    }
}

/*
 *  ======== _getTabArgs ========
 *  Extract optional arguments from parameters passed to get a view
 */
function _getTabArgs(args)
{
    var k = args.indexOf(':');
    return (k < 0 ? undefined : args.substr(k + 1));
}

/*
 *  ======== _getTabName ========
 *  Extract view name from parameters passed to get a view
 */
function _getTabName(args)
{
    var k = args.indexOf(':');
    return (k < 0 ? args : args.substr(0, k));
}
/*
 *  @(#) xdc.rov; 1, 0, 1,0; 10-3-2020 15:24:48; /db/ztree/library/trees/xdc/xdc-K04/src/packages/
 */

