/* 
 *  Copyright (c) 2008-2020 Texas Instruments Incorporated
 *  This program and the accompanying materials are made available under the
 *  terms of the Eclipse Public License v1.0 and Eclipse Distribution License
 *  v. 1.0 which accompanies this distribution. The Eclipse Public License is
 *  available at http://www.eclipse.org/legal/epl-v10.html and the Eclipse
 *  Distribution License is available at
 *  http://www.eclipse.org/org/documents/edl-v10.php.
 *
 *  Contributors:
 *      Texas Instruments - initial implementation
 * */
/*
 *  ======== Core.xdc ========
 */

package xdc.runtime;

/*!
 *  ======== Core ========
 *  Core instance lifecycle support
 *
 *  The methods defined in this module are called by code that is generated at
 *  the configuration time by the `xdc.services.internal.gen` package.
 *
 *  For every module that supports instance objects, the generated .c
 *  file contains the body of the constructors and destructors for all
 *  instance objects, the generated .h file contains static inline
 *  functions that call these bodies with a few extra parameters (e.g.,
 *  the size of parameter structs).
 *
 *  @_nodoc
 */
@DirectCall

module Core {

    /*!
     *  ======== A_initializedParams ========
     *  Uninitialied parameters structure
     *
     *  This `Assert.Id` is thrown when the generated instance constructor
     *  detects that the instance parameters have not been properly
     *  initialized (by calling the module's `<Mod>_Params_init()` method).
     */
    /* REQ_TAG(SYSBIOS-878), REQ_TAG(SYSBIOS-879) */
    config Assert.Id A_initializedParams = {
        msg: "A_initializedParams: uninitialized Params struct"
    };

internal:

    /*
     *  ======== noAsserts ========
     *  C calls to Assert are removed through SYS/BIOS macros
     */
    metaonly config Bool noAsserts = false;

    /*
     *  ======== ObjDesc ========
     *  Instance object descriptor
     *
     *  This structure is generated for every module that supports instances.
     *  It is used by both create()/delete() and construct()/destruct()
     *  methods together with common code provided by this module to
     *  create/construct or delete/destruct instances.
     */
    struct ObjDesc {
        CPtr            fxnTab;     /* pointer to module fxns */
        Types.Link      *modLink;   /* link to runtime instances */
        SizeT           objAlign;   /* alignment of instance object */
        IHeap.Handle    objHeap;    /* heap where object is allocated from */
        SizeT           objName;    /* offset into obj for pointer to name */
        SizeT           objSize;    /* sizeof obj size (including header) */
        CPtr            prmsInit;   /* pointer to default init parameters */
        SizeT           prmsSize;   /* size of these default parameters */
    };

    const Int NOSTATE = -1;

    /*
     *  ======== assignLabel ========
     *  Fill-in a Text Label based on iname and whether instances have names
     *
     *  If names are disabled, iname == 0, and named == FALSE
     */
    /* REQ_TAG(SYSBIOS-875) */
    Void assignLabel(Types.Label *lab, Text.CordAddr iname, Bool named);

    /*
     *  ======== assignParams ========
     *  Common code for all Mod_Params_init()
     *
     *  @param(dstPrms) non-NULL pointer to module's Mod_Params
     *  @param(srcPrms) non-NULL pointer to parameter structure
     *  @param(mpsz)    sizeof module's "_Params" structure
     *  @param(ipsz)    sizeof module's base interface "_IInstance_Params"
     *                  struct
     */
    /* REQ_TAG(SYSBIOS-876) */
    Void assignParams(Ptr dstPrms, CPtr srcPrms, SizeT mpsz, SizeT ipsz);

    /*!
     *  ======== createObject ========
     *  Code invoked from Mod_create() and Proxy_create() functions
     *
     *  @param(od)        non-NULL pointer to a Mod-specific object "descriptor"
     *  @param(curObj)    unused - retained for backward compatibility
     *  @param(resPrms)   pointer to an uninitialized Mod_Params structure
     *  @param(argPrms)   pointer to a caller initialized Mod_Params structure
     *  @param(argPrmsSize)    unused - retained for backward compatibility
     *  @param(eb)        error block pointer
     *
     *  The caller must ensure that `od` is not a NULL pointer. Otherwise, this
     *  function may cause memory access violation.
     *
     *  The caller must ensure that either the parameter structure pointed to by
     *  `argPrms` is initialized by calling `Mod_Params_init()` method or that
     *  `argPrms` is set to NULL to request default parameter values. Otherwise,
     *  the assert `{@link #A_initializedParams}` will be raised.
     */
    /* REQ_TAG(SYSBIOS-871) */
    Ptr createObject(const ObjDesc *od, Ptr curObj, Ptr resPrms, CPtr argPrms,
                     SizeT argPrmsSize, Error.Block *eb);

    /*!
     *  ======== constructObject ========
     *  Code for static-only Mod_construct()
     *
     *  @param(od)        non-NULL pointer to a Mod-specific object "descriptor"
     *  @param(curObj)    non-NULL pointer to object to initialize
     *  @param(resPrms)   pointer to an uninitialized Mod_Params structure
     *  @param(argPrms)   pointer to a caller initialized Mod_Params structure
     *  @param(argPrmsSize)    unused - retained for backward compatibility
     *  @param(eb)        error block pointer
     *
     *  The caller must ensure that `od` and `curObj` are not NULL pointers.
     *  Otherwise, this function may cause memory access violation.
     *
     *  The caller must ensure that either the parameter structure pointed to by
     *  `argPrms` is initialized by calling `Mod_Params_init()` method or that
     *  `argPrms` is set to NULL to request default parameter values. Otherwise,
     *  the assert `{@link #A_initializedParams}` will be raised.
     */
    /* REQ_TAG(SYSBIOS-873) */
    Ptr constructObject(const ObjDesc *od, Ptr curObj, Ptr resPrms,
                        CPtr argPrms, SizeT argPrmsSize, Error.Block *eb);

    /*!
     *  ======== deleteObject ========
     *  Common code for all Mod_delete() and Mod_destruct()
     *
     *  This function can be called for both - objects initialized by
     *  `{@link #constructObject}` and objects created by
     *  `{@link #createObject}`. However, for the objects initialized by
     *  `{@link #constructObject}`, the parameter `consFlg` must be set to
     *  `TRUE`. Calling this function for such objects with `consFlg` set to
     *  `FALSE` will result in undefined behavior.
     */
    /* REQ_TAG(SYSBIOS-872) */
    Void deleteObject(const ObjDesc *od, Ptr curObj, Fxn finalFxn,
        Int istat, Bool consFlg);

    /*!
     *  ======== destructObject ========
     *  Code for static-only Mod_destruct()
     *
     *  This function must be called only for objects initialized by
     *  `{@link #constructObject}`. Calling this function for the objects
     *  created by `{@link #createObject}` will result in undefined behavior.
     */
    /* REQ_TAG(SYSBIOS-874) */
    Void destructObject(const ObjDesc *od, Ptr curObj, Fxn finalFxn,
        Int istat, Bool consFlg);
}
/*
 *  @(#) xdc.runtime; 2, 1, 0,0; 10-3-2020 15:24:56; /db/ztree/library/trees/xdc/xdc-K04/src/packages/
 */

