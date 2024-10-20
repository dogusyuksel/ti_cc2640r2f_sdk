/*******************************************************************************

 @file  board.h

 @brief This file is a simple gateway to include the appropriate board.h file
        which is located in a corresponding subdirectory relative to this file.
        In this way, all projects look the same and only need to include this
        board.h. To change a board, the project only need update the board
        define. Presently, the following board targets are possible:

        BOOSTXL_CC2650MA
        CC2650_LAUNCHXL
        CC2650DK_4XS
        CC2650DK_5XD
        CC2650DK_7ID
        CC2650RC
        CC2650STK
        CC1310_LAUNCHXL
        CC1310DK_4XD
        CC1310DK_5XD
        CC1310DK_7XD
        CC1350_LAUNCHXL
        CC1350STK

        If a project needs to change the board defined for a particular target,
        they can modify the board.h located in the corresponding board
        subdirectory.

        NOTE: THIS FILE SHOULD ONLY BE CHANGED TO ADD A NEW BOARD/TARGET!

 Group: WCS, LPC, BTS
 $Target Device: DEVICES $

 *******************************************************************************
 $License: BSD3 2015 $
 *******************************************************************************
 $Release Name: PACKAGE NAME $
 $Release Date: PACKAGE RELEASE DATE $
 ******************************************************************************/

#if defined(CC2650DK_7ID) || defined(CC2650DK_5XD) || defined(CC2650DK_4XS)
    #include "./cc2650em/cc2650em_board.h"
#elif defined(CC2650STK)
    #include "./cc2650st/cc2650st_board.h"
#elif defined(CC2650RC)
    #include "./cc2650rc/cc2650rc_board.h"
#elif defined(CC2650_LAUNCHXL)
    #include "./cc2650lp/cc2650lp_board.h"
#elif defined(BOOSTXL_CC2650MA)
    #include "./cc2650bp/cc2650bp_board.h"
#elif defined(CC1310DK_7XD) || defined(CC1310DK_5XD) || defined(CC1310DK_4XD)
    #include "./cc1310em/cc1310em_board.h"
#elif defined(CC1310_LAUNCHXL)
    #include "./cc1310lp/cc1310lp_board.h"
#elif defined(CC1350_LAUNCHXL)
    #include "./cc1350lp/cc1350lp_board.h"
#elif defined(CC1350STK)
    #include "./cc1350st/cc1350st_board.h"
#elif defined(USE_FPGA)
    #include "./cc2650fpga/cc2650fpga_board.h"
#elif defined(CC1350DK_7XD)
    // Note: There currently isn't a directory that corresponds to the CC1350EM
    //       but this device is digitally identical to the CC2650EM. Until a
    //       board directory is added for CC1350DK_7XD, we'll remap to the
    //       CC2650DK_7ID board. The proper front end setup (7XD) will be
    //       correctly handled based on the board define CC2650EM_7ID.
    #include "./cc2650em/cc2650em_board.h"
#else // unknown board
    #error "***ERROR*** Invalid Board Specified! Please see board.h for options."
#endif



