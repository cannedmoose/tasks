import { WebComponent } from "./web_component.js";
/**
 * A button that shows task information
 *
 * TODO(P1) Styling
 * TODO(P3) Add an "importance indicator visual" (want more underlines for more important task)
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
    this.querySelector("#name").textContent = val;
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

      background-color: white;
      border: none;
      border-bottom: 1px solid #ADD8E6;
    }

    /*TODO(P1) why doesn't html font apply to button */

  </style>
  <button id="button" class="task">
    <div id="name"></div>
  </button>
</template>
`);
