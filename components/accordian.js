import { WebComponent } from "./web_component.js";

/**
 * A generic accordian, can be opened/closed.
 *
 * TODO(P1): Styling;
 *    - Cursor + text highlight on label
 *    - general label
 * TODO(P1): Add disconnectedCallback to get rid of event listener;
 * TODO(P2): open/close event;
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
      this.shadowRoot.querySelector(".content").classList.add("open");
    } else {
      this.removeAttribute("open");
      this.shadowRoot.querySelector(".content").classList.remove("open");
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

    .open {
      display: block;
      border: 2px dashed black;
      border-top: none;
    }

  </style>
    <div class="label"><slot  name="label">Accordian</slot></div>
    <div class="content"><slot name="content">CONTENT</slot></div>
  </template >
`);
