import { TimeInput } from "./time_input.js";
import { WebComponent } from "./web_component.js";
/**
 * Edit form for task.
 *
 * TODO(P1) add delete button
 */
export class TaskEdit extends WebComponent {
  constructor(task) {
    super(TEMPLATE);
    this.task = task;
    this.bind("onChange");
  }

  get create() {
    return this.hasAttribute("create");
  }

  set create(val) {
    if (val) {
      this.setAttribute("create", "");
      this.querySelector("#content").classList.add("create");
      this.querySelector("#accordian").open = true;
    } else {
      this.removeAttribute("create");
      this.querySelector("#content").classList.remove("create");
    }
  }

  connectedCallback() {
    this._upgradeProperty("create");
    let now = Date.now();

    if (this.create) {
      this.querySelector("#label").textContent = "Create Task";
    } else {
      this.querySelector("#label").textContent = this.task.name;
    }

    this.querySelector("#name").value = this.task.name;
    this.querySelector("#name").addEventListener("change", this.onChange);
    this.querySelector("#repeat").millis = this.task.repeat;
    this.querySelector("#repeat").addEventListener("change", this.onChange);
    this.querySelector("#next").millis = now - this.task.lastDone;
    this.querySelector("#next").addEventListener("change", this.onChange);

    this.querySelector("#action").addEventListener("click", this.onAction);
  }

  onAction(e) {
    if (this.create) {
      this.store;
    }
  }

  onChange(e) {
    let name = this.querySelector("#name").value;
    let next = this.querySelector("#next").millis;
    let repeat = this.querySelector("#repeat").millis;

    this.task.name = name;
    // TODO(P1) fix lastDone handling
    //this.task.next = next;
    this.task.repeat = repeat;
    this.querySelector("#label").textContent = this.task.name;
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

    #action:after {
      content: 'Delete';
    }

    .create > #action:after {
      content: 'Create';
    }

  </style>
  <wc-accordian id="accordian">
    <div id = "label" slot="label">Edit Task</div>
    <div id="content" slot="content">
      My task is called:
      <input id="name" type="text"/>
      I should do it every:
      <wc-time-input id="repeat"></wc-time-input>
      I will next do it in:
      <wc-time-input id="next"></wc-time-input>
      <button id="action"></button>
    </div>
  </wc-accordian>
</template>
`);
