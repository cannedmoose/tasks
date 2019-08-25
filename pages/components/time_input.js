import { WebComponent } from "./web_component.js";

/**
 * For entering a period of time
 *
 * TODO(P1) bubble up change
 * TODO(P1) expose as millis
 * TODO(P1) allow setting as millis
 */
export class TimeInput extends WebComponent {
  get unit() {
    return this.getAttribute("unit");
  }

  set unit(val) {
    return this.setAttribute("unit", val);
  }

  get value() {
    return this.getAttribute("value");
  }

  set value(val) {
    return this.setAttribute("value", val);
  }

  constructor() {
    super(TEMPLATE);
  }

  connectedCallback() {
    this._upgradeProperty("unit");
    this._upgradeProperty("value");
  }
}

customElements.define("wc-time-input", TimeInput);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id="time-input">
  <style>
  </style>
  <input type="number" />
  <select>
    <option value="minutes">Minutes</option>
    <option value="hours">Hours</option>
    <option value="days">Days</option>
    <option value="weeks">Weeks</option>
    <option value="years">Years</option>
  </select>
</template>
`);
