/* 
 *  Copyright (c) 2020 Texas Instruments Incorporated
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
 *  ======== package.xs ========
 */

/*
 *  ======== package.init ========
 */
function init()
{
    /* 'cfgnull' is the object model used in the release phase */
    if (xdc.om.$name != 'rov' && xdc.om.$name != 'cfgnull') {
        throw new Error("The package xdc.rov.support can only be used in ROV "
            + " code.\n");
    }
}
/*
 *  @(#) xdc.rov.support; 1, 0, 0,0; 10-3-2020 15:24:51; /db/ztree/library/trees/xdc/xdc-K04/src/packages/
 */

