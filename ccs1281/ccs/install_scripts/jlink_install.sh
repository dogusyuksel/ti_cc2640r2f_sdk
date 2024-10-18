#!/bin/bash


STARTDIR=`dirname "$0"`
USER=`whoami`
OPT=$1
UNINSTALL=0
JLINK_UDEV_FILE="/etc/udev/rules.d/99-jlink.rules"
JLINK_RULES_FILE="${STARTDIR}/99-jlink.rules"

# If UNINSTALL option then exit - the uninstall option is only needed for drivers.
if [  "${OPT}" == "--uninstall" ]; then
	exit 0
fi

# Check root
if [ "${USER}" != "root" ]; then
	echo "ERROR: this script must be run as root"
	exit 1
fi


# For Redhat use the start_udev script
RESTARTUDEV="/sbin/start_udev"


# For others use "System V" service command
if [ ! -e ${RESTARTUDEV} ]; then
	RESTARTUDEV="service udev restart"
fi


# Remove old rules file
if [ -e ${JLINK_UDEV_FILE} ]; then
	echo "Uninstalling ${JLINK_UDEV_FILE}"
	rm -f ${JLINK_UDEV_FILE}
	if [ $? -ne 0 ]; then
		echo "ERROR: failed to remove ${JLINK_UDEV_FILE}"
		exit 1
	fi
fi

# Check rules file is not missing
if [ ! -e "${JLINK_RULES_FILE}" ]; then
	echo "ERROR: the required component ${JLINK_RULES_FILE} is missing from the installation"
	exit 1
fi


# Copy the new rules file and change its permissions
cp "${JLINK_RULES_FILE}" ${JLINK_UDEV_FILE}
if [ $? -ne 0 ]; then
	echo "ERROR: failed to copy ${JLINK_RULES_FILE} to ${JLINK_UDEV_FILE}"
	exit 1
fi


# Change its permissions
PERMISSIONS=644
chmod ${PERMISSIONS} ${JLINK_UDEV_FILE}
if [ $? -ne 0 ]; then
	echo "ERROR: failed to set the permissions for ${JLINK_RULES_FILE} to ${PERMISSIONS}"
	exit 1
fi


# All done
echo "JLink installation completed successfully.  Some versions of Linux"
echo "require a reboot in order for the driver to function properly.  For other"
echo "versions restarting udev is sufficient.  Restarting udev now ... "


# Restart udev
${RESTARTUDEV}
if [ $? -ne 0 ]; then
	echo "ERROR: failed to restart udev, reboot required"
	exit 1
fi
