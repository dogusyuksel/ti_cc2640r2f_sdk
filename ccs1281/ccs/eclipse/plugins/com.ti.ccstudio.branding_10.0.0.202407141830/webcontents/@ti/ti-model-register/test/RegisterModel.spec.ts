import { expect } from 'chai';
import { IRegisterModelEncoder, IRegisterModelDecoder, RegisterModelEncoderType, RegisterModelDecoderType, RegisterModel } from '../lib/RegisterModel';
import { IRegisterInfo, IRegisterJsonData } from '../lib/IRegisterInfo';
import { TiPromise, IDeferedPromise } from '../../ti-core-assets/lib/TiPromise';
import { CodecRegistry } from '../../ti-target-configuration/lib/CodecRegistry';
import { IBindFactory, ConstantBindValue, IStatusEvent, IStatus, IScriptLogEvent, IRefreshableBindValue, IDisposable, IRefreshIntervalProvider, statusChangedEventType, scriptLogEventType, Status, IBindValue, IValueChangedEvent, IStreamingDataEvent, valueChangedEventType, streamingDataEventType } from '../../ti-core-databind/lib/CoreDatabind';
import { isArray } from 'util';
import { Events } from '../../ti-core-assets/lib/Events';

describe('RegisterModel', () => {

    function sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    };

    function getBinding(model: IBindFactory, uri: string): IBindValue {
        return model.getBinding(uri) || new ConstantBindValue();
    }

    class TestCodec extends Events implements IRegisterModelEncoder {
        private entity?: IRegisterInfo;
        coreIndex?: number;
        value?: number;
        private model?: IRegisterModelDecoder;
        private commandMap = new Map<number, IDeferedPromise<number | Array<number>>>();
        encoderInputType = RegisterModelEncoderType;
        encoderOutputType = RegisterModelDecoderType;
        readonly id = 'test';

        addChildDecoder(decoder: IRegisterModelDecoder) {
            this.model = decoder;
        };

        deconfigure() {
            this.model = undefined;
        };

        addCommand(id: number) {
            const defer = TiPromise.defer<number | Array<number>>();
            this.commandMap.set(id, defer);
            return defer.promise;
        };

        addResponse(value: number | number[], id: number) {
            const defer = this.commandMap.get(id);
            if (defer) {
                this.commandMap.delete(id);

                defer.resolve(value);
            } else {
                throw `Missing Command for address ${id}`;
            }
        };

        addErrorResponse(message: string, id: number) {
            const defer = this.commandMap.get(id);
            if (defer) {
                this.commandMap.delete(id);

                defer.reject(message);
            } else {
                throw `Missing Command for address ${id}`;
            }
        };

        readValue(entity: IRegisterInfo, coreIndex?: number) {

            // handle register reads
            this.entity = entity;
            this.coreIndex = coreIndex;
            const countBind = getBinding(this.model!, '$packetCount');
            countBind.updateValue(countBind.getValue() + 1);

            return this.addCommand(entity.addr).finally(function () {
                countBind.updateValue(countBind.getValue() - 1);
            });
        };

        writeValue(entity: IRegisterInfo, value: number, coreIndex: number) {
            this.entity = entity;
            this.coreIndex = coreIndex;
            this.value = value;

            return Promise.resolve();
        };
    };

    const codec = new TestCodec();
    CodecRegistry.register(codec);

    class ChangeListener {
        didValueChange = false;
        didReceiveData = false;
        didStatusChange = false;
        newValue = 0;
        dataReceviced = 0;
        newMessage = '';

        onValueChanged = (details: IValueChangedEvent) => {
            this.didValueChange = true;
            this.newValue = details.newValue;
        };

        verifyValueChangedTo(newValue: number | number[]) {
            expect(this.didValueChange).to.be.true;
            if (isArray(newValue)) {
                expect(this.newValue).to.deep.equal(newValue);
            } else {
                expect(this.newValue).to.equal(newValue);
            }
            this.didValueChange = false;
        };

        onDataReceived = (details: IStreamingDataEvent) => {
            this.didReceiveData = true;
            this.dataReceviced = details.data;
        };

        verifyDataReceivedWas(newData: number) {
            expect(this.didReceiveData).to.be.true;
            expect(this.dataReceviced).to.equal(newData);
            this.didReceiveData = false;
        };

        onStatusChanged = (details: IStatusEvent) => {
            this.didStatusChange = true;
            this.newMessage = details.newStatus ? details.newStatus.message : '';
        };

        verifyStatusChangedTo(newStatus: IStatus | string) {
            const message = (newStatus && (newStatus as IStatus).message) ? (newStatus as IStatus).message : (newStatus || '');
            expect(this.didStatusChange).to.be.true;
            expect(this.newMessage).to.equal(message);
            this.didStatusChange = false;
        };
    };

    let scriptingData: IScriptLogEvent | undefined = undefined;

    function scriptingListener(details: IScriptLogEvent) {
        scriptingData = details;
    };

    function createRegisterJsonData(addr1: number | string = '0x00', start: number | string = 8, addr2: number | string = 0x3, enableCalculated = true) {
        const regJsonInfo: IRegisterJsonData = {
            info: {
                name: 'test'
            },
            calculatedBindings: enableCalculated ? {
                _calc: 'reg.field + reg.field3'
            } : undefined,
            regblocks: [
                {
                    name: 'all',
                    registers: [
                        {
                            name: 'reg',
                            size: 16,
                            addr: addr1,
                            fields: [
                                {
                                    start: '0',
                                    stop: '3',
                                    name: 'field'
                                },
                                {
                                    start: start,
                                    stop: '8',
                                    name: 'field2'
                                },
                                {
                                    start: 12,
                                    stop: 15,
                                    name: 'field3'
                                }]
                        },
                        {
                            name: 'reg2',
                            size: 64,
                            default: -1234,
                            addr: addr2,
                            fields: [
                                {
                                    stop: 31,
                                    name: 'field',
                                    type: 'int',
                                    default: 0
                                }]
                        }]
                }]
        };
        return regJsonInfo;
    };

    let regBind: IRefreshableBindValue;
    let regFieldBind: IBindValue;
    let reg2Bind: IRefreshableBindValue;
    let reg2FieldBind: IBindValue & IDisposable;
    let regField2Bind: IBindValue;
    let regField3Bind: IBindValue;
    let listener: ChangeListener;
    let bind: IBindValue;
    let calcBind: IBindValue;
    let packetCount: IBindValue;
    let model: RegisterModel;
    let refreshBind: IRefreshIntervalProvider;
    let isMultiCore = false;

    // The following test cases must pass for both multi-core and single core cases.
    const modes = [ '', ': multi-core' ];
    for (let i = 0; i < modes.length; i++) {

        const mode = modes[i];  // mode is blank (false) for single core, and non-blank (true) for multi-core.

        it('configure' + mode, () => {
            model = new RegisterModel({ id: 'reg', isDeviceArray: isMultiCore });
            refreshBind = getBinding(model, '$refresh_interval') as IRefreshIntervalProvider;
            refreshBind.setValue(-1);  // use manual refresh for testing.
            isMultiCore = true;  // setup for second pass where isDeviceArray === true;

            packetCount = getBinding(model, '$packetCount');
            packetCount.setValue(0);

            CodecRegistry.register(model);

            expect(() => {
                CodecRegistry.configure('test+reg');
            }).to.not.throw();
            expect(CodecRegistry.isActive('test')).to.be.true;
            expect(CodecRegistry.isActive('reg')).to.be.true;
        });


        it('Bad URI' + mode, () => {
            bind = getBinding(model, 'invalide@character');
            expect(bind.status).to.exist;
            bind = getBinding(model, '$cores.active');
            expect(bind.status).to.exist;
            bind = getBinding(model, '$cores.all.reg');
            expect(bind.status).to.exist;
            bind = getBinding(model, '$cores.0.reg.field');
            expect(bind.status).to.exist;
        });

        it('Bad Symbol Name' + mode, () => {
            regFieldBind = getBinding(model, 'reg.field');
            expect(regFieldBind.status).to.exist;
            regBind = getBinding(model, 'reg') as IRefreshableBindValue;
            expect(regBind.status).to.exist;
        });

        it('Stale bindings' + mode, async () => {
            model.setConnectedState(true);
            await sleep(1);

            expect(regBind.status).to.exist;

            model.setSymbols(createRegisterJsonData());
            expect(regBind.status).to.be.null;
            expect(regBind.isStale()).to.be.true;
            expect(regFieldBind.isStale()).to.be.true;

            reg2Bind = getBinding(model, 'reg2') as IRefreshableBindValue;
            expect(reg2Bind.status).to.be.null;
            expect(reg2Bind.isStale()).to.be.false;

            reg2FieldBind = getBinding(model, 'reg2.field') as IBindValue & IDisposable;
            expect(reg2Bind.isStale()).to.be.false;
            expect(reg2FieldBind.getValue()).to.equal(-1234);
        });

        it('Read Value' + mode, async () => {
            listener = new ChangeListener();
            reg2FieldBind = getBinding(model, 'reg2.field') as IBindValue & IDisposable;
            reg2FieldBind.addEventListener(statusChangedEventType, listener.onStatusChanged);
            reg2FieldBind.addEventListener(valueChangedEventType, listener.onValueChanged);
            reg2FieldBind.addEventListener(streamingDataEventType, listener.onDataReceived);
            codec.addResponse(0xbabe, 0);
            await sleep(1);
            expect(listener.didStatusChange).to.be.false;
            expect(listener.didValueChange).to.be.false;
            expect(listener.didReceiveData).to.be.false;
            expect(regBind.getValue()).to.equal(0xbabe);
            expect(regFieldBind.getValue()).to.equal(0xe);
            regField2Bind = getBinding(model, 'reg.field2');
            expect(regField2Bind.getValue()).to.equal(0);
            regField3Bind = getBinding(model, 'reg.field3');
            expect(regField3Bind.getValue()).to.equal(0xb);
            codec.addResponse(0xFFFF00, 0x3);
            await sleep(1);
            expect(listener.didStatusChange).to.be.false;
            listener.verifyValueChangedTo(0xFFFF00);
            listener.verifyDataReceivedWas(0xFFFF00);
            expect(reg2FieldBind.getValue()).to.equal(0xFFFF00);
        });

        it('Calculated Bindings' + mode, () => {
            calcBind = getBinding(model, '_calc');
            expect(calcBind.getValue()).to.equal(0xb+0xe);
        });

        it('Change symbols' + mode, async () => {
            expect(listener.didValueChange).to.be.false;
            expect(listener.didReceiveData).to.be.false;

            model.setSymbols(createRegisterJsonData(1, 7, 4, false));

            listener.verifyValueChangedTo(-1234);
            expect(listener.didReceiveData).to.be.false;
            expect(calcBind.status).to.exist;
            expect(regBind.status).to.be.null;
            expect(regBind.isStale()).to.be.true;
            expect(regFieldBind.isStale()).to.be.true;
            expect(reg2Bind.status).to.be.null;
            expect(reg2Bind.isStale()).to.be.false;
            expect(reg2FieldBind.isStale()).to.be.false;
            expect(reg2FieldBind.getValue()).to.equal(-1234);
            packetCount = getBinding(model, '$packetCount');
            expect(packetCount.getValue()).to.equal(0);
            let done = false;
            refreshBind.onRefresh().then( () => {
                done = true;
            });
            await sleep(1);
            expect(packetCount.getValue()).to.equal(2);
            codec.addResponse(1234, 4);
            expect(done).to.be.false;
            codec.addResponse(0xface, 1);
            await sleep(1);
            expect(done).to.be.true;
            listener.verifyValueChangedTo(1234);
            listener.verifyDataReceivedWas(1234);
            expect(packetCount.getValue()).to.equal(0);
            expect(regBind.status).to.be.null;
            expect(regBind.isStale()).to.be.false;
            expect(regBind.getValue()).to.equal(0xface);
            expect(regField2Bind.isStale()).to.be.false;
            expect(regField2Bind.getValue()).to.equal(1);
            expect(reg2FieldBind.getValue()).to.equal(1234);
        });

        it('Write Value' + mode, async () => {
            const newValue = -0x45410532;
            expect(listener.didValueChange).to.be.false;
            expect(listener.didReceiveData).to.be.false;
            reg2FieldBind.setValue(newValue);
            await sleep(1);
            listener.verifyValueChangedTo(newValue);
            expect(listener.didReceiveData).to.be.false;
            expect(packetCount.getValue()).to.equal(1);
            expect(codec.value).to.equal(0xbabeface);
            codec.addResponse(newValue, 0x4);
            await sleep(1);
            expect(listener.didValueChange).to.be.false;
            listener.verifyDataReceivedWas(newValue);
            expect(packetCount.getValue()).to.equal(0);
            expect(listener.didStatusChange).to.be.false;
            reg2FieldBind.setValue(newValue);
            await sleep(1);
            expect(codec.value).to.equal(0xbabeface);
            expect(listener.didValueChange).to.be.false;
            expect(listener.didReceiveData).to.be.false;
            expect(packetCount.getValue()).to.equal(0);
        });

        it('Streaming Data' + mode, async () => {
            const newValue = -0x45410532;
            reg2Bind.refresh();
            expect(packetCount.getValue()).to.equal(1);
            codec.addResponse(newValue, 0x4);
            await sleep(1);
            expect(listener.didValueChange).to.be.false;
            listener.verifyDataReceivedWas(newValue);
            expect(packetCount.getValue()).to.equal(0);
            expect(listener.didStatusChange).to.be.false;
        });

        it('Defferred Write' + mode, async () => {
            regBind.setDeferredMode(true);
            expect(regBind.isDeferredWritePending()).to.be.false;
            regBind.setValue(regBind.getValue());
            expect(regBind.isDeferredWritePending()).to.be.false;
            (regBind as IRefreshableBindValue).refresh();
            expect(regBind.isDeferredWritePending()).to.be.false;
            await sleep(1);
            expect(packetCount.getValue()).to.equal(1);
            codec.addResponse(0xdead, 1);
            await sleep(1);
            expect(packetCount.getValue()).to.equal(0);
            expect(regBind.isDeferredWritePending()).to.be.false;
            regField2Bind.setValue(3);
            expect(regBind.isDeferredWritePending()).to.be.true;
            regBind.setValue(0xdead);
            expect(regBind.isDeferredWritePending()).to.be.false;
            await sleep(1);
            expect(packetCount.getValue()).to.equal(0);
            regBind.setDeferredMode(false, true);  // force write of same value
            regBind.setDeferredMode(true);
            expect(codec.coreIndex).to.equal(0);
            expect(codec.value).to.equal(0xdead);
            await sleep(1);
            expect(packetCount.getValue()).to.equal(1);
            codec.addResponse(0xbeef, 1);
            await sleep(1);
            expect(packetCount.getValue()).to.equal(0);
            expect(regBind.getValue()).to.equal(0xbeef);
            expect(regBind.isDeferredWritePending()).to.be.false;
            regBind.setValue(123);
            expect(regBind.isDeferredWritePending()).to.be.true;
            await sleep(1);
            expect(packetCount.getValue()).to.equal(0);
            regBind.setDeferredMode(false);
            expect(regBind.isDeferredWritePending()).to.be.false;
            await sleep(1);
            expect(codec.coreIndex).to.equal(0);
            expect(codec.value).to.equal(123);
            expect(packetCount.getValue()).to.equal(1);
            codec.addResponse(123, 1);
            await sleep(1);
            expect(packetCount.getValue()).to.equal(0);
        });

        it('Clear Defferred Write' + mode, async () => {
            regBind.setDeferredMode(true);
            expect(regBind.isDeferredWritePending()).to.be.false;
            regBind.setValue(0x1234);
            expect(regBind.isDeferredWritePending()).to.be.true;
            regBind.setValue(123);
            expect(regBind.isDeferredWritePending()).to.be.false;
            regBind.setDeferredMode(false);
            await sleep(1);
            expect(packetCount.getValue()).to.equal(0);
            expect(regBind.isDeferredWritePending()).to.be.false;
        });

        it('Cancel Deferred Write' + mode, async () => {
            regBind.addEventListener(valueChangedEventType, listener.onValueChanged);
            regBind.addEventListener(streamingDataEventType, listener.onDataReceived);
            regBind.setDeferredMode(true);
            expect(regBind.isDeferredWritePending()).to.be.false;
            regBind.setValue(0x1234);
            expect(regBind.isDeferredWritePending()).to.be.true;
            listener.verifyValueChangedTo(0x1234);
            expect(listener.didReceiveData).to.be.false;
            regBind.clearDeferredWrite();
            expect(regBind.isDeferredWritePending()).to.be.false;
            listener.verifyValueChangedTo(123);
            expect(listener.didReceiveData).to.be.false;
            regBind.setDeferredMode(false);
            await sleep(1);
            expect(packetCount.getValue()).to.equal(0);
            expect(regBind.isDeferredWritePending()).to.be.false;
            regBind.removeEventListener(valueChangedEventType, listener.onValueChanged);
            regBind.removeEventListener(streamingDataEventType, listener.onDataReceived);
        });

        it('refresh count' + mode, async () => {
            let refreshCount = 0;
            refreshBind.onRefresh().then( (totalJobs) => {
                refreshCount = totalJobs;
            });
            await sleep(1);
            expect(refreshCount).to.be.equal(0);
            expect(packetCount.getValue()).to.equal(2);
            codec.addResponse(reg2Bind.getValue(), 4);
            codec.addResponse(regBind.getValue(), 1);
            await sleep(1);
            expect(refreshCount).to.be.equal(2);
            expect(packetCount.getValue()).to.equal(0);
        });

        it('Logging to Script' + mode, async () => {
            model.addEventListener(scriptLogEventType, scriptingListener);
            regBind.refreshAndLog();
            expect(scriptingData).to.exist;
            expect(scriptingData!.command).to.equal('read');
            expect(scriptingData!.name).to.equal('reg');
            await sleep(1);
            expect(packetCount.getValue()).to.equal(1);
            regBind.setValue(regBind.getValue(), undefined, true); // force a write to log a script operation.
            expect(scriptingData).to.exist;
            expect(scriptingData!.command).to.equal('write');
            expect(scriptingData!.name).to.equal('reg');
            expect(scriptingData!.value).to.equal(regBind.getValue());
            expect(packetCount.getValue()).to.equal(1);
            codec.addResponse(regBind.getValue(), 1);
            await sleep(1);
            expect(packetCount.getValue()).to.equal(1);
            codec.addResponse(regBind.getValue(), 1);
            await sleep(1);
            expect(packetCount.getValue()).to.equal(0);
        });

        it('Executing Script' + mode, async () => {
            const activeCore = getBinding(model, '$selectedCore');
            activeCore.setValue(0);
            model.scriptRead('reg').then(function() {
                model.scriptWrite('reg', 123);
            });
            await sleep(1);
            expect(packetCount.getValue()).to.equal(1);
            expect(codec.coreIndex).to.equal(0);
            codec.addResponse(regBind.getValue(), 1);
            await sleep(1);
            expect(packetCount.getValue()).to.equal(1);
            expect(codec.coreIndex).to.equal(0);
            expect(codec.value).to.equal(regBind.getValue());
            codec.addResponse(regBind.getValue(), 1);
            await sleep(1);
            expect(packetCount.getValue()).to.equal(0);
        });
    }

    // The following test cases are only for multi-core support
    let activeCore: IBindValue;
    let cores2reg2FieldBind: IBindValue;
    let cores2regBind: IRefreshableBindValue;
    let cores2reg2Bind: IRefreshableBindValue;
    let coresLength: IBindValue;
    let coresAllregBind: IBindValue;
    let coresAllreg2Bind: IRefreshableBindValue;
    let coresAllRegField3Bind: IBindValue;
    let cores1regBind: IBindValue;

    it('RegisterAllBind Read', async () => {
        coresLength = getBinding(model, '$cores.length');
        expect(coresLength.status).to.be.null;
        expect(coresLength.getValue()).to.equal(1);
        coresAllregBind = getBinding(model, '$cores.all.reg');
        expect(coresAllregBind.status).to.be.null;
        expect(coresAllregBind.isStale()).to.be.false;
        coresAllreg2Bind = getBinding(model, '$cores.all.reg2') as IRefreshableBindValue;
        expect(coresAllreg2Bind.status).to.be.null;
        expect(coresAllreg2Bind.isStale()).to.be.false;

        refreshBind.onRefresh();
        await sleep(1);
        expect(packetCount.getValue()).to.be.equal(2);
        expect(codec.coreIndex).to.be.equal(-1);
        codec.addResponse([-1, 2, -3], 4);
        codec.addResponse([0xfb4e, 0xbabe, 0xace], 1);
        await sleep(1);
        expect(coresLength.getValue()).to.be.equal(3);
        listener.verifyValueChangedTo(-1);
        listener.verifyDataReceivedWas(-1);
        expect(listener.didStatusChange).to.be.false;

        expect(coresAllregBind.getValue()).to.deep.equal([0xfb4e, 0xbabe, 0xace]);
        expect(regField2Bind.getValue()).to.be.equal(2);
        expect(regField3Bind.getValue()).to.be.equal(0xf);
        coresAllRegField3Bind = getBinding(model, '$cores.all.reg.field3');
        expect(coresAllRegField3Bind.status).to.be.null;
        expect(coresAllRegField3Bind.isStale()).to.be.false;
        expect(coresAllRegField3Bind.getValue()).to.deep.equal([0xf, 0xb, 0]);
    });

    it('Read Core Specific Register', async () => {
        cores2reg2FieldBind = getBinding(model, '$cores.2.reg2.field');
        cores2regBind = getBinding(model, '$cores.2.reg') as IRefreshableBindValue;
        expect(cores2regBind.status).to.be.null;
        expect(cores2regBind.isStale()).to.be.false;
        expect(cores2regBind.getValue()).to.be.equal(0xace);
        cores2reg2Bind = getBinding(model, '$cores.2.reg2') as IRefreshableBindValue;
        expect(cores2reg2Bind.status).to.be.null;
        expect(cores2reg2Bind.isStale()).to.be.false;
        expect(cores2reg2Bind.getValue()).to.be.equal(-3);
        expect(packetCount.getValue()).to.be.equal(0);
        expect(cores2reg2FieldBind.status).to.be.null;
        expect(cores2reg2FieldBind.isStale()).to.be.false;
        expect(cores2reg2FieldBind.getValue()).to.be.equal(-3);
        reg2FieldBind.removeEventListener(statusChangedEventType, listener.onStatusChanged);
        reg2FieldBind.removeEventListener(valueChangedEventType, listener.onValueChanged);
        reg2FieldBind.removeEventListener(streamingDataEventType, listener.onDataReceived);
        cores2reg2Bind.addEventListener(statusChangedEventType, listener.onStatusChanged);
        cores2reg2Bind.addEventListener(valueChangedEventType, listener.onValueChanged);
        cores2reg2Bind.addEventListener(streamingDataEventType, listener.onDataReceived);
        cores2reg2Bind.refresh();
        await sleep(1);
        expect(packetCount.getValue()).to.be.equal(1);
        expect(codec.coreIndex).to.be.equal(2);
        codec.addResponse(0xbeef, 4);
        await sleep(1);
        expect(coresLength.getValue()).to.be.equal(3);
        listener.verifyValueChangedTo(0xbeef);
        listener.verifyDataReceivedWas(0xbeef);
        expect(listener.didStatusChange).to.be.false;
        expect(cores2reg2Bind.getValue()).to.be.equal(0xbeef);
        expect(coresAllreg2Bind.getValue()).to.deep.equal([-1, 2, 0xbeef]);
        expect(packetCount.getValue()).to.be.equal(0);
    });

    it('RegisterAllBind Write', async () => {
        cores2reg2Bind.removeEventListener(statusChangedEventType, listener.onStatusChanged);
        cores2reg2Bind.removeEventListener(valueChangedEventType, listener.onValueChanged);
        cores2reg2Bind.removeEventListener(streamingDataEventType, listener.onDataReceived);
        coresAllregBind.addEventListener(statusChangedEventType, listener.onStatusChanged);
        coresAllregBind.addEventListener(valueChangedEventType, listener.onValueChanged);
        cores1regBind = getBinding(model, '$cores.1.reg');
        cores1regBind.addEventListener(streamingDataEventType, listener.onDataReceived);
        coresAllRegField3Bind.setValue([5, 4, 0xc]);
        listener.verifyValueChangedTo([0x5b4e, 0x4abe, 0xcace]);
        expect(listener.didReceiveData).to.be.false;
        expect(cores2regBind.getValue()).to.be.equal(0xcace);
        await sleep(1);
        expect(codec.coreIndex).to.be.equal(-1);
        expect(codec.value).to.deep.equal([0x5b4e, 0x4abe, 0xcace]);
        expect(packetCount.getValue()).to.be.equal(1);
        codec.addResponse([0x5b4e, 0x4abe, 0xcacf], 1);
        await sleep(1);
        listener.verifyValueChangedTo([0x5b4e, 0x4abe, 0xcacf]);
        listener.verifyDataReceivedWas(0x4abe);
        expect(listener.didStatusChange).to.be.false;
        expect(packetCount.getValue()).to.be.equal(0);
    });

    it('Write Specific Core Register', async () => {
        coresAllregBind.setDeferredMode(true);
        cores1regBind.setValue(9668);
        listener.verifyValueChangedTo([0x5b4e, 9668, 0xcacf]);
        await sleep(1);
        expect(listener.didReceiveData).to.be.false;
        expect(packetCount.getValue()).to.be.equal(1);
        expect(codec.coreIndex).to.be.equal(1);
        expect(codec.value).to.be.equal(9668);
        codec.addResponse(9668, 1);
        await sleep(1);
        expect(coresLength.getValue()).to.be.equal(3);
        listener.verifyDataReceivedWas(9668);
        expect(listener.didStatusChange).to.be.false;
        expect(listener.didValueChange).to.be.false;
        coresAllregBind.setDeferredMode(false);
        await sleep(1);
        expect(packetCount.getValue()).to.be.equal(0);
        expect(regBind.isDeferredWritePending()).to.be.false;
    });

    it('Active Register', async () => {
        expect(listener.didValueChange).to.be.false;
        expect(listener.didReceiveData).to.be.false;
        coresAllregBind.removeEventListener(statusChangedEventType, listener.onStatusChanged);
        coresAllregBind.removeEventListener(valueChangedEventType, listener.onValueChanged);
        cores1regBind.removeEventListener(streamingDataEventType, listener.onDataReceived);
        regBind.addEventListener(statusChangedEventType, listener.onStatusChanged);
        regBind.addEventListener(valueChangedEventType, listener.onValueChanged);
        regBind.addEventListener(streamingDataEventType, listener.onDataReceived);

        activeCore = getBinding(model, '$selectedCore');
        activeCore.setValue(2);
        expect(reg2Bind.getValue()).to.be.equal(0xbeef);
        expect(reg2FieldBind.getValue()).to.be.equal(0xbeef);
        expect(regBind.getValue()).to.be.equal(0xcacf);
        expect(regFieldBind.getValue()).to.be.equal(0xf);
        expect(regField2Bind.getValue()).to.be.equal(0x1);
        expect(regField3Bind.getValue()).to.be.equal(0xc);
        expect(regBind.isStale()).to.be.false;
        expect(regField3Bind.isStale()).to.be.false;
        expect(reg2Bind.isStale()).to.be.false;
        await sleep(1);
        expect(packetCount.getValue()).to.be.equal(0);
        listener.verifyValueChangedTo(0xcacf);
        expect(listener.didReceiveData).to.be.false;
        regBind.removeEventListener(statusChangedEventType, listener.onStatusChanged);
        regBind.removeEventListener(valueChangedEventType, listener.onValueChanged);
        regBind.removeEventListener(streamingDataEventType, listener.onDataReceived);
        reg2FieldBind.addEventListener(statusChangedEventType, listener.onStatusChanged);
        reg2FieldBind.addEventListener(valueChangedEventType, listener.onValueChanged);
        reg2FieldBind.addEventListener(streamingDataEventType, listener.onDataReceived);
        activeCore.setValue(1);
        expect(reg2Bind.getValue()).to.be.equal(2);
        expect(reg2FieldBind.getValue()).to.be.equal(2);
        expect(regBind.getValue()).to.be.equal(9668);
        expect(regFieldBind.getValue()).to.be.equal(4);
        expect(regField2Bind.getValue()).to.be.equal(3);
        expect(regField3Bind.getValue()).to.be.equal(2);
        expect(regBind.isStale()).to.be.false;
        expect(regField3Bind.isStale()).to.be.false;
        expect(reg2Bind.isStale()).to.be.false;
        await sleep(1);
        expect(packetCount.getValue()).to.be.equal(0);
        listener.verifyValueChangedTo(2);
        expect(listener.didReceiveData).to.be.false;
        expect(listener.didStatusChange).to.be.false;
        activeCore.setValue(1);
        expect(listener.didValueChange).to.be.false;
        expect(listener.didReceiveData).to.be.false;
        expect(listener.didStatusChange).to.be.false;
        await sleep(1);
        expect(packetCount.getValue()).to.be.equal(0);
    });

    it('setStatus', async () => {
        coresAllreg2Bind.status = Status.createErrorStatus('reg all error');
        expect(reg2FieldBind.status!.message).to.be.equal('reg all error');
        expect(reg2Bind.status!.message).to.be.equal('reg all error');
        expect(coresAllreg2Bind.status!.message).to.be.equal('reg all error');
        listener.verifyStatusChangedTo('reg all error');
        reg2Bind.status = Status.createErrorStatus('active error');
        expect(reg2FieldBind.status!.message).to.be.equal('active error');
        expect(reg2Bind.status!.message).to.be.equal('active error');
        expect(coresAllreg2Bind.status!.message).to.be.equal('reg all error');
        listener.verifyStatusChangedTo('active error');
        reg2FieldBind.status = Status.createErrorStatus('field error');
        expect(reg2FieldBind.status!.message).to.be.equal('field error');
        expect(reg2Bind.status!.message).to.be.equal('active error');
        expect(coresAllreg2Bind.status!.message).to.be.equal('reg all error');
        listener.verifyStatusChangedTo('field error');
        reg2Bind.status = null;
        expect(reg2FieldBind.status!.message).to.be.equal('field error');
        expect(reg2Bind.status!.message).to.be.equal('reg all error');
        expect(coresAllreg2Bind.status!.message).to.be.equal('reg all error');
        reg2FieldBind.status = null;
        expect(reg2FieldBind.status!.message).to.be.equal('reg all error');
        expect(reg2Bind.status!.message).to.be.equal('reg all error');
        expect(coresAllreg2Bind.status!.message).to.be.equal('reg all error');
        expect(listener.didStatusChange).to.be.true;
        listener.didStatusChange = false;
        coresAllreg2Bind.status = null;
        expect(reg2FieldBind.status).to.be.null;
        expect(reg2Bind.status).to.be.null;
        expect(coresAllreg2Bind.status).to.be.null;
        listener.verifyStatusChangedTo('');
    });

    it('Read Errors', async () => {
        coresAllreg2Bind.refresh();
        await sleep(1);
        expect(packetCount.getValue()).to.be.equal(1);
        expect(codec.coreIndex).to.be.equal(-1);
        codec.addErrorResponse('no response', 4);
        await sleep(1);
        expect(reg2FieldBind.status!.message).to.be.equal('no response');
        expect(reg2Bind.status!.message).to.be.equal('no response');
        expect(coresAllreg2Bind.status!.message).to.be.equal('no response');
        listener.verifyStatusChangedTo('no response');
        await sleep(1);
        coresAllreg2Bind.refresh();
        reg2Bind.refresh();
        await sleep(1);
        expect(packetCount.getValue()).to.be.equal(1);
        expect(codec.coreIndex).to.be.equal(1);
        codec.addErrorResponse('bad core index', 4);
        await sleep(1);
        expect(reg2FieldBind.status!.message).to.be.equal('bad core index');
        expect(reg2Bind.status!.message).to.be.equal('bad core index');
        expect(coresAllreg2Bind.status!.message).to.be.equal('no response');
        listener.verifyStatusChangedTo('bad core index');
        coresAllreg2Bind.refresh();
        reg2Bind.refresh();
        await sleep(1);
        expect(packetCount.getValue()).to.be.equal(0);
        model.onDisconnected();
        await sleep(1);
        expect(reg2FieldBind.status).to.be.null;
        expect(reg2Bind.status).to.be.null;
        expect(coresAllreg2Bind.status).to.be.null;
        listener.verifyStatusChangedTo('');
        expect(packetCount.getValue()).to.be.equal(0);
    });

    it('Change value after disconnect', async () => {
        reg2Bind.setValue(-101);
        await sleep(1);
        expect(packetCount.getValue()).to.be.equal(0);
        listener.verifyValueChangedTo(-101);
        expect(listener.didReceiveData).to.be.false;
        expect(listener.didStatusChange).to.be.false;
    });

    it('Dispose', async () => {
        reg2Bind.dispose();
        coresAllreg2Bind.setValue([0xdead, 0xface]);
        expect(reg2Bind.getValue()).to.be.equal(-101);
        expect(listener.didValueChange).to.be.false;
        expect(listener.didReceiveData).to.be.false;
        expect(listener.didStatusChange).to.be.false;
        reg2FieldBind.dispose();
        reg2Bind.setValue(0);
        expect(reg2FieldBind.getValue()).to.be.equal(-101);
        expect(listener.didValueChange).to.be.false;
        expect(listener.didReceiveData).to.be.false;
        expect(listener.didStatusChange).to.be.false;
    });
});