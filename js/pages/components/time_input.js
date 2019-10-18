import { WebComponent } from "./web_component.js";
import { toMillis } from "../../utils/time_utils.js";

/**
 * For entering a period of time
 *
 * #Attributes
 *   - millis (read only)
 *   - unit
 *   - amount
 * #Events
 *   - change
 */
export class TimeInput extends WebComponent {
  constructor() {
    super();
  }

  upgrades() {
    return ["unit", "amount"];
  }

  connected() {
    this.addListener(this.qs("#unit"), "change", this.onChange);
    this.addListener(this.qs("#amount"), "change", this.onChange);
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

  get unit() {
    let unit = this.qs("#unit");
    return unit.options[unit.selectedIndex].value;
  }

  set unit(val) {
    let unit = this.qs("#unit");
    for (let i = 0; i < unit.options.length; i++) {
      let option = unit.options[i];
      option.selected = option.value === val;
    }
  }

  get amount() {
    let amount = this.qs("#amount");
    return parseInt(amount.value);
  }

  set amount(val) {
    this.qs("#amount").value = Math.round(val * 2) / 2;
  }

  get millis() {
    return toMillis(this.unit, this.amount);
  }

  template() {
    return /*html*/ `
  <style>
    :host {
      display: flex;
      flex-direction: row;
      align-items: flex-end;
    }

    #amount {
      text-align: right;
      margin-right: .5em;
      max-width: 3em;
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
      <option value="months">Months</option>
      <option value="years">Years</option>
    </select>
`;
  }
}

customElements.define("wc-time-input", TimeInput);
