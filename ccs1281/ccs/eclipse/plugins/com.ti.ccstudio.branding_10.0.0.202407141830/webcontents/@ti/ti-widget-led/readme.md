# ti-widget-led



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute   | Description                                             | Type      | Default |
| ---------- | ----------- | ------------------------------------------------------- | --------- | ------- |
| `caption`  | `caption`   | The widget caption text.                                | `string`  | `''`    |
| `glow`     | `glow`      | When true, turns the LED glow gradient 'on'.            | `boolean` | `true`  |
| `hidden`   | `hidden`    | Sets to `true` to hide the element, otherwise `false`.  | `boolean` | `false` |
| `infoText` | `info-text` | The widget info icon help text.                         | `string`  | `''`    |
| `on`       | `on`        | The LED active state. When true, turns the LED 'on'.    | `boolean` | `false` |
| `tooltip`  | `tooltip`   | Controls the tooltip that is displayed for this widget. | `string`  | `''`    |


## Events

| Event                  | Description                                                                   | Type                               |
| ---------------------- | ----------------------------------------------------------------------------- | ---------------------------------- |
| `css-property-changed` | Event `css-property-changed`, with `detail: { name: string, value: string }`. | `CustomEvent<any>`                 |
| `glow-changed`         | Fired when the `glow` property changed.                                       | `CustomEvent<{ value: boolean; }>` |
| `on-changed`           | Fired when the `on` property changed.                                         | `CustomEvent<{ value: boolean; }>` |


## Methods

### `fire(eventName: string, detail: object) => Promise<void>`

Fire an widget event.

#### Returns

Type: `Promise<void>`



### `getCSSProperty(name: string) => Promise<string>`

Returns the value of a CSS property.

#### Returns

Type: `Promise<string>`



### `refresh() => Promise<void>`

Refresh the element.

#### Returns

Type: `Promise<void>`



### `setCSSProperty(name: string, value: string) => Promise<void>`

Sets the CSS property.

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
