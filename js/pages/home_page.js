import { WebComponent } from "./components/web_component.js";
import { Task } from "./components/task.js";
import { TaskList } from "./components/task_list.js";
import { TaskBuilder } from "../utils/task_store.js";
import { toMillis } from "../utils/time_utils.js";

/**
 * The home page
 
 */
export class HomePage extends WebComponent {
  constructor(store) {
    super();
    this.store = store;
  }

  refresh() {
    this.qs("#tasks").classList.remove("frozen");
    this.qs("#addTask").classList.remove("interacting");
    this.qs("#addTask").classList.remove("frozen");
    this.qsAll("wc-task-list").forEach(el => el.refresh());

    let addTask = this.qs("#addTask");
    addTask.refresh();
  }

  connected() {
    window.setInterval(() => {
      if (this.qs("#tasks").classList.contains("frozen")) {
        return;
      }
      this.refresh();
    }, 2000);
    this.makeTaskList(
      this.makeFilter(Number.NEGATIVE_INFINITY, 0),
      this.timeComp,
      "Overdue",
      true
    );

    this.makeTaskList(this.makeFilter(0, 12), this.timeComp, "Due Soon", true);

    this.makeTaskList(
      this.makeFilter(12, 48),
      this.timeComp,
      "Due Later",
      false
    );

    this.makeTaskList(
      this.makeFilter(48, Infinity),
      this.timeComp,
      "Upcoming",
      false
    );

    let addTask = this.qs("#addTask");
    addTask.task = new TaskBuilder(this.store);
    this.addListener(addTask, "toggle", e => {
      if (e.detail.open) {
        this.qs("#tasks").classList.toggle("frozen");
        this.qs("#addTask").classList.toggle("interacting");
        return;
      }
      if (!e.detail.open && addTask.task.name !== "") {
        this.qs("#addTask").task.create();
        this.qs("#addTask").task.clear();
      }
      this.refresh();
    });

    this.addListener(addTask, "change", e => {
      if (e.detail.type === "remove") {
        this.qs("#addTask").task.clear();
      }
      this.refresh();
    });
  }

  makeTaskList(filter, comp, label, open) {
    let taskDiv = this.qs("#tasks");
    let listEl = new TaskList(this.store, filter, comp);
    listEl.label = label;
    listEl.open = open;
    taskDiv.append(listEl);
    this.addListener(listEl, "taskchange", this.refresh);
    this.addListener(listEl, "tasktoggle", this.onTaskToggle);
  }

  onTaskToggle(e) {
    this.qs("#tasks").classList.toggle("frozen");
    this.qs("#addTask").classList.toggle("frozen");
    e.detail.target.classList.toggle("interacting");
    if (!e.detail.target.open) {
      this.refresh();
    }
  }

  makeFilter(from, to) {
    return task => {
      let time = Date.now();
      let due = task.due;
      // Make sure we have repeats left
      if (task.repeat <= 0) {
        return false;
      }
      return (
        time + from * 60 * 60 * 1000 < due && time + to * 60 * 60 * 1000 > due
      );
    };
  }

  timeComp(t1, t2) {
    let time = Date.now();
    return t1.due - t2.due;
  }

  template() {
    return /*html*/ `
<style>

:host{
  width: 100%;
}

/* TODO(P2) rework frozen */
.frozen {
  pointer-events: none;
}
</style>
<div id="tasks" ></div>
<wc-task id="addTask" create ></wc-task>
`;
  }
}

customElements.define("wc-home-page", HomePage);
