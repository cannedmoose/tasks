import { WebComponent } from "./web_component.js";

export class Accordian extends WebComponent {
  constructor(open) {
    super(TEMPLATE);
    this.open = open;
  }

  get open() {
    return this.hasAttribute("open");
  }

  set open(val) {
    // Reflect the value of the open property as an HTML attribute.
    if (val) {
      this.setAttribute("open", "");
    } else {
      this.removeAttribute("open");
    }
    this.toggleOpen();
  }

  connectedCallback() {
    this.shadowRoot.querySelector(".label").onclick = e => {
      this.open = !this.open;
    };
  }

  toggleOpen() {
    this.shadowRoot.querySelector(".content").classList.toggle("open");
  }
}

customElements.define("the-accordian", Accordian);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id = "accordian-template" class="accordian">
    <style>
    .accordian {
        width: 100%;
    }

    .content {
        display: none;
    }

    .open {
      display: block;
      border: 2px dashed black;
      border-top: none;
    }

  </style>
  <slot class="label" name="label">Accordian</slot>
   <slot  class="content" name="content">CONTENT</slot>
</template >
`);
