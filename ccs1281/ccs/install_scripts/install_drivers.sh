#!/bin/sh

if [ -f /home/spire/ti/ccs1281/ccs/install_scripts/ti_permissions_install.sh ]; then
    /home/spire/ti/ccs1281/ccs/install_scripts/ti_permissions_install.sh --install
fi
if [ -f /home/spire/ti/ccs1281/ccs/install_scripts/msp430uif_install.sh ]; then
    /home/spire/ti/ccs1281/ccs/install_scripts/msp430uif_install.sh --install
fi
if [ -f /home/spire/ti/ccs1281/ccs/install_scripts/jlink_install.sh ]; then
    /home/spire/ti/ccs1281/ccs/install_scripts/jlink_install.sh --install
fi
