import { WebComponent } from "./web_component.js";
/**
 * A task that can be clicked to be done.
 *
 * TODO(P1) Add onclick handler
 * TODO(P1) Styling
 * TODO(P2) Add an "importance measure" (want more underlines for more important task)
 */
export class Task extends WebComponent {
  constructor() {
    super(TEMPLATE);
  }

  get name() {
    return this.getAttribute("name");
  }

  set name(val) {
    this.setAttribute("name", val);
    this.shadowRoot.querySelector("#name").textContent = val;
  }

  connectedCallback() {
    this._upgradeProperty("name");
  }
}

customElements.define("wc-task", Task);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id="task-display">
  <style>
    .task {
      width: 100%;
      display: flex;
    }

  </style>
  <button class="task">
    <div id="name"></div>
  </button>
</template>
`);
