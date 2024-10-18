"use strict";
/**
 *  Copyright (c) 2020, Texas Instruments Incorporated
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions
 *  are met:\
 *
 *  *   Redistributions of source code must retain the above copyright
 *  notice, this list of conditions and the following disclaimer.
 *  notice, this list of conditions and the following disclaimer in the
 *  documentation and/or other materials provided with the distribution.
 *  *   Neither the name of Texas Instruments Incorporated nor the names of
 *  its contributors may be used to endorse or promote products derived
 *  from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 *  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 *  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 *  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 *  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 *  OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 *  WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 *  OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 *  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
// import { TiConsole } from '../../ti-core-assets/lib/TiConsole';
// import { AbstractMessageBasedCodec, IFirmwareCheckBehavior } from '../../ti-target-configuration/lib/AbstractMessageBasedCodec';
// import { ICodecBaseParams } from '../../ti-target-configuration/lib/ICodecBaseParams';
// import { PrimitiveDataType, DecoderType } from '../../ti-target-configuration/lib/CodecDataTypes';
// import { NamedDataRecord, NamedRecordFieldDescriptor, Uint16, Uint32 } from '../../ti-target-configuration/lib/NamedDataRecord';
// import { OCFBase, IConfigureFirmware, IConfigureFirmwareListener } from './OCFBase';
// import { OCFSystem } from './OCFSystem';
// import { TiPromise } from '../../ti-core-assets/lib/TiPromise';
// import { IDataDecoder, IDataEncoder } from '../../ti-target-configuration/lib/AbstractCodec';
// import { AbstractFrameDecoder } from '../../ti-target-configuration/lib/AbstractFrameDecoder';
// export interface IAevmCodecParams extends ICodecBaseParams {
//     // send_interval: number; // system.json default value 101; not used in AEVMCodec.js in gc v2
//     sendPacketInterval: number; // user preference binding, default 100 ms
//     connectReqTimeout: number; // user preference binding, default 500 ms
// }
// export interface IAevmPacketHeader {
//     signature: number;
//     type: number;
//     status: number;
//     trasferLen: number;
//     packetNum: number;
//     payloadLen: number;
//     ifTypeUnit: number;
//     command: number;
//     params: number[];
// }
// const PARAM_MAX = 8;
// const HEADER_SIGNATURE = 0xD402;
// const HEADER_SIGNATURE_AS_BYTES = [(HEADER_SIGNATURE & 0xff), (HEADER_SIGNATURE>>8)&0xff];
// const HEADER_TYPE_COMMAND = 0x0001;
// const HEADER_LENGTH = 52;
// const HEADER_PAYLOAD_LEN_START = 14;
// const HEADER_PAYLOAD_LEN_END = 16;
// export class AevmPacketHeader extends NamedDataRecord<IAevmPacketHeader> {
//     static fieldDescriptors: NamedRecordFieldDescriptor<IAevmPacketHeader>[] = [
//         ['signature', Uint16],
//         ['type', Uint16],
//         ['status', Uint32],
//         ['trasferLen', Uint32],
//         ['packetNum', Uint16],
//         ['payloadLen', Uint16],
//         ['ifTypeUnit', Uint16],
//         ['command', Uint16],
//         ['params', Uint32, PARAM_MAX]
//     ];
//     littleEndian = true;
// }
// export class AevmPacket {
//     hdr: IAevmPacketHeader & NamedDataRecord<IAevmPacketHeader>;
//     payload: Uint8Array;
//     // Case 1: transport receives data from controller, aevm codec use constructor(given_data_buffer)
//     // to construct aevm packet
//     // Case 2: host aevm's interfaces send data to controller
//     constructor(buffer?: Uint8Array) {
//         if (buffer !== undefined) {
//             if (buffer.length < AevmPacket.PARAM_END_INDEX) {
//                 throw new Error('Invalid packet size');
//             }
//             this.hdr = AevmPacketHeader.create(buffer.slice(0, AevmPacket.PARAM_END_INDEX));
//             if (this.hdr.signature !== HEADER_SIGNATURE) {
//                 throw new Error('Invalid packet header');
//             }
//             if (buffer.length < AevmPacket.PARAM_END_INDEX + this.hdr.payloadLen) {
//                 throw new Error('Invalid payload size');
//             }
//             this.payload = buffer.slice(AevmPacket.PARAM_END_INDEX);
//         } else {
//             this.hdr = AevmPacketHeader.create();
//             this.hdr.signature = HEADER_SIGNATURE;
//             this.hdr.type = HEADER_TYPE_COMMAND;
//             this.hdr.status = 0;
//             this.hdr.trasferLen = 0;
//             this.hdr.packetNum = 1;
//             this.hdr.payloadLen = 0;
//             this.hdr.asUint8Array.fill(0, AevmPacket.PARAM_START_INDEX, AevmPacket.PARAM_END_INDEX);
//             this.payload = new Uint8Array();
//         }
//     }
//     toUint8Array(): Uint8Array {
//         const ary = new Uint8Array(this.hdr.length + this.payload.length);
//         ary.set(this.hdr.asUint8Array, 0);
//         ary.set(this.payload, this.hdr.length);
//         return ary;
//     }
//     static readonly IF_TYPE_UNIT_START_INDEX = 16;
//     static readonly PARAM_START_INDEX = 20;
//     static readonly ONE_PARAM_BYTE_SIZE = 4;
//     static readonly PARAM_END_INDEX = AevmPacket.PARAM_START_INDEX + AevmPacket.ONE_PARAM_BYTE_SIZE * PARAM_MAX;
// }
// export const uint8ArrayDataType = new PrimitiveDataType<Uint8Array>('Uint8Array');
// export const AevmPacketAsDecoderType = new DecoderType<IDataDecoder<AevmPacket, Uint8Array>>('AevmPacket');
// /*
// "Some Code" means App js code or Our code that understands the system.json or the new system description file.
// When App launches, or right before CodecRegistry set configuration
// 	"Some Code" creates codec instances with their configuration parameters,
// 		Each codec instance register itself with CodecRegistry
// Before connect,
// 	Prerequsite: CodecRegistry has all required codec instances created and registered
// 	CodecRegistry set new configuration
// 		it deconfigure all codec instances in previous configuration
// 			those codecs clears their parent and child codec pointers  (codec.deconfigure)
// 		it then wires up the new configuration by setting parent and child codec pointers among registered codec instances
// 			parentCodec.addChildDecoder
// 			childCodec.setParentEncoder
// During connect,
// 	Controller (u2a, aevm) (connect)
// 		check firmware version
// 		configureFirmware(void)
// 			serialize FW configuration commands of the child codec instances
// 				each child codec instance sends enable/configure commands to FW (childCodec.configureFirmware)
// After connect, app is runnning
// 	Some point later, app changes configuration of some child codec instances
// 	There are two kinds of changes
// 		(1) Affect the entire parent/child codec relations that we need to go through CodecRegistry to set new configuration
// 			After wiring, we need to sends enable/configure commands to FW, with the pre-requsite of being connected.
// 		(2) Does not affect wiring at all.
// 			(a) Some codec params are purely GC side setting that has nothing to do with configureFirmware.
// 				Individual codec instance re-initialize or update codec parameters  (initializeSettings)
// 			(b) Other codec params are actual configuration on FW side.
// 			Some aevm sub-interface (eg spi, i2c) may require disabling previous units before enable and configure new units.
// 				It is not all the case we can disable all previous units before enabling new ones. Some units are required to be enabled at same time for the app functionality.
// 			Some requires disabling other previous sub-interfaces before enable and configure the desired interfaces, which we have no knowledge.
// 			aevm/u2a's configureFirmware needs to be called here. Do we need to have configureFirmware(some argument here)?
// Disconnect,
// 	codec should not clear its parent and child codec pointers.
// 	codec should only reject outstanding promises and flush its internal state
//     TxOut Uint8Array   TxIn  Uint8Array  |  TxOut Uint8Array    TxIn  Uint8Array?  |  TxOut ?
//                   AEVMCodec              |                I2C Codec                |         Register Model
//     RxIn  Uint8Array   RxOut AevmPacket  |  RxIn AevmPacket     RxOut Uint8Array?  |  RxIn  ?
// AbstractFrameDecoder
// 	RxIn, TxOut, RxOut, TxIn are all Uint8Array
// Class diagram of usb2any and aevm
// 	(Choice 1) If Aevm/U2A extends AbstractMessageBasedCodec extends AbstractFrameDecoder
// 		aevm.decode
// 			super.decode (AbstractMessageBasedCodec manages pending transmissions  here)
// 				super.decode (frame decoder calls its targetDecoder.decode ... not good for me)
// 	(Choice 2) If Aevm/U2A extends AbstractMessageBasedCodec, but aevm/u2a contains AbstractFrameDecoder
// 	(Choice 3) If we stick with v2 design, 	Transport <===>  (Aevm/U2A)FrameDecoder <====> (Aevm/U2A) <===> v3 style Child Codec(s)
// 		How to specify this in the new system.json or description file?
// 		Transport.addChildCodec(aevm/u2a)
// 		Aevm/U2A.setParentEncoder
//             It is a bad idea to say 'transport.addChildCodec(frameDecoder)' here because this depends on whether setParentor or addChildCodec is invoked later by CodecRegistry.
//     Picked Choice 2.
// */
// const NO_RESPONSE_MESSAGE = 'Controller is not responding.';
// const IS_CONNECTED_REQUEST_TIMEOUT = 2000;  // time out value to wait for controller to isStillConnected
// class PriorityGroup {
//     priority: number;
//     group: number[];
// }
// function binary_Search(items, value){
//     var firstIndex  = 0,
//         lastIndex   = items.length - 1,
//         middleIndex = Math.floor((lastIndex + firstIndex)/2);
//     while(items[middleIndex] != value && firstIndex < lastIndex)
//     {
//        if (value < items[middleIndex])
//         {
//             lastIndex = middleIndex - 1;
//         } 
//       else if (value > items[middleIndex])
//         {
//             firstIndex = middleIndex + 1;
//         }
//         middleIndex = Math.floor((lastIndex + firstIndex)/2);
//     }
//  return (items[middleIndex] != value) ? -1 : middleIndex;
// }
// class PriorityGroups {
//     groups: PriorityGroup[] = []; // groups[0].priority=2; groups[1].priority = 5;
//     insert(guy: number, priority: number) {
//     }
//     findIndex(priorty: number) {
//         let low = 0;
//         let hi = this.groups.length-1;
//         let mid = Math.floor((low+hi)/2);
//         while (this.groups[mid].priority !== priorty && low < hi) {
//             if (priorty < this.groups[mid].priority) {
//                 hi = mid -1;
//             } else if (priorty > this.groups[mid].priority) {
//                 low = mid + 1;
//             }
//             mid = Math.floor((low+hi)/2);
//         }
//         if (this.groups[mid].priority === priorty) return mid;
//         // if priority < mid-priority return not found and before old mid
//         // if priority > mid-priority return not found and after old mid
//     }
// }
// export class AEVMCodec extends AbstractMessageBasedCodec<AevmPacket> {
//     private interfaceMap: { [key in string | number]: OCFBase } = {};
//     private connectReqTimeout: number;
//     private frameDecoder = new (class extends AbstractFrameDecoder {
//         getPacketLength(buffer: number[], offset: number): number {
//             return buffer.length - offset < HEADER_LENGTH ? 0 :
//                 HEADER_LENGTH + OCFBase.bytesToValue([buffer[offset + HEADER_PAYLOAD_LEN_START], buffer[offset + HEADER_PAYLOAD_LEN_END-1]], 'little');
//         }
//         decodePacket(packet: Uint8Array): boolean | Error {
//             return this.packetDecoder.decodePacket(packet);
//         }
//         packetDecoder: AEVMCodec;
//     })('aevmPacketFrameDecoder', ...HEADER_SIGNATURE_AS_BYTES);
//     constructor(private params: IAevmCodecParams) {
//         super(params.id || 'aevm', AevmPacketAsDecoderType);
//         this.frameDecoder.packetDecoder = this;
//         this.connectReqTimeout = params.connectReqTimeout || 500;
//     }
//     deconfigure() {
//         // called by CodecRegistry before connect
//         super.deconfigure();
//         this.interfaceMap = {};
//     }
//     setParentEncoder(parent: IDataEncoder<Uint8Array, Uint8Array>) {
//         // called by CodecRegistry, after deconfigure but before connect
//         super.setParentEncoder(parent);
//     }
//     addChildDecoder(child: OCFBase) {
//         // called by CodecRegistry, after deconfigure but before connect
//         this.interfaceMap[child.interfaceType] = child;
//         this.interfaceMap[child.id] = child; // child.id is the name
//     }
//     connect(behaviorControl?: IFirmwareCheckBehavior): Promise<void> {
//         if (this.interfaceMap['system'] === undefined) {
//             this.interfaceMap[this.interfaceMap['system'].interfaceType] = this.interfaceMap['system'] = new OCFSystem();
//         }
//         const systemInteface = this.interfaceMap['system'] as OCFSystem;
//         return super.connect().then(()=>{
//             return TiPromise.timeout(systemInteface.getInfo(), 250, NO_RESPONSE_MESSAGE);
//         }).then((firmwareInfo) => {
//             return this.checkFirmware({detectedFirmwareVersion: firmwareInfo.version, modelID: this.params.id, codec: self, controller: 'aevm'}, behaviorControl);
//         }).then(() => {
//             return systemInteface.configureFirmware();
//         }).then(() => {
//             return TiPromise.timeout(this.configureFirmware(this.sortConfigureFirmwareSequence()), this.connectReqTimeout, NO_RESPONSE_MESSAGE);
//         });
//     }
//     addConfigureFirmwareListener(listener: IConfigureFirmwareListener, priority?: number) {
//     }
//     sortConfigureFirmwareSequence(): IConfigureFirmware[] {
//         // TODO sort by priority
//         return [];
//     }
//     configureFirmware(sortedConfigureList: IConfigureFirmware[]): Promise<void> {
//         const promises = [];
//         for (let i = 0; i < sortedConfigureList.length; ++i) {
//             const setting = sortedConfigureList[i];
//             const interfaceName = setting.interfaceName;
//             promises.push(this.interfaceMap[interfaceName].configureFirmware(setting.configureSequence));
//         }
//         return Promise.all(promises) as unknown as Promise<void>;
//     }
//     disconnect(): Promise<void> {
//         return super.disconnect().then(() => {
//             for (const x in this.interfaceMap) {
//                 this.interfaceMap[x].disconnect();
//             }
//         });
//     }
//     ping(): Promise<void> {
//         const pingPromise = (this.interfaceMap.system as OCFSystem).getInfo();
//         return TiPromise.timeout(pingPromise as unknown as Promise<void>, IS_CONNECTED_REQUEST_TIMEOUT, 'Ping failure: no response of firmware version read from ' + this.id);
//     }
//     isStillConnected(): Promise<void> {
//         return super.isStillConnected().then(this.ping);
//     }
//     getInterfaces() {
//         return this.interfaceMap;
//     }
//     encode(data: Uint8Array) {
//         super.encode(data); // base class method manages pending transmissions
//     }
//     decode(data: Uint8Array): boolean | Error {
//         return this.frameDecoder.detectPackets(data);
//     }
//     decodePacket(data: Uint8Array): boolean | Error {
//         super.decode(data); // base class method manages pending transmissions
//         const packet = new AevmPacket(data);
//         const ifType = packet.hdr.ifTypeUnit >> 8;
//         const child = this.interfaceMap[ifType];
//         return child.decode(packet);
//     }
//     shouldPauseTransmission(txPacket: Uint8Array): boolean {
//         // aevm packet seq number is used for sequencing multiple packets for a single request of
//         // SPI capturing huge payload. It has a different meaning than usb2any.
//         // need to figure out how to count outstanding requests to slow down the flow to controller.
//         return false;
//     }
//     // AEVMCodec.prototype.add_interface = function(name, impl) {
//     //     OCFBaseEx.prototype.add_interface(name,impl);
//     // };
//     // gc.databind.AEVMCodec = AEVMCodec;
//     // gc.databind.AEVMCodec.OCFBaseEx = OCFBaseEx;
// }
//TODO work out these feeback
/*
Paul Gingrich

connect method cannot have attributes. This will be called by CodecRegistry and needs to be common. FirmwareCheck behavior should be a IAevmCodecParams so that apps have access through the <ti-codec-aevm do-firmare-check> attributes.

    Create taskCreate Jira issue

    09 Jun 2020

    Winnie Lai
    Winnie Lai

    In v2, the same connect method is used for two different purposes.
    In normal cases, during connect(), it checks firmware, prompt user to agree on firmware change for incorrect firmware. Regardless of the user answer, the rest of logic follows.
    In the other use, the connect() is used to verify connection or scanForDevice via verifyRegister and is called by register model. The goal is to check the firmware version and abort the verify sequence for incorrect firmware. In this case, the connect() method needs to know the context.
    GC-2182 was filed for this.

    I don't see how apps can know when to flip the attribute, as it has no ideas when verifyConnection or scanForDevice is about to be called by GC framework.

    Create taskCreate Jira issue

    Paul Gingrich likes this6 days ago

    Paul Gingrich
    Paul Gingrich

    Any parameters that are added to the connect method will have to be generic to all codecs. Like a flag indicating if connecting to target or identifying target. I haven't implemented this code yet though.

*/ 
//# sourceMappingURL=AEVMCodec.js.map