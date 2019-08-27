import { WebComponent } from "./components/web_component.js";

/**
 * for 1337 users
 */
export class AdminPage extends WebComponent {
  constructor(store) {
    super(TEMPLATE);
    this.store = store;

    this.bind("onDone");
    this.bind("onImport");
  }

  connectedCallback() {
    let con = this.querySelector("#console");
    con.value = JSON.stringify(
      {
        tasks: this.store.tasks.map(tasks => tasks.values),
        taskHistory: this.store.history,
        version: this.store.version
      },
      null,
      2
    );

    this.querySelector("#done").addEventListener("click", this.onDone);
    this.querySelector("#import").addEventListener("click", this.onImport);
  }

  onDone(e) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("nav", {
        detail: {
          page: "edit"
        },
        bubbles: true
      })
    );
  }

  onImport(e) {
    e.stopPropagation();
    this.store.import(this.querySelector("#console").value);
  }
}

customElements.define("wc-admin-page", AdminPage);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id = "home-page-template">
  <style>
  </style>
  <textarea id="console"></textarea>
  <button id="done">Done</button>
  <button id="import">Import</button>
</template >
`);
