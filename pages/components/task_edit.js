import { TimeInput } from "./time_input.js";
import { WebComponent } from "./web_component.js";
/**
 * Edit form for task.
 *
 * TODO(P1) Populate fields from task
 * TODO(P1) Fire on change events
 */
export class TaskEdit extends WebComponent {
  constructor(task) {
    super(TEMPLATE);
    this.task = task;
  }

  connectedCallback() {
    this.querySelector("#label").textContent = this.task.name;
    this.querySelector("#name").value = this.task.name;
    this.querySelector("#repeat").value = this.task.repeat;
    this.querySelector("#next").value = this.task.lastDone;
  }
}

customElements.define("wc-task-edit", TaskEdit);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id="task-display">
  <style>
    .task {
      width: 100%;
      display: flex;
    }

  </style>
  <wc-accordian>
    <div id = "label" slot="label">Edit Task</div>
    <div slot="content">
      My task is called:
      <input id="name" type="text"/>
      I should do it every:
      <wc-time-input id="repeat"></wc-time-input>
      I will next do it in:
      <wc-time-input id="next"></wc-time-input>
    </div>
  </wc-accordian>
</template>
`);
