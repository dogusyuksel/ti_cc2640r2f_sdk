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

/*!
 *  ======== Model ========
 *  The ROV Model is the core of ROV. The Model must be started in order to
 *  retrieve ROV views for any modules.
 *
 *  The Model has a compatibility key. Any changes or additions to the public
 *  interfaces of the ROV core will result in a bump of the model version
 *  number.
 */
metaonly module Model {

    /*!
     *  ======== vers ========
     *  ROV API version number
     *
     *  Model.start will throw an exception if the version parameter does not
     *  equal the Model's current version. The version number is changed based
     *  on modifications to the public APIs (in xdc.rov.Program) that would
     *  potentially break compatibility with clients.
     *
     *  This allows the Model to verify compatibility with its client.
     */
    config Int vers = 5;

    /*!
     *  ======== start ========
     *  Start the ROV Model
     *
     *  The ROV Model requires instances of an ISymbolTable, an IMemoryImage,
     *  and an ICallBack. It also requires the ROV recap file, which can be
     *  located using the xdc.rta.Recap module.
     *
     *  ROV tools initialize the ROV model as follows:
     *  @p(nlist)
     *      - `recap = getRecap(exec)`
     *      - `getIOFReaderInst()` (optional)
     *      - `start(..., exec, ..., recap, ...)`
     *      - `setICallStackInst()` (optional)
     *  @p
     *
     *  @param(vers)  Model.start will throw an exception if the version
     *                parameter does not equal the Model's current
     *                `{@link #vers version}`.
     *
     *  @param(executable) The path to the executable file
     *
     *  @param(recap) Capsule of the ROV recap file. Retrieve this with
     *                `xdc.loadCapsule(recapFilePath)`.
     *
     *  @param(sym)   an object that implements the xdc.rov.ISymbolTable
     *                interface used to read symbols defined by the
     *                executable
     *
     *  @param(mem)   an object that implements the `xdc.rov.IMemoryImage`
     *                interface used to read target memory
     *
     *  @param(callBack) an object that implements the `xdc.rov.ICallback`
     *                   interface used to report progress status
     */
    Void start(Int vers, String executable, Any recap,
               ISymbolTable.Instance sym, Any mem, ICallBack.Instance callBack);

    /*!
     *  ======== getICallStackInst ========
     *  Called by clients to get the optional call stack parser.
     *
     *  @a(returns)
     *  Returns `null` in the event that there is no call stack parser; i.e.,
     *  there is no implementation of this functionality in the current
     *  `{@link Model}` context.
     */
    ICallStack.Instance getICallStackInst();

    /*!
     *  ======== setICallStackInst ========
     *  Called only during Model initialization
     *
     *  This method is called to "bind" an optional stack call stack parser
     *  and is called by the same client that calls
     * `{@link #start Model.start()}`.
     */
    void setICallStackInst(ICallStack.Instance cs);

    /*!
     *  ======== getISymbolTableInst ========
     *  Get the symbol table reader use in the model
     *
     *  This function must be called after `start()`.
     *
     *  @a(returns)
     *  Returns the `ISymbolTable` instance that is used by ROV to lookup
     *  symbolic names for addresses or values of named symbols.
     */
    ISymbolTable.Instance getISymbolTableInst();

    /*!
     *  ======== getMemoryImageInst ========
     *  Get the memory reader of a started ROV model
     *
     *  This function must be called after `start()`.
     *
     *  @a(returns)
     *  Returns the `IMemoryImage` instance used by ROV to read target memory.
     */
    function getMemoryImageInst();

    /*!
     *  ======== getICallBackInst ========
     *  Get the progress update callback of a started ROV model
     *
     *  This function must be called after `start()`.
     *
     *  @a(returns)
     *  Returns the `ICallback` instance that is used by ROV to report
     *  progress during startup of the ROV model.
     */
    ICallBack.Instance getICallBackInst();

    /*!
     *  ======== getIOFReaderInst ========
     *  Returns a Java-based object file reader specific to the executable
     *
     *  This function is an internal function used to obtain
     *  the underlying OMF reader that is typically used to implement
     *  `ISymbolTable`.
     *
     *  Note: this function must be called AFTER either `getRecap()`
     *  or `start()`
     *
     *  The OMF reader is used by ROV tools extract target information
     *  from executable; normally this information is specified by the
     *  RTSC config recap file but, if it's absent, it may be possible
     *  to get the information from the executable itself.  It is also
     *  used to perform advanced symbol table management; e.g., adding
     *  additional symbols from object files representing code in a
     *  device's ROM.
     *
     *  @a(returns)
     *  Returns a reference to an internal executable-specific Object
     *  Module Format (OMF) reader.
     */
    function getIOFReaderInst();

    /*!
     *  ======== getModuleList ========
     *  Get all modules configured for the executable used to start ROV
     *
     *  @a(returns)
     *  This function returns a JavaScript object representing the package
     *  hierarchy and the modules, including the views they support.
     */
    Any getModuleList();

    /*!
     *  ======== getRecap ========
     *  Finds and loads the recap file associated with a specified executable
     *
     *  The recap file is a serialization of the executable's
     *  configuration created implicitly by the RTSC configuration
     *  tool.
     *
     *  This function finds that file and loads the recap file via
     *  `xdc.loadCapsule()`.  In addition, using the target information
     *  contained in the recap file, this function initializes an
     *  appropriate binary Object mMdule Format (OMF) reader which is
     *  used by some ROV tools to provide enhanced functionality; e.g.,
     *  support for multiple symbol table files.
     *
     *  @param(execPath) full path to the executable
     *
     *  @a(returns)
     *  The return value is the capsule returned by `xdc.loadCapsule()`
     *  after loading the recap file.
     */
    function getRecap(execPath);

    /*!
     *  ======== getStartFileList ========
     *  Get an array of all input files used to startup the model
     *
     *  This function is used to generate a list of all files
     *  needed to re-create the ROV model outside any IDE.
     *
     *  Note: this list does NOT include files referenced by these startup
     *  files.  All referenced files are found along the package path which
     *  must be separately specified.
     *
     *  @a(returns)
     *  Returns an array of absolute paths of files read during the startup
     *  of the ROV model.
     */
    Any getStartFileList();
}
/*
 *  @(#) xdc.rov; 1, 0, 1,0; 10-3-2020 15:24:48; /db/ztree/library/trees/xdc/xdc-K04/src/packages/
 */

