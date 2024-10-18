#!/bin/bash

STARTDIR=`dirname "$0"`
USER=`whoami`
OPT=$1
UNINSTALL=0
TIUDEV_FILE="/etc/udev/rules.d/71-ti-permissions.rules"
TIRULES_FILE="${STARTDIR}/71-ti-permissions.rules"

# Determine option
if   [ "${OPT}" == "-i" -o "${OPT}" == "--install" ]; then
# Install option selected
	UNINSTALL=0
elif [ "${OPT}" == "" -o "${OPT}" == "" ]; then
# Install option by default (no option given)
	UNINSTALL=0
elif [ "${OPT}" == "-u" -o "${OPT}" == "--uninstall" ]; then
# Uninstall option selected
	UNINSTALL=1
else
# Help or unknown option selected, display usage and exit
	echo "This program installs the Texas Instruments udev rules file."
	echo "Usage: ti_permissions_install.sh [option]"
	echo "Options:"
	echo " -h,--help       Display usage and exit"
	echo " -i,--install    Install and exit (default)"
	echo " -u,--uninstall  Uninstall and exit"
	exit 0
fi

# Check that we're running as root
if [ "${USER}" != "root" ]; then
	echo "ERROR: this script must be run as root"
	exit 1
fi

# For Redhat use the start_udev script
RESTARTUDEV="/sbin/start_udev"

if [ ! -e "${RESTARTUDEV}" ]; then
    # For CentOS 7 use a specific command
    if [ -e "`which systemctl`" ]; then
        RESTARTUDEV="`which systemctl` restart systemd-udevd"
    else
        #For others use "System V" service command
        RESTARTUDEV="service udev restart"
    fi
fi

# If UNINSTALL option, remove file then exit
if [ ${UNINSTALL} -ne 0 ]; then
	echo "Uninstalling ${TIUDEV_FILE}"
	rm -f ${TIUDEV_FILE}
	if [ $? -ne 0 ]; then
		echo "ERROR: failed to remove ${TIUDEV_FILE}"
		exit 1
	fi
	exit 0
fi

# Check that rules file is not missing
if [ ! -e "${TIRULES_FILE}" ]; then
	echo "ERROR: ${TIRULES_FILE} is missing from the installation"
	exit 1
fi

# Copy the new rules file and change its permissions
cp "${TIRULES_FILE}" ${TIUDEV_FILE}
if [ $? -ne 0 ]; then
	echo "ERROR: failed to copy ${TIRULES_FILE} to ${TIUDEV_FILE}"
	exit 1
fi

# Change new file's permissions
PERMISSIONS=644
chmod ${PERMISSIONS} ${TIUDEV_FILE}
if [ $? -ne 0 ]; then
	echo "ERROR: failed to set the permissions for ${TIRULES_FILE} to ${PERMISSIONS}"
	exit 1
fi

# All done
echo "TI permissions file installation completed successfully. Some distros of Linux"
echo "may require a reboot in order for the driver to function properly.  For other"
echo "distros, restarting udev is sufficient.  Restarting udev now ... "

# Restart udev
${RESTARTUDEV}
if [ $? -ne 0 ]; then
	echo "ERROR: failed to restart udev, reboot required"
	exit 1
fi

