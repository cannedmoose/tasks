import { WebComponent } from "./web_component.js";

/**
 * A generic accordian, can be opened/closed.
 *
 * TODO(P1): Styling;
 *    - Cursor + text highlight on label
 *    - general label
 * TODO(P3): fire open/close event;
 */
export class Accordian extends WebComponent {
  constructor() {
    super(TEMPLATE);
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

  connectedCallback() {
    this._upgradeProperty("open");

    this.bind("_onLabelClick");
    this.shadowRoot
      .querySelector(".label")
      .addEventListener("click", this._onLabelClick);
  }

  _onLabelClick(e) {
    this.open = !this.open;
  }

  disconnectedCallback() {
    this.shadowRoot
      .querySelector(".label")
      .removeEventListener("click", this._onLabelClick);
  }
}

customElements.define("wc-accordian", Accordian);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id = "accordian-template">
    <style>
    .content {
        display: none;
    }

    .content.open {
      display: block;
      border-top: none;
    }

    .label {
      cursor: pointer;
      -webkit-user-select: none;  /* Chrome all / Safari all */
      -moz-user-select: none;     /* Firefox all */
      -ms-user-select: none;      /* IE 10+ */
      user-select: none;          /* Likely future */
      border-bottom: 2px solid #ADD8E6;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }

    .label::after {
      content: "◀";
    }

    .open.label::after {
      content: "▽";
    }

  </style>
    <div class="label"><slot  name="label">Accordian</slot></div>
    <slot class="content" name="content">CONTENT</slot>
  </template >
`);
