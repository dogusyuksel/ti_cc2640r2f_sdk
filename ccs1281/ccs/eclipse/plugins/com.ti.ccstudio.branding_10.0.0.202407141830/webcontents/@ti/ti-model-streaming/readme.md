# ti-model-streaming



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute      | Description                                                                                                                                                                                                                                                                                                            | Type      | Default     |
| ------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `channelName` | `channel-name` | The name of a specific channel for streaming data to and from.  This is optional and the default is to stream all data.  When specified, the data must contain a member with the same name as the channelName to hold channel specific data.                                                                           | `string`  | `undefined` |
| `deviceId`    | `device-id`    | The optional identifier of a target device that is associated with this model, transport or codec. Specifying a target device idicates that this is necessary and/or optional for this connecting to the specified device.  The absence of a target device indicates this is necessary and/or optional for any device. | `string`  | `undefined` |
| `optional`    | `optional`     | A flag indicating that this model, transport, or codec is not necessary for connecting to the target, and any failure should not prevent connection.                                                                                                                                                                   | `boolean` | `false`     |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
