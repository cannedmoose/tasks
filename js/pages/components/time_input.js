import { WebComponent } from "./web_component.js";
import { toMillis, fromMillis } from "../../utils/time_utils.js";

/**
 * For entering a period of time
 */
export class TimeInput extends WebComponent {
  constructor() {
    super(TEMPLATE);

    this.bind("onChange");
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

  onChange(e) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          millis: this.millis
        },
        bubbles: true
      })
    );
  }

  connectedCallback() {
    this._upgradeProperty("millis");

    this.querySelector("#unit").addEventListener("change", this.onChange);
    this.querySelector("#amount").addEventListener("change", this.onChange);
  }

  disconnectedCallback() {
    this.querySelector("#unit").removeEventListener("change", this.onChange);
    this.querySelector("#amount").removeEventListener("change", this.onChange);
  }
}

customElements.define("wc-time-input", TimeInput);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id="time-input">
  <style>
    select,input {
      border:none;
      border-bottom: 1px black dotted;
      line-height: 1.5em;
      font: inherit;
      color: rgb(37, 37, 37);
    }

    :host {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
    }

    #amount {
      text-align: right;
    }

    #unit {
      /*To make sure text lines up, maybe a better way to do this..*/
      height: 100%;
    }
  </style>
  <input id="amount" type="number" step=".5"/>
  <select id="unit">
    <option value="hours">Hours</option>
    <option value="days">Days</option>
    <option value="weeks">Weeks</option>
    <option value="years">Years</option>
  </select>
</template>
`);
