# rfSynchronizedPacketTx
---

### SysConfig Notice

All examples will soon be supported by SysConfig, a tool that will help you 
graphically configure your software components. A preview is available today in 
the examples/syscfg_preview directory. Starting in 3Q 2019, with SDK version 
3.30, only SysConfig-enabled versions of examples will be provided. For more 
information, click [here](http://www.ti.com/sysconfignotice).

-------------------------

Project Setup using the System Configuration Tool (SysConfig)
-------------------------
The purpose of SysConfig is to provide an easy to use interface for configuring 
drivers, RF stacks, and more. The .syscfg file provided with each example 
project has been configured and tested for that project. Changes to the .syscfg 
file may alter the behavior of the example away from default. Some parameters 
configured in SysConfig may require the use of specific APIs or additional 
modifications in the application source code. More information can be found in 
SysConfig by hovering over a configurable and clicking the question mark (?) 
next to it's name.

Example Summary
---------------

In this example you will learn how to build a time-synchronized connection
between one transmitter and a receiver. Time-synchronization enables both
communication partners to transfer data quickly at predictable time points.
Unlike the wake-on-radio example, the transmitter does not need to send a very
long preamble and the receiver does not need to wait and check for a signal on
air. This leads to the lowest possible power consumption on both sides. It
also fits very well to the SimpleLink Long-range mode. Time synchronization
builds also the foundation for Frequency and Time Division Multiple Access,
FDMA and TDMA respectively.

This example project shows the transmission part. The receiver part can be
found in the Synchronized Packet RX example.

Peripherals Exercised
---------------------
* `BUTTON1` - Toggles the state of `LED1` and sends a message in spontaneous beacon state.
* `BUTTON2` - Toggles between periodic and spontaneous beacon state.
* `LED1` - Toggled when `BUTTON1` is pushed.
* `LED2` - On while data is being transmitted over the RF interface (PA enable), off when in standby.

Resources & Jumper Settings
---------------------------

This section explains the resource mapping across various boards. If you're
using an IDE (such as CCS or IAR), please refer to Board.html in your project
directory for resources used and board-specific jumper settings. Otherwise,
you can find Board.html in the directory
\<SDK_INSTALL_DIR\>/source/ti/boards/\<BOARD\>.


### SmartRF06 in combination with one of the CC13x0 evaluation modules

| Resource          | Mapping / Notes                                        |
| ----------------- | ------------------------------------------------------ |
| `BUTTON1`         | `BTN_UP` (up button)                                   |
| `BUTTON1`         | `BTN_DN` (down button)                                 |
| `LED1`            | `LED1`                                                 |
| `LED2`            | `LED2`                                                 |


### CC1310 / CC1350 / CC2640R2 Launchpad

| Resource          | Mapping / Notes                                        |
| ----------------- | ------------------------------------------------------ |
| `BUTTON1`         | `BTN-1` (left button)                                  |
| `BUTTON2`         | `BTN_2` (right button)                                 |
| `LED1`            | Green LED                                              |
| `LED2`            | Red LED                                                |

Board Specific Settings
-----------------------
1. The default frequency is:
    - 433.92 MHz for the CC1350-LAUNCHXL-433
    - 433.92/490 MHz for the CC1352P-4-LAUNCHXL
    - 2440 MHz on the CC2640R2-LAUNCHXL
    - 868.0 MHz for other launchpads
In order to change frequency, modify the smartrf_settings.c file. This can be
done using the code export feature in Smart RF Studio, or directly in the file
2. On the CC1352P1 the high PA is enabled (high output power) for all
Sub-1 GHz modes by default.
3. On the CC1352P-2 the high PA operation for Sub-1 GHz modes is not supported
4. On the CC1352P-4 the high PA is enabled (high output power) for all
Sub-1 GHz modes by default.
    - The center frequency for 2-GFSK is set to 490 MHz
    - **CAUTION:** The center frequency for SimpleLink long range (SLR) is set to 433.92 MHz,
    but the high output power violates the maximum power output requirement
    for this band
5. The CC2640R2 is setup to run all proprietary physical modes at a center
frequency of 2440 MHz, at a data rate of 250 Kbps

Example Usage
-------------

This section is similar for both TX and RX. You need 2 boards: one running the
`rfSynchronizedPacketTx` application (TX board) and another one running the
`rfSynchronizedPacketRx` application (RX board).


### Initial synchronization

1. Build and run the `rfSynchronizedPacketRx` example on the RX board.
   You will see `LED2` on the RX board being on all the time.

2. Build and run the `rfSynchronizedPacketTx` example on the TX board.
   You will see `LED2` on the TX board flashing with a period of 500 ms.
   On the RX board, you will see that `LED2` is flashing synchronously.

3. Push `BUTTON1` on the TX board. `LED1` will toggle immediately.
   On the RX board, `LED1` follows after a short delay.

4. You may push `BUTTON1` several times and will see that
   `LED1` on the RX board will always reflect the state
   on the TX board with some delay.

Explanation: After starting, the RX board goes into `WaitingForSync` state.
The receiver is switched on end waits for a packet. The LNA signal (`LED2`) is
enabled to reflect the current receiver state.

When the application on the TX board is started, it starts to send periodic
beacon messages. Once the RX board has received the first beacon message, it
switches the receiver off and goes into `SyncedRx` state. In this state, it
wakes up the receiver right before the next packet from the TX board is
expected.

When `BUTTON1` on the TX board is pushed, the current LED state is sent
in the next available time slot and is shown on the RX board as soon
as the packet has arrived.


### Sending spontaneous beacons after synchronization

5. Push `BUTTON2` on the TX board. You will see that `LED2` on the
   TX board stops flashing while `LED2` on the RX boards remains
   flashing.

6. Push `BUTTON1` on the TX board. You will see that `LED1` toggles
   on the TX board and with a short delay also on the RX board.
   `LED2` on the TX board will flash a short while after pushing
   the button.

Explanation: After pushing `BUTTON2` on the TX board, the TX application
goes into `SporadicMessage` state and stops sending periodic beacons.
The RX application remains in `SyncedRx` state and wakes up when it
expects a packet. As long as no button on the TX board is pushed,
the RX board will wake up only for a short time and go back to standby
after a very short timeout because no packet is received.

When pushing `BUTTON1` on the TX board, a packet with the new state of `LED1`
is transmitted. The TX board sends exactly at the same time when the RX board
expects to receive a packet. The RX board receives the message and updates the
state of its own `LED1`.


### Error handling: Re-synchronization due to crystal drift ===

7. Repeat step 6 for a while. After a couple of minutes, you will notice that
   `LED1` on the RX board is not updated properly anymore.

8. Push `BUTTON1` on the RX board. `LED2` will remain on permanently.

9. Push `BUTTON1` on the TX board. You will see `LED1` toggle on both boards
   and `LED2` on the RX board starting to flash again.

Explanation: Both TX and RX board predict the following wake-up events based
on the time when synchronization happened. If both clocks have a small drift,
then the wake-up time will be incorrect after some time.

By pushing `BUTTON1` on the RX board, the application goes back into
`WaitingForSync` state and re-synchronizes to the TX board.


Application Design Details
--------------------------

This examples consists of a single task and the exported SmartRF Studio radio
settings. The TX application is implemented as a state machine with 3 states:

![tx-uml-state-machine][state-machine]

In order to send synchronous packets, the transmitter uses an absolute start
trigger for the TX command. Absolute start triggers are explained in the
proprietary RF user's guide and the technical reference manual. It starts with
an arbitrarily chosen time stamp:

```c
    /* Use the current time as an anchor point for future time stamps.
     * The Nth transmission in the future will be exactly N * 500ms after
     * this time stamp.  */
    RF_cmdPropTx.startTime = RF_getCurrentTime();
```

And then adds a fixed interval for any further transmission:


```c
    /* Set absolute TX time in the future to utilize "deferred dispatching of commands with absolute timing".
     * This is explained in the proprietary RF user's guide. */
    RF_cmdPropTx.startTime += RF_convertMsToRatTicks(BEACON_INTERVAL_MS);
```

In `SpontaneousBeacon` state, the next transmission start time is calculated
based on the last value transmission start time:

```
    /* We need to find the next synchronized time slot that is far enough
     * in the future to allow the RF driver to power up the RF core.
     * We use 2 ms as safety margin. */
    uint32_t currentTime = RF_getCurrentTime() + RF_convertMsToRatTicks(2);
    uint32_t intervalsSinceLastPacket = DIV_INT_ROUND_UP(currentTime - RF_cmdPropTx.startTime, RF_convertMsToRatTicks(BEACON_INTERVAL_MS));
    RF_cmdPropTx.startTime += intervalsSinceLastPacket * RF_convertMsToRatTicks(BEACON_INTERVAL_MS);
```

That means, the transmission is not really "spontaneous", but rather "as soon
as possible" according to the interval. A safety margin of 2 ms is added
because the RF core is powered down while waiting for the RX command. If we
are close to the next slot, the RF driver would not have enough time to re-
initialize the RF core.

No further timing restrictions apply to the transmitter.


[state-machine]: state-machine.png "TX state chart"