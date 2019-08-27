import { TaskEdit } from "./components/task_edit.js";
import { toMillis } from "../utils/time_utils.js";
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
    this.bind("onAdmin");
  }

  connectedCallback() {
    this.refresh();
    this.querySelector("#done").addEventListener("click", this.onDone);
    this.querySelector("#admin").addEventListener("click", this.onAdmin);
  }

  refresh() {
    let taskDiv = this.querySelector("#tasks");
    while (taskDiv.firstChild) {
      taskDiv.removeChild(taskDiv.firstChild);
    }

    let add = new TaskEdit({
      name: ""
    });
    add.create = true;
    add.addEventListener("create", e => {
      const { name, repeat, lastDone } = e.detail.task;
      this.store.addTask(name, repeat, lastDone);
      this.refresh();
    });
    taskDiv.append(add);
    this.store.tasks.forEach(task => {
      let edit = new TaskEdit(task);
      // TODO(P2) move out into function
      edit.addEventListener("delete", e => {
        this.store.deleteTask(e.detail.task);
        this.refresh();
      });
      taskDiv.append(edit);
    });
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
