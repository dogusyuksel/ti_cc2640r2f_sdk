# ti-model-register



<!-- Auto Generated Below -->


## Properties

| Property        | Attribute         | Description                                                                                                                                                                                                                                                                                                            | Type      | Default     |
| --------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `deviceId`      | `device-id`       | The optional identifier of a target device that is associated with this model, transport or codec. Specifying a target device idicates that this is necessary and/or optional for this connecting to the specified device.  The absence of a target device indicates this is necessary and/or optional for any device. | `string`  | `undefined` |
| `isDeviceArray` | `is-device-array` | The optional flag that if ture indicates that multi-device support is required.  All devices must be of the same class, and therefore same register set.  Also, they all must be available on the same interface through a single codec which also has multi-device support.                                           | `boolean` | `false`     |
| `optional`      | `optional`        | A flag indicating that this model, transport, or codec is not necessary for connecting to the target, and any failure should not prevent connection.                                                                                                                                                                   | `boolean` | `false`     |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
