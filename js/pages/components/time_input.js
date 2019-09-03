import { WebComponent } from "./web_component.js";
import { toMillis, fromMillis } from "../../utils/time_utils.js";

/**
 * For entering a period of time
 *
 * TODO(P2) Make entry a easier
 *    - Single dropdown listing common options
 *    - EG day, 2 days, week, 2 weeks, month
 *    - + custom option for stuff that doesn't fit
 */
export class TimeInput extends WebComponent {
  constructor() {
    super();

    this.chango = this.chango.bind(this);
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

  chango(e) {
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

  connected() {
    this._upgradeProperty("unit");
    this._upgradeProperty("amount");
    this.addListener("change", this.chango, "#unit");
    this.addListener("change", this.chango, "#amount");
  }

  template() {
    return /*html*/ `
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
      margin-right: .5em;
    }

    #unit {
      /*To make sure text lines up, maybe a better way to do this..*/
      height: 1.5em;
    }
  </style>
  <input id="amount" type="number" step=".5"/>
  <select id="unit">
    <option value="hours">Hours</option>
    <option value="days">Days</option>
    <option value="weeks">Weeks</option>
    <option value="years">Years</option>
  </select>
`;
  }
}

customElements.define("wc-time-input", TimeInput);
