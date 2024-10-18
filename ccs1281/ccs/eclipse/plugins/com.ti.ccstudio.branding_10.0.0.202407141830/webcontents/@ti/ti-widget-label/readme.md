 `ti-widget-label` is a bindable version of the <label> html element.
  By default, the labels hover color and underline color do not show unless explicity set.

  Example:

      <ti-widget-label label="my text"></ti-widget-label>
 
   | Custom property                           | Description              | Default                   |
   | ----------------------------------------- | ------------------------ | ------------------------- |
   | `--ti-widget-label-color`                 | label color              | `--ti-font-color`         |
   | `--ti-widget-label-hover-color`           | on hover font color      | `--ti-widget-label-color` |
   | `--ti-widget-label-hover-underline-color` | on hover underline color | `unset`                   |
 
  @customElement ti-widget-label
  @demo @ti/ti-widget-label/demo/index.html
  @label Label
  @group Common Widgets
  @archetype <ti-widget-label></ti-widget-label>

