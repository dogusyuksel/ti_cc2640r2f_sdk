# ti-component-help



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description                                             | Type      | Default |
| --------- | --------- | ------------------------------------------------------- | --------- | ------- |
| `hidden`  | `hidden`  | Sets to `true` to hide the element, otherwise `false`.  | `boolean` | `false` |
| `tooltip` | `tooltip` | Controls the tooltip that is displayed for this widget. | `string`  | `''`    |


## Events

| Event                  | Description                                                                   | Type               |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------ |
| `css-property-changed` | Event `css-property-changed`, with `detail: { name: string, value: string }`. | `CustomEvent<any>` |


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




## Dependencies

### Depends on

- [ti-widget-markdown](../ti-widget-markdown)
- [ti-widget-fragment-html](../ti-widget-fragment-html)

### Graph
```mermaid
graph TD;
  ti-component-help --> ti-widget-markdown
  ti-component-help --> ti-widget-fragment-html
  style ti-component-help fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
