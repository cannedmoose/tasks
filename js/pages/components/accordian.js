import { WebComponent } from "./web_component.js";

/**
 * A generic accordian, can be opened/closed.
 *
 * #Attributes
 *   - open
 * #Events
 *   - toggle
 * #Slots
 *   - label
 *   - content
 */
export class Accordian extends WebComponent {
  constructor() {
    super();
  }

  upgrades() {
    return ["open"];
  }

  connected() {
    this.addListener(this.qs(".label"), "click", this.labelClick);
  }

  labelClick(e) {
    this.open = !this.open;
    this.dispatchEvent(
      new CustomEvent("toggle", {
        detail: { open: this.open },
        bubbles: true
      })
    );
  }

  get open() {
    return this.hasAttribute("open");
  }

  set open(val) {
    if (val) {
      this.setAttribute("open", "");
      this.qs(".content").classList.add("open");
      this.qs(".label").classList.add("open");
    } else {
      this.removeAttribute("open");
      this.qs(".content").classList.remove("open");
      this.qs(".label").classList.remove("open");
    }
  }

  template() {
    return /*html*/ `
<style>
  .content {
    display: none;
  }

  .content.open {
    display: block;
  }

  .label {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
</style>
<slot class="label button" name="label">Accordian</slot>
<slot class="content" name="content">CONTENT</slot>`;
  }
}

customElements.define("wc-accordian", Accordian);
