import { WebComponent } from "./components/web_component.js";

/**
 * for 1337 users
 */
export class AdminPage extends WebComponent {
  constructor(store) {
    super();
    this.store = store;
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

    this.addListener(this.qs("#done"), "click", this.onDone);
    this.addListener(this.qs("#import"), "click", this.onImport);
  }

  onDone(e) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("nav", {
        detail: {
          page: ""
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

const TEMPLATE = /*html*/ `
<template id = "home-page-template">
  <style>
    #console {
      width: 100vw;
      height: 50vh;
    }
  </style>
  <textarea id="console"></textarea>
  <button id="done">Done</button>
  <button id="import">Import</button>
</template >
`;
