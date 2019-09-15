import { WebComponent } from "./components/web_component.js";

/**
 * for 1337 users
 */
export class AdminPage extends WebComponent {
  constructor(store) {
    super();
    this.store = store;
  }

  refresh() {
    let con = this.qs("#console");
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

  connected() {
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
    this.store.import(this.qs("#console").value);
  }

  template() {
    return /*html*/ `
<style>
  #console {
    width: 100vw;
    height: 50vh;
    font-size: .5em;
  }
  #done {
    height: 10vh;
    width: 10vw;
  }
  #import {
    height: 10vh;
    width: 10vw;
  }
  #buttons {
    padding-top: 5vh;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }
</style>
  <textarea id="console"></textarea>
  <div id="buttons">
  <button id="done">Done</button>
  <button id="import">Import</button>
</div>
    `;
  }
}

customElements.define("wc-admin-page", AdminPage);
