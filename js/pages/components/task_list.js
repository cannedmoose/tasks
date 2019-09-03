import { Accordian } from "./accordian.js";
import { Task } from "./task.js";
import { WebComponent } from "./web_component.js";

/**
 * A list of tasks.
 *
 * Displays a subset of tasks from a larger array, given by a filter.
 * Sorts taks by given comparator.
 *
 * TODO(P3) Add open/close arrow
 */
export class TaskList extends WebComponent {
  constructor(tasks, filter, compare) {
    super();
    this.tasks = tasks;
    this.filter = filter;
    this.compare = compare;
  }

  /**
   * Zips a and b
   */
  zip(a, b) {
    let result = [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      result.push([a[i], b[i]]);
    }
    return result;
  }

  refresh() {
    let filteredTasks = this.tasks.filter(this.filter).sort(this.compare);

    this.zip(filteredTasks, this.querySelectorAll("wc-task")).forEach(e =>
      this.refreshTask(e[0], e[1])
    );
    this.querySelector("#label").textContent =
      this.label + " - " + filteredTasks.length;
  }

  refreshTask(task, el) {
    // TODO(P1) NUMBERED TASK TEST TO MAKE SURE THIS WORKS THE WAY WE THINK
    let content = this.querySelector("#content");
    if (task && el) {
      // We have a task to fill
      el.task = task;
      el.refresh();
    } else if (task) {
      // No el for the task, create one
      let el = new Task(task);
      this.addListener(el, "change", this.taskChange);
      this.addListener(el, "toggle", this.taskToggle);
      content.append(el);
    } else if (el) {
      // No task for el, remove it
      // Delete element
      content.removeChild(el);
    }
  }

  taskChange(e) {
    let kind = e.detail.type;
    if (kind === "done") {
      e.detail.task.storage.history.push({
        name: e.detail.task.name,
        time: Date.now()
      });
      e.detail.task.lastDone = Date.now();
    } else if (kind === "remove") {
      e.detail.task.remove();
    }
    this.dispatchEvent(
      new CustomEvent("taskchange", {
        detail: { task: e.detail.task },
        bubbles: true
      })
    );
  }

  taskToggle(e) {
    this.dispatchEvent(
      new CustomEvent("tasktoggle", {
        detail: { task: e.detail.task, target: e.target },
        bubbles: true
      })
    );
  }

  get label() {
    return this.getAttribute("label");
  }

  set label(val) {
    this.setAttribute("label", val);
  }

  get open() {
    return this.querySelector("#accordian").open;
  }

  set open(val) {
    this.querySelector("#accordian").open = val;
    if (val) {
      this.setAttribute("open", "");
    } else {
      this.removeAttribute("open");
    }
  }

  template() {
    return /*html*/ `
<style>
  #label {
    border-bottom: 3px solid #ADD8E6;
    width: 100%;
    font-size: 1.5em;
  }

  #accordian {
    width: 100%;
  }

  .interacting {
    pointer-events: all;
  }
</style>
<wc-accordian id="accordian">
  <div id ="label" slot="label"></div>
  <div id ="content" slot="content"></div>
</wc-accordian>
`;
  }
}

customElements.define("wc-task-list", TaskList);
