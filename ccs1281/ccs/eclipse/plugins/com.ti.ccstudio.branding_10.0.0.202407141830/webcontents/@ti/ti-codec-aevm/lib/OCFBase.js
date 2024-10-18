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
// export abstract class OCFBase extends AbstractDataDecoder<AevmPacket, Uint8Array> {
//     // Map a requst (if_type_unit, pkt command, <pkt params>) to a list of promises.
//     // the request can be keyed by the above bytes converted to a string (aevm)
//     // or a number (u2a in fact is using sequential number)
//     protected reqState = new Map<string|number, IDeferedPromise<any>[]>();
//     // Map the command field in AevmPackt header to a specific handler
//     // that handles response packets from controller.
//     protected packetHandlers = new Map<number, PacketHandlerType>();
//     // info: IAevmChildInterfaceParams;
//     unit = 0;
//     configSeq: [];
//     customCallback: any;
//     private static customCallbackMap: {[interfaceName: string]: any} = {};
//     crc?: CRC;
//     crcUser: any;
//     private static interface_defs = new Map<string, typeof OCFBase>();
//     constructor(name: string) {
//         super(name, AevmPacketAsDecoderType, binaryDataType);
//     }
//     /**
//      * Initialize the symbols for device, and it should invoked by GC framework only.
//      * This is a class method, that has no conept of instance data
//      *
//      * @param {Object} settings the necessary info to initialize this interface
//      * @param {RegisterModel} registerModel the model being used for this interface
//      */
//     // initSymbolsForDevice(settings: any, registerModel: RegisterModel) {
//     //     settings._registerModel  = registerModel;
//     //     // Use registerModel to addPseudoRegister (see gpio), or addUserPreference
//     //     // The pseudoRegister's registerInfo must be {comm: undefined, uri: 'aevm.'+settings.name+'.'+config.name, ...}
//     //     // The comm property is used by AEVM to call read/write. The comm field should be undefined
//     //     // at this point because this is a class method.
//     //     // When addPseudoRegister, should consider to use qualifier for readonly, writeonly, or interrupt when necessary.
//     //     // An instance of interface module's init should update the comm property to point to the instance itself,
//     //     // because that is the only point the instance is already created. Note the sequence of interface modules
//     //     // for this method and init method is the same, so it implicitly matches the correct instance.
//     //     // Use registerModel.getBinding(registerInfo.uri) to updateValue or setValue
//     //     // To get notifying of data on the other end of binding, consider one of these:
//     //     // registerModel.getBinding(registerInfo.uri).addChangedListener({onValueChanged: function(oldValue, newValue) {
//     //     // }});
//     //     // registerModel.getBinding(registerInfo.uri).addStreamingListener({onDataReceived: function(data) {
//     //     // }});
//     //     // client.js: to get notifying of data on the other end of binding, consdier one of these,
//     //     // e.g. the pseudoRegister's uri is 'aevm.gpio.PK7', and the id of register model is regtemp,
//     //     // gc.databind.createTrigger(function() { }, 'regtemp.aevm.gpio.PK7');
//     //     // gc.databind.registry.getBinding('regtemp.aevm.gpio.PK7').addChangedListener();
//     //     // gc.databind.registry.getBinding('regtemp.aevm.gpio.PK7').addStreamingListener();
//     //     // add additional common logic here, if needed.
//     //     this.readSettingPropMap('unit', 'unitMap', settings, registerModel);
//     // }
//     protected static readSettingPropMap(propName: string, propMapName: string, settings: any, registerModel: RegisterModel) {
//         const propMap = settings[propMapName];
//         if (propMap !== undefined) {
//             for (const name in propMap) {
//                 if (propMap[name] !== undefined) {
//                     registerModel.addUserPreference('$'+propName+'.'+name, propMap[name]);
//                 }
//             }
//         }
//         if (settings[propName] !== undefined) {
//             registerModel.addUserPreference('$'+propName, settings[propName]);
//         }
//     }
//     /**
//      * Get the value of a setting property for a register for a register model
//      * @param {String} property name
//      * @param {Object} inteface setting
//      * @param {RegisterModel} register model
//      * @return {*} the value of the property
//      */
//     protected static getPropForRegister(propName: string, info: any, registerModel: RegisterModel) {
//         const bindingName = '_'+propName+'Binding';
//         info[bindingName] = info[bindingName] || {};
//         info[bindingName][registerModel.id] = info[bindingName][registerModel.id] ||
//             (info[propName] !== undefined && registerModel.parseModelSpecificBindExpressionWithPrefix('$'+propName+'.', info[propName])) ||
//             (info.parentGroup && info.parentGroup[propName] !== undefined && registerModel.parseModelSpecificBindExpressionWithPrefix('$'+propName+'.', info.parentGroup[propName])) ||
//             registerModel.getBinding('$'+propName);
//         return info[bindingName][registerModel.id].getValue();
//     }
//     /**
//      * Initialize the interface instance, and it should be invoked by GC framework only.
//      * Use configureFirmware (during connect or after connect) to execute enablement
//      * and configuration required by firmware controller.
//      *
//      * @param {Object} info the information to initialize this interface instance
//      */
//     protected initializeSettings(info: IAevmChildInterfaceParams) {
//         if (info.unit !== undefined) this.unit = +info.unit;
//         this.configSeq = info.config; // is a configuration sequence
//         this.customCallback = OCFBase.customCallbackMap[info.id];
//         if (info.crc !== undefined) {
//             this.crc = this.getCrc(info.crc);
//             this.crcUser = AbstractMessageBasedCodec.getCrcUser(info.id);
//         }
//     }
//     // Migration Note - old signature get_interface_type(): number
//     abstract get interfaceType(): number;
//     getInterfaceUnit(unit: number): number {
//         return this.interfaceType << 8 | unit;
//     }
//     /**
//      * Configure the inteface, and it should invoked by GC framework only.
//      * Typical implemenation is to send enable and configure commands to the firmware.
//      * Old method name is ensureConfigured
//      * @param {Array} config_seq configuration sequence
//      * @return {Promise}
//      */
//     configureFirmware(settings: IConfigureCommand[]): Promise<void> {
//         return Promise.resolve();
//     }
//     getCrc(crcAttributes: ICrcAttributes) {
//         return CRC.getSharedInstance(crcAttributes);
//     }
//     /**
//      * Register a callback for custom logic in read/write
//      */
//     // eslint-disable-next-line @typescript-eslint/camelcase
//     static register_custom_callback(impl: any, interfaceName: string) {
//         // impl (required) - provides a custom logic
//         // interface_name (required) - specific interfaces for the given custom logic, e.g. 'i2c'
//         OCFBase.customCallbackMap[interfaceName] = impl; // see specific OCFxxx for definition of impl
//     }
//     /**
//      * Add an interface implemenation
//      * @param {String} name interface name
//      * @param {Object} impl implementation of the interface, must be extened from OCFBaseEx or its derived types.
//      */
//     static addInterface(name: string, impl: typeof OCFBase) {
//         OCFBase.interface_defs.set(name, impl);
//     }
//     /**
//      * Get interface implementation
//      * @param {String} name interface name
//      * @return {Object} interface implemenation
//      */
//     static getInterface(name: string) {
//         return OCFBase.interface_defs.get(name);
//     }
//     /**
//      * Clean up work during disconnect, called by parent encoder.
//      * Should not clear the parent and child codec pointers here, which is done inside deconfigure
//      * and deconfigure is invoked by codecRegistery.
//      */
//     disconnect() {
//         const msg = this.constructor.name + ' reset.';
//         for (const deferPromiseArray of this.reqState.values()) {
//             for (const deferPromise of deferPromiseArray) {
//                 deferPromise.reject(msg);
//             }
//         }
//         this.reqState.clear();
//     }
//     /**
//      * Handles the incoming packet from controller to host,
//      * and it should invoked by GC framework only.
//      * Migration Note - old signature handlePacket(pkt: object): boolean
//      * @param {AevmPacket} packet the incoming packet
//      * @returns {Boolean} true if handled, otherwise false
//      */
//     decode(packet: AevmPacket): boolean {
//         const pktKey = this.getPacketKey(packet);
//         const promiseArray = this.reqState.get(pktKey);
//         if (promiseArray !== undefined) {
//             const deferPromise = promiseArray.shift();
//             const handler = this.getPacketHandler(packet);
//             // For 'response' of a command, there should be a defer promise.
//             // For event and interrupt, there is no defer promise.
//             // For certain capture commands, the response of one capture command may take multiple packets.
//             // In this case, the handler will get a defer promise only for the first packet.
//             // Derived class needs to store that promise, and resolve/reject that promise after
//             // it gets all those multiple packets.
//             if (handler !== undefined) {
//                 handler(packet, deferPromise);
//             } else if (deferPromise !== undefined) {
//                 deferPromise.resolve({self: this, packet});
//             }
//         }
//         // Migration note - handlePacket calls get_packet_handler
//         // and use the returned handler like below.
//         // var handler = this.get_packet_handler(packet_type, command, pkt);
//         // if (handler) {
//         //     handler(this, qdef, unit, status, pkt, packet_type);
//         // } else if (qdef) {
//         //     qdef.resolve({self: this, unit, status, packet: pkt});
//         // }
//         return true; // Say I handled it, and let resolve/reject or binding.update/setValue to pass out data/errors
//     }
//     /**
//      * Get the handler of a packet, and it should be invoked by GC framework only.
//      * Migration note - old signature get_packet_handler = function(packet_type, command)
//      *
//      * @param {AevmPacket} packet packet
//      * @returns {PacketHandlerType} the handler or undefined
//      */
//     getPacketHandler(packet: AevmPacket): PacketHandlerType | undefined {
//         // Old signature get_packet_handler beharvior:
//         // If there is no handler for the command, this method must return undefined.
//         // If there is a handler for the command, this method must return a function of this form:
//         //    function(this, qdef, unit, status, pkt) => undefined;
//         //    and that function must use qdef to either resolve or reject, if qdef is provided
//         // e.g., you have a function reply_cmd_hdl() defined somewhere like below,
//         //    var reply_cmd_hdl = function(this, qdef, unit, status, pkt, packet_type) {
//         //      if (status==0) { qdef.resolve(some_result_from_pkt); }
//         //      else { qdef.reject('some failure message'); }
//         //    }
//         // This method default behavior looks up the handler by command (which is an integral type),
//         // you can pre-store those command specific handlers into this.handlers in your
//         // construnctor function or initSymbolsForDevice, e.g.,
//         //    this.handlers = [reply_cmd_hdl, reply_another_cmd_hdlr];
//         // Alternatively, you can override the default logic for more advanced usage, i.e.,
//         // your overridden get_packet_handler will return reply_cmd_dlr;
//         return this.packetHandlers.get(packet.hdr.command);
//     }
//     protected getPacketKey(packet: AevmPacket, startIdx?: number, endIdx?: number): string|number {
//         // compute a key using ifTypeUnit, command, and params from packet header
//         const bytes = packet.hdr.asUint8Array;
//         const start = startIdx !== undefined ? startIdx : AevmPacket.IF_TYPE_UNIT_START_INDEX;
//         const end = endIdx !== undefined ? endIdx : AevmPacket.PARAM_END_INDEX;
//         const ans = [];
//         for (let idx = start; idx < end; idx++) {
//             ans.push( ('0' + bytes[idx].toString(16)).slice(-2) );
//         }
//         return ans.join('');
//     }
//     /*
//      * Send a command packet from host to controller
//      * Migration note - old signature h2c_command = function(if_type, unit, command, params, payload): Promise
//      *
//      * @param {AevmPacket} packet packet
//      * @return {Promise} a promise that will be resolve/rejected after getting the response
//      *                   of the command from the controller.
//      */
//     h2cCommand(packet: AevmPacket): Promise<any> {
//         packet.hdr.payloadLen = packet.payload.length;
//         const pktKey = this.getPacketKey(packet);
//         if (this.reqState.get(pktKey) === undefined) {
//             this.reqState.set(pktKey, []);
//         }
//         const deferPromise = TiPromise.defer();
//         this.reqState.get(pktKey)?.push(deferPromise);
//         this.targetEncoder.encode(packet.toUint8Array());
//         return deferPromise.promise;
//     }
//     /**
//      * Flatten a multi-level array to a single level array.
//      * @ {Array} ary input array
//      * @return {Array} a flatted array.
//      */
//     static flatten(ary: Array<any>): number[] {
//         return ary.reduce((a: number[], b: number | number[]) => {
//             return a.concat(Array.isArray(b) ? OCFBase.flatten(b) : b);
//         }, []);
//     }
//     /** Internal function */
//     static bytesToAscii(bytes: number[] | Uint8Array) {
//         return String.fromCharCode.apply(null, bytes as unknown as (number[]));
//     }
//     /** Internal function */
//     static statusMsg(status: number, mesg: string): string {
//         return mesg + (status !== undefined ? '. Status = ' + status : '');
//     }
//     /**
//      *  Convert a javascript number to an array of bytes
//      *  Migration note - Old signature value_to_bytes(number, bitSize, endian ('little' or 'big'), optional_in_place_array[]): bytes[]
//      *
//      *  @param {Number} value the value to be converted
//      *  @param {Number} bitSize semantic bit size of the value
//      *  @param {String} endian endianess, 'big' or 'little' (default)
//      *  @param {Array} inPlaceBuf An optional provided in-place-buffer to store the result
//      *  @return {Array} converted bytes
//      */
//     static valueToBytes(value: number, bitSize: number, endian: string, inPlaceBuf?: number[]): number[] {
//         const buf = inPlaceBuf || [];
//         if (bitSize <= 8) {
//             buf.push(value);
//         } else {
//             const bs=(((bitSize-1)>>3)<<3);
//             if (endian === 'big') {
//                 for (let b=bs; b>=0; b-=8) {
//                     buf.push( (value >> b) & 0xff );
//                 }
//             } else { // (endian == 'little')
//                 for (let b=0; b<=bs; b+=8) {
//                     buf.push( (value >> b) & 0xff );
//                 }
//             }
//         }
//         return buf;
//     }
//     /**
//      *  Convert an array of bytes to a javascript number
//      *  Migration note - Old signature bytes_to_value(number_array[], endian ('little' or 'big')): number
//      *
//      *  @param {Array} buf the array of bytes
//      *  @param {String} endian endianess, 'big' or 'little' (default)
//      *  @return {Number} converted number
//      */
//     static bytesToValue(buf: number[] | Uint8Array, endian: string): number {
//         let value = 0;
//         const bs = buf.length;
//         if (endian === 'big') {
//             for (let b=0; b<bs; b++) {
//                 value = (value * 256) + (buf[b] & 0xff);
//             }
//         } else { // (endian == 'little')
//             for (let b=bs; --b >=0; ) {
//                 value = (value * 256) + (buf[b] & 0xff);
//             }
//         }
//         return value;
//     }
// }
// Migration Note
// Merge both OCFBase.js and OCFBaseEx.js to OCFBase.ts
// 1. Exposed OCFBase and OCFBaseEx in old code
// (function() {
//     /* Exports the OCFBase object */
//     window.OCFBase = OCFBase;
//     window.OCFBaseEx = OCFBaseEx;
// })();
// 2. Exposed value_to_bytes = function(value, bit_size, endian, in_place_buf)
//    and  bytes_to_value = function(buf, endian)
// 3. Exposed get_packet_handler = function(packet_type, command)
// 4. Exposed h2c_command = function(if_type, unit, command, params, payload)
//# sourceMappingURL=OCFBase.js.map