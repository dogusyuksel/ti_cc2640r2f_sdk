/*
 *  Copyright 2019 by Texas Instruments Incorporated.
 *
 */

package xdc.tools.platformWizard;

/*!
 *  ======== Main ========
 * @_nodoc
 */
metaonly module Main inherits xdc.tools.ICmd {

    override config String usage[] = [
        ' -r <repository for platform package>',
        ' -x <XML schema file>',
                '<platform package name>'
    ];

instance:
        
    @CommandOption("r")
    config String repositoryPath = null;
        
    @CommandOption("x")
    config String schemaFile = null;
        
    override Any run(xdc.tools.Cmdr.Instance cmdr, String args[]);
}
/*
 *  @(#) xdc.tools.platformWizard; 1,0,0,3; 2-18-2019 11:03:54; /db/ztree/library/trees/xdctools/xdctools-h03/src/
 */

