import { WebComponent } from "./web_component.js";
import { toMillis, fromMillis } from "./time_utils.js";

/**
 * For entering a period of time
 *
 * TODO(P1) bubble up change
 */
export class TimeInput extends WebComponent {
  constructor() {
    super(TEMPLATE);
  }
  get unit() {
    let unit = this.querySelector("#unit");
    return unit.options[unit.selectedIndex].value;
  }

  set unit(val) {
    let unit = this.querySelector("#unit");
    for (let i = 0; i < unit.options.length; i++) {
      let option = unit.options[i];
      option.selected = option.value === val;
    }
  }

  get amount() {
    let amount = this.querySelector("#amount");
    return parseInt(amount.value);
  }

  set amount(val) {
    this.querySelector("#amount").value = Math.round(val * 2) / 2;
  }

  get millis() {
    return toMillis(this.unit, this.amount);
  }

  set millis(val) {
    let converted = fromMillis(val);
    this.unit = converted.unit;
    this.amount = converted.amount;
  }

  connectedCallback() {
    this._upgradeProperty("millis");
  }
}

customElements.define("wc-time-input", TimeInput);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id="time-input">
  <style>
  </style>
  <input id="amount" type="number" step =".5"/>
  <select id="unit">
    <option value="hours">Hours</option>
    <option value="days">Days</option>
    <option value="weeks">Weeks</option>
    <option value="years">Years</option>
  </select>
</template>
`);
