#!/bin/bash

# This batch file calculates the range of IPs on the network based on IP address and subnet mask specified.It scans through all the IP range and prints the arp table to a text file.
# This batch file takes 3 parameters. The first two parameters are mandatory and the third one is optional.
# The first parameter is the ipaddress(ipaddress of the PC you are running the script on).
# The second parameter is the subnet mask(subnet mask of the network you are connected to).
# The above two parameters can be found by the command ipconfig /all from the command prompt.
#
# The third argument is to distinguish between fast scan and complete scan(fast/complete).The fast scan prints out a quick list of the arp cache table on your local area network.This list is random and quick. This list may not list out the device you are looking for all the time.
# Inorder for the device you are looking for to always show up on the arpcache table do a complete scan which is little slower and always perfect. 
# The fourth parameter is the full path and name of the arpcache table. If this parameter is not specified the batch file would generate the output file in the local directory with the default name as arpcache.txt
#
# !!!!!!!!If the fourth parameter is used and the path has spaces in it, specify the full path under quotation marks.!!!!!!
#
# ex: ./IPTracker 10.0.3.51 255.255.0.0 complete "C:\Program Files\Texas Instruments\ccsv4\common\uscif\arpcache.txt" - this would scan through all the ip address in your network range and print the arp table to arpcache.txt under the specified path. 
#
# 

address=""

ipusage ()
{
   read -p "Enter IP address in dotted format [ex: 192.168.10.100] :" address
}

subnetusage ()
{
   read -p "Enter subnet mask in dotted format [ex: 255.255.25.0] :" address
}

scantype()
{
   read -p "Enter Scan Method [fast/complete] :" address
}

# Get the ipaddress
if [ "$1" == " " ];then ipadd="" 
else ipadd=$1 
fi

while [ "$ipadd" == "" ]
do
ipusage
ipadd="$address"
done

# Validate the IP Address
IP_ADDR_VAL=$(echo "$ipadd" | grep -Ec '^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])')

if [ $IP_ADDR_VAL -eq 0 ]; then
    echo -e "*** Bad ip address: $ipadd\nTry again with correct IP Address."
    exit 2
fi  

# Get the Subnet Address
if [ "$2" == " " ];then subnetadd="" 
else subnetadd=$2 
fi

while [ "$subnetadd" == "" ]
do
subnetusage
subnetadd="$address"
done

# Validate the Subnet Address
SUBNET_ADDR_VAL=$(echo "$subnetadd" | grep -Ec '^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])')

if [ $SUBNET_ADDR_VAL -eq 0 ]; then
    echo -e "*** Bad subnet address: $subnetadd\nTry again with correct Subnet Address."
    exit 2
fi

# Get the scan method
if [ "$3" == "" ] || [ "$3" != "fast" ] && [ "$3" != "complete" ];then 
scanmethod=""
else scanmethod=$3 
fi

while [ "$scanmethod" == "" ] || [ "$scanmethod" != "fast" ] && [ "$scanmethod" != "complete" ]
do
scantype
scanmethod="$address"
done

ip1=`echo $ipadd |cut -d'.' -f1`
ip2=`echo $ipadd |cut -d'.' -f2`
ip3=`echo $ipadd |cut -d'.' -f3`
ip4=`echo $ipadd |cut -d'.' -f4`
#echo $ip1 $ip2 $ip3 $ip4

subnet1=`echo $subnetadd |cut -d'.' -f1`
subnet2=`echo $subnetadd |cut -d'.' -f2`
subnet3=`echo $subnetadd |cut -d'.' -f3`
subnet4=`echo $subnetadd |cut -d'.' -f4`
#echo $subnet1 $subnet2 $subnet3 $subnet4

# Calculate the BroadCast address
bcast1=$((ip1 | (subnet1 ^ 255)))
bcast2=$((ip2 | (subnet2 ^ 255)))
bcast3=$((ip3 | (subnet3 ^ 255)))
bcast4=$((ip4 | (subnet4 ^ 255)))

bcast=$bcast1.$bcast2.$bcast3.$bcast4
#echo $bcast

if [ "$scanmethod" == "complete" ];then
ntwk1=$((ip1 & subnet1))
ntwk2=$((ip2 & subnet2))
ntwk3=$((ip3 & subnet3))
ntwk4=$((ip4 & subnet4))

ntwk=$ntwk1.$ntwk2.$ntwk3.$ntwk4
#echo $ntwk

ipstart1=$ntwk1
ipstart2=$ntwk2
ipstart3=$ntwk3
ipstart4=$((ntwk4+1))

ipstart=$ipstart1.$ipstart2.$ipstart3.$ipstart4
#echo $ipstart

ipend1=$bcast1
ipend2=$bcast2
ipend3=$bcast3
ipend4=$((bcast4-1))

ipend=$ipend1.$ipend2.$ipend3.$ipend4
#echo $ipend

startcount=$ipstart4
endcount=$ipend4
teststartip=$ip1.$ip2.$ip3

while [ $startcount -ne $endcount ]
do
ping -c1 -s1 -w1 -q ${teststartip}.${startcount} >/dev/null
startcount=`expr $startcount + 1`
done
fi

if [ "$scanmethod" == "fast" ];then
ping -c5 -b $bcast >/dev/null 2>/dev/null
fi

if [ "$4" == "" ];then
arppath="arpcache.txt"
else
arppath="$4"
fi

arp -n > "$arppath"

