import { Accordian } from "./accordian.js";
import { Task } from "./task.js";
import { WebComponent } from "./web_component.js";

/**
 * A list of tasks.
 *
 * Displays a subset of tasks from a larger array, given by a filter.
 * Sorts taks by given comparator.
 *
 * TODO(P1) Add open/close arrow
 * TODO(P1) Make sure we size properly
 */
export class TaskList extends WebComponent {
  constructor(tasks, filter, compare) {
    super(TEMPLATE);
    this.tasks = tasks;
    this.filter = filter;
    this.compare = compare;
  }

  get label() {
    return this.getAttribute("label");
  }

  set label(val) {
    this.setAttribute("label", val);
  }

  get open() {
    return this.hasAttribute("open");
  }

  set open(val) {
    // Reflect the value of the open property as an HTML attribute.
    if (val) {
      this.setAttribute("open", "");
    } else {
      this.removeAttribute("open");
    }
    this.querySelector("#accordian").open = val;
  }

  connectedCallback() {
    this._upgradeProperty("open");
    this._upgradeProperty("label");

    this.refreshTasks();
  }

  refreshTasks() {
    let content = this.querySelector("#content");
    while (content.firstChild) {
      content.removeChild(content.firstChild);
    }

    let filteredTasks = this.tasks.filter(this.filter).sort(this.compare);
    filteredTasks.forEach(task => {
      let teskEl = new Task(task);
      teskEl.name = task.name;
      content.append(teskEl);
    });

    this.querySelector("#label").textContent =
      this.label + " - " + filteredTasks.length;
  }
}

customElements.define("wc-task-list", TaskList);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id = "task-list-template">
  <style>
    #label {
      border-bottom: 3px solid #ADD8E6;
      width: 100%;
      font-size: 1.5em;
    }

    #accordian {
      width: 100%;
    }
  </style>
  <wc-accordian id="accordian">
    <div id ="label" slot="label"></div>
    <div id ="content" slot="content"></div>
  </wc-accordian>
</template >
`);
