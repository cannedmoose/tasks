import { Accordian } from "./accordian.js";
import { Task } from "./task.js";
import { WebComponent } from "./web_component.js";

/**
 * A list of tasks.
 *
 * Displays a subset of tasks from a larger array, given by a filter.
 * Sorts taks by given comparator.
 *
 * TODO(P2) styling
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
      let button = document.createElement("wc-task");
      button.name = task.name;
      button.addEventListener("click", e => {
        e.stopPropagation();
        this.dispatchEvent(
          new CustomEvent("done", {
            detail: {
              task: task
            },
            bubbles: true
          })
        );
      });
      content.append(button);
    });

    this.querySelector("#label").textContent =
      this.label + " - " + filteredTasks.length;
  }
}

customElements.define("wc-task-list", TaskList);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id = "task-list-template">
  <style>
  </style>
  <wc-accordian id="accordian">
    <div id ="label" slot="label"></div>
    <div id ="content" slot="content"></div>
  </wc-accordian>
</template >
`);
