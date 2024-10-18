=========================================================================
xds2xx_portchk Utility for the XDS2xx (Windows only)
=========================================================================
In Windows run "xds2xx_portchk" with the XDS2xx connected to see which 
communications port Windows has assigned.

>xds2xx_portchk
-------------------------------------------------------------------
  Enumerated:  XDS2xx Emulator CDC Serial Port (COM3)
               CCS Port Address (Specific): 0x3
               CCS Port Address (Generic) : 0

  Found 1 XDS2xx Debug Probe Connected

=========================================================================
xds2xx_conf Utility for the XDS2xx
=========================================================================
This utility allows you to customize certain features of the XDS2xx and 
to obtain the DHCP assigned IP Address for the XDS220.

An update script is provided to update the firmware:

On Windows, execute the following command --
update_xds2xx.bat xds200

On Linux or Mac OS X, execute the following command --
update_xds2xx.sh xds200

>xds2xx_conf -h                                (display help information)
-------------------------------------------------------------------------
XDS2XX Configuration utility
Copyright (c) 2015-2019 by Texas Instruments, Inc. All rights reserved.

USAGE:

   xds2xx_conf  [-v] [-e] [--version] [-h] <command> <arg> ...
   -v,  --verbose
     enable verbose output

   -e,  --examples
     display examples

   --version
     Displays version information and exits.

   -h,  --help
     Displays usage information and exits.

   <command>
     (required)  the command to run

   <arg>  (accepted multiple times)
     the command arguments

COMMAND DESCRIPTION :
    get        Returns the values of 1 or more variables
    set        Set the values of 1 or more variables
  **boot       Boot the XDS2XX Emulator
    update     Update firmware
    program    Program Xilinx CPLD.

COMMAND SYNTAX :
    get        <adapter> <address> [name1 .. nameN]
    set        <adapter> <address> <name1=value1> [.. nameN=valueN]
    boot       <adapter> <address>
    update     <adapter> <address> <path-to-firmware>
    program    <adapter> <address> <path-to-cpld-firmware>

    <adapter> is xds2xxu for USB adapter or xds2xxe for Ethernet adapter.

    <address> is the port number address. Using 0 for <address>
    always means to use the first XDS2XX found. Otherwise, you can
    select a specific XDS2xx as follows:

        On Windows, use the COM port number for <address>. For example
        if the COM port is COM21:, then use 0x15 for <address>.

        On Linux, use the ttyACM number for <address>. XDS2xx will
        always create a pair of ttyACM entries; use the lower
        numbered one. For example, if the XDS2xx is /dev/ttyACM2,
        then use 0x02 for <address>.

        On Mac OS X, use 0xnnnn for <address> where nnnn is the 
        hex value of the tty.usbmodem device number.  XDS2xx will 
        always create a pair of tty.usbmodem entries; use the lower
        numbered one.  For example, if the XDS2xx entry is
        /dev/tty.usbmodem1421, then use 0x1421 for <address>. (The
        digits following "usbmodem" is a hex number.)

xds2xx_conf -e                            (display common examples)
-------------------------------------------------------------------
  EXAMPLE 1 - Use USB to display the current IP address
    xds2xx_conf get xds2xxu 0 ipAddress

  EXAMPLE 2 - Use USB to configure networking for a static IP address
    xds2xx_conf set xds2xxu 0 ipConfig=<ip-address>

  EXAMPLE 3 - Use USB to configure networking for DHCP
    xds2xx_conf set xds2xxu 0 ipConfig=dhcp

  EXAMPLE 5 - Use Ethernet to display all the settings
    xds2xx_conf get xds2xxe <ip-address>

  EXAMPLE 6 - Use Ethernet to update the firmware
    xds2xx_conf update xds2xxe <ip-address> c:\tmp\myfirmware.bin

  EXAMPLE 7 - Use USB to program CPLD
    xds2xx_conf program xds2xxu 0 c:\tmp\mycpldfirmware.xsvf

  EXAMPLE 8 - Use USB to enable serial number for multi-emulator support
    xds2xx_conf set xds2xxu 0 EnableUSBSerial=true

-------------------------------------------------------------------

** The boot command is only supported in in firmware version 1.0.0.4
   and higher.  If your firmware version is older then you must first
   do an update and then power cycle the emulator.  If your firmware
   is 1.0.0.4 or later then you can update by running:

   xds2xx_conf update xds2xxu 0 xds200_firmware_v1009.bin
   xds2xx_conf boot xds2xxu 0

   The whole process may take 15 seconds to update the firmware,
   reboot, and re-establish the USB and or Ethernet connection.

   The firmware is debug probe specific as each probe has its own
   feature set.  However, there are no checks made to prevent loading
   the incorrect firmware. This allows generic use of this utility
   on XDS2xx products that have followed the EPK design. The firmware
   update does NOT modify the parameter block which may be vendor
   specific.

-- xds2xx_conf get xds2xxu 0         (get all the current settings)
-------------------------------------------------------------------
  boardRev=1
  ipAddress=10.0.3.21
  ipConfig=dhcp
  ipGateway=0.0.0.0
  ipNetmask=0.0.0.0
  productClass=XDS2XX
  productName=XDS220
  serialNum=00:0E:99:03:92:04
  swRev=1.0.0.4
  hostCPU=AM1802
  emuCtrlType=Bit bang
  extMemType=SDRAM
  portUSB=true
  portENET=true
  portWIFI=false
  portRS232=false
  EnableUSBSerial=false
  CurrentMeasure=true

=======================================================================
xds2xx_currentmeasure Utility for the XDS2xx
=======================================================================
This utility allows the monitoring of two simple current measurement 
channels and control of the variable voltage output.

>xds2xx_currentmeasure              (display all available options)
-------------------------------------------------------------------
-p  : Port
-v  : Verbose <level>
-f  : CSV output file
-u  : Measurement application bin file
-d  : Delay in msec between samples
-n  : Number of samples to capture
-m  : Mask channels to capture
    :   ch1-shunt  0x0001
    :   ch1-bus    0x0002
    :   ch2-shunt  0x0004
    :   ch2-bus    0x0008
    :   ch3-shunt  0x0010
    :   ch3-bus    0x0020
    :   ch1-current  0x0100
    :   ch1-power    0x0200
    :   ch2-current  0x0400
    :   ch2-power    0x0800
    :   ch3-current  0x1000
    :   ch3-power    0x2000
-s  : Set output voltage in Mv
-c1 : DAC 1 config value, hex
-c2 : DAC 2 config value, hex
-c3 : DAC 3 config value, hex
-r1 : Channel 1 Resistance
-r2 : Channel 2 Resistance
-r3 : Channel 3 Resistance

See the Spectrum Digital XDS200 support page for latest examples and 
details on current measurement.
