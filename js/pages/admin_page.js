import { WebComponent } from "./components/web_component.js";

/**
 * for 1337 users
 *
 */
export class AdminPage extends WebComponent {
  constructor(store) {
    super(TEMPLATE);
    this.store = store;
  }

  connectedCallback() {
    let con = this.querySelector("#console");
    // TODO show tasks values in a nicer way...
    con.value = JSON.stringify(
      {
        tasks: this.store.tasks.map(tasks => tasks.values),
        taskHistory: this.store.history,
        version: this.store.version
      },
      null,
      2
    );
  }
}

customElements.define("wc-admin-page", AdminPage);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id = "home-page-template">
  <style>
  </style>
  <textarea id="console"></textarea>
</template >
`);
