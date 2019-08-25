import { TaskEdit } from "./components/task_edit.js";
import { WebComponent } from "./components/web_component.js";

/**
 * Page for task CRUD operations
 *
 * TODO(P1) hook up to future edit_task events
 * TODO(P2) make sure event handlers are cleaned up
 *
 */
export class EditPage extends WebComponent {
  constructor(tasks) {
    super(TEMPLATE);
    this.tasks = tasks;
  }

  connectedCallback() {
    let content = this.querySelector("#content");
    this.tasks.forEach(task => {
      let edit = new TaskEdit(task);
      edit.name = task.name;
      edit.addEventListener("change", e => {
        e.stopPropagation();
        console.log(e);
      });
      content.append(edit);
    });
  }
}

customElements.define("wc-edit-page", EditPage);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id = "home-page-template">
  <style>
  </style>
  <div id="content"> </div>
</template >
`);
