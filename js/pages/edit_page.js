import { TaskEdit } from "./components/task_edit.js";
import { WebComponent } from "./components/web_component.js";

/**
 * Page for task CRUD operations
 *
 */
export class EditPage extends WebComponent {
  constructor(store) {
    super(TEMPLATE);
    this.store = store;

    this.bind("onDone");
    this.bind("onAdmin");
  }

  connectedCallback() {
    let taskDiv = this.querySelector("#tasks");
    let add = new TaskEdit({});
    add.create = true;
    taskDiv.append(add);
    this.store.tasks.forEach(task => {
      let edit = new TaskEdit(task);
      taskDiv.append(edit);
    });

    this.querySelector("#done").addEventListener("click", this.onDone);
    this.querySelector("#admin").addEventListener("click", this.onAdmin);
  }

  disconnectedCallback() {
    this.querySelector("#done").removeEventListener("click", this.onDone);
    this.querySelector("#admin").removeEventListener("click", this.onAdmin);
  }

  nav(page) {
    this.dispatchEvent(
      new CustomEvent("nav", {
        detail: {
          page: page
        },
        bubbles: true
      })
    );
  }

  onDone(e) {
    e.stopPropagation();
    this.nav("");
  }

  onAdmin(e) {
    e.stopPropagation();
    this.nav("admin");
  }
}

customElements.define("wc-edit-page", EditPage);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id = "home-page-template">
  <style>
  </style>
  <div id="tasks"> </div>
  <button id="done">Done</button>
  <button id="admin">Admin</button>
</template >
`);
