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
    this._upgradeProperty("name");
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
    <div slot="label">Edit Task</div>
    <div slot="content">
      My task is called:
      <input type="text"/>
      I should do it every:
      <wc-time-input></wc-time-input>
      I will next do it in:
      <wc-time-input></wc-time-input>
    </div>
  </wc-accordian>
</template>
`);
