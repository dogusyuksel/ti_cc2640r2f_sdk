# ti-widget-toggle-switch



<!-- Auto Generated Below -->


## Properties

| Property           | Attribute            | Description                                                            | Type      | Default     |
| ------------------ | -------------------- | ---------------------------------------------------------------------- | --------- | ----------- |
| `caption`          | `caption`            | The widget caption text.                                               | `string`  | `''`        |
| `checked`          | `checked`            | If true, the widget is checked.                                        | `boolean` | `false`     |
| `disabled`         | `disabled`           | Controls the widget disabled state.                                    | `boolean` | `false`     |
| `hidden`           | `hidden`             | Sets to `true` to hide the element, otherwise `false`.                 | `boolean` | `false`     |
| `infoText`         | `info-text`          | The widget info icon help text.                                        | `string`  | `''`        |
| `label`            | `label`              | Provides label text to display                                         | `string`  | `'Check'`   |
| `labelWhenChecked` | `label-when-checked` | If defined, provides label text to display when check state is checked | `string`  | `undefined` |
| `readonly`         | `readonly`           | Controls the widget readonly state.                                    | `boolean` | `false`     |
| `tooltip`          | `tooltip`            | Controls the tooltip that is displayed for this widget.                | `string`  | `''`        |


## Events

| Event                  | Description                                                                   | Type                               |
| ---------------------- | ----------------------------------------------------------------------------- | ---------------------------------- |
| `checked-changed`      | Fired when the `checked` property is changed.                                 | `CustomEvent<{ value: boolean; }>` |
| `css-property-changed` | Event `css-property-changed`, with `detail: { name: string, value: string }`. | `CustomEvent<any>`                 |


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
