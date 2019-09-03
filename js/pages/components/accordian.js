import { WebComponent } from "./web_component.js";

/**
 * A generic accordian, can be opened/closed.
 *
 * Fires a toggle event when open state changes.
 */
export class Accordian extends WebComponent {
  constructor() {
    super();
    this.labelClick = this.labelClick.bind(this);
  }

  get open() {
    return this.hasAttribute("open");
  }

  set open(val) {
    if (val) {
      this.setAttribute("open", "");
      this.querySelector(".content").classList.add("open");
      this.querySelector(".label").classList.add("open");
    } else {
      this.removeAttribute("open");
      this.querySelector(".content").classList.remove("open");
      this.querySelector(".label").classList.remove("open");
    }
  }

  connected() {
    this._upgradeProperty("open");
    this.addListener("click", this.labelClick, ( ".label"));
  }

  labelClick(e) {
    this.open = !this.open;
    this.dispatchEvent(
      new CustomEvent("toggle", {
        detail: { state: this.open },
        bubbles: true
      })
    );
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
    cursor: pointer;
    -webkit-user-select: none;  /* Chrome all / Safari all */
    -moz-user-select: none;     /* Firefox all */
    -ms-user-select: none;      /* IE 10+ */
    user-select: none;          /* Likely future */
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
</style>
<slot class="label" name="label">Accordian</slot>
<slot class="content" name="content">CONTENT</slot>`;
  }
}

customElements.define("wc-accordian", Accordian);
