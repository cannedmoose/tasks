import { Accordian } from "./accordian.js";
import { Task } from "./task.js";
import { WebComponent } from "./web_component.js";

/**
 * A list of tasks.
 *
 * Displays a subset of tasks from a larger array, given by a filter.
 * Sorts taks by given comparator.
 * #Attributes
 *   - label
 *   - open
 * #Events
 *   - taskchange
 *   - tasktoggle
 */
export class TaskList extends WebComponent {
  constructor(store, filter, compare) {
    super();
    this.store = store;
    this.filter = filter;
    this.compare = compare;
  }

  refresh() {
    let filteredTasks = this.store.tasks.filter(this.filter).sort(this.compare);

    this.zip(filteredTasks, this.qsAll("wc-task")).forEach(e =>
      this.refreshTask(e[0], e[1])
    );
    this.sub("#label", this.label + " - " + filteredTasks.length);
  }

  refreshTask(task, el) {
    // TODO(P2) Test to make sure we aren't dropping/duping tasks
    let content = this.qs("#content");
    if (task && el) {
      // We have a task and an element to put it in
      el.task = task;
      // TODO(P2) figure out better way to enable interacting for single element
      el.classList.remove("interacting");
      el.refresh();
    } else if (task) {
      // We have a task but no element to put it in
      let el = new Task(task);
      this.addListener(el, "change", this.taskChange);
      this.addListener(el, "toggle", this.taskToggle);
      content.append(el);
    } else if (el) {
      // We have an extra element, remove it
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
    return this.qs("#accordian").open;
  }

  set open(val) {
    this.qs("#accordian").open = val;
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

  /**
   * Zips a and b
   * TODO(P3) move to a util class
   */
  zip(a, b) {
    let result = [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      result.push([a[i], b[i]]);
    }
    return result;
  }
}

customElements.define("wc-task-list", TaskList);
