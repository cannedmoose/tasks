import { TimeInput } from "./time_input.js";
import { WebComponent } from "./web_component.js";
/**
 * Edit form for task.
 *
 * TODO(P2) split out create/edit...
 */
export class TaskEdit extends WebComponent {
  constructor(task) {
    super(TEMPLATE);
    this.task = task;
    this.bind("onChange");
    this.bind("onAction");
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
    this.querySelector("#next").millis = this.task.lastDone
      ? this.task.lastDone + this.task.repeat - now
      : undefined;
    this.querySelector("#next").addEventListener("change", this.onChange);
    this.querySelector("#action").addEventListener("click", this.onAction);
  }

  onAction(e) {
    if (this.create) {
      this.dispatchEvent(
        new CustomEvent("create", {
          detail: {
            task: this.task
          },
          bubbles: true
        })
      );
    } else {
      this.dispatchEvent(
        new CustomEvent("delete", {
          detail: {
            task: this.task
          },
          bubbles: true
        })
      );
    }
  }

  onChange(e) {
    let now = Date.now();

    let name = this.querySelector("#name").value;
    let next = this.querySelector("#next").millis;
    let repeat = this.querySelector("#repeat").millis;

    this.task.name = name;
    this.task.lastDone = now - (repeat - next);
    this.task.repeat = repeat;
    if (!this.create) {
      this.querySelector("#label").textContent = this.task.name;
    }
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
