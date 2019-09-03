//import { TaskList } from "./components/task_list.js";
import { WebComponent } from "./components/web_component.js";
import { Task } from "./components/task.js";
import { TaskList } from "./components/task_list.js";
import { TaskBuilder } from "../utils/task_store.js";
import { toMillis, fromMillis } from "../utils/time_utils.js";

/**
 * The home page
 * TODO(P1) comments
 * TODO(P3) allow filter params to be passed in
 *
 */
export class HomePage extends WebComponent {
  constructor(store) {
    super();
    this.store = store;
  }

  makeTaskList(filter, comp, label, open) {
    let taskDiv = this.querySelector("#tasks");
    let listEl = new TaskList(this.store.tasks, filter, comp);
    listEl.label = label;
    listEl.open = open;
    taskDiv.append(listEl);
    this.addListener(listEl, "taskchange", this.refresh);
    this.addListener(listEl, "tasktoggle", this.onTaskToggle);
  }

  connected() {
    window.setInterval(() => {
      if (this.querySelector("#tasks").classList.contains("frozen")) {
        return;
      }
      this.refresh();
    }, 2000);
    this.makeTaskList(
      this.makeFilter(Number.NEGATIVE_INFINITY, 0),
      this.scoreComp,
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

    // TODO(P1) Catch remove event from tasks in task_list

    let addTask = this.querySelector("#addTask");
    this.addListener(addTask, "toggle", e => {
      // TODO(P1)
      // IF IT"S A TOGGLE OPEN WE SHOULD RESET VALUES
      // IF IT"S A TOGGLE CLOSED WE SHOULD SAVE
      // IF IT"S A REMOVE WE SHOULD CLOSE WIUTHOUT SAVIONG
      if (e.detail.task.name !== "") {
        e.detail.task.create();
      }
      console.log("toggle", e);
    });

    addTask.task = new TaskBuilder(
      this.store,
      "",
      toMillis("days", 1),
      Date.now() - toMillis("days", 1)
    );
    addTask.refresh();
  }

  onTaskToggle(e) {
    this.querySelector("#tasks").classList.toggle("frozen");
    e.detail.target.classList.toggle("interacting");
    if (!e.detail.target.open) {
      this.refresh();
    }
  }

  refresh() {
    this.querySelectorAll("wc-task-list").forEach(el => el.refresh());

    let addTask = this.querySelector("#addTask");
    addTask.task = new TaskBuilder(
      this.store,
      "",
      toMillis("days", 1),
      Date.now() - toMillis("days", 1)
    );
  }

  makeFilter(from, to) {
    return task => {
      let time = Date.now();
      let due = task.lastDone + task.repeat;
      return (
        time + from * 60 * 60 * 1000 < due && time + to * 60 * 60 * 1000 > due
      );
    };
  }

  scoreComp(t1, t2) {
    let time = Date.now();
    var s1 = (time - t1.lastDone) / t1.repeat;
    var s2 = (time - t2.lastDone) / t2.repeat;
    var diff = s2 - s1;

    // TODO(P3) Check this ordering
    return Math.abs(diff) < 0.001 ? t2.repeat - t1.repeat : diff;
  }

  timeComp(t1, t2) {
    let time = Date.now();
    var d1 = time - t1.lastDone - t1.repeat;
    var d2 = time - t2.lastDone - t2.repeat;
    return d2 - d1;
  }

  template() {
    return /*html*/ `
<style>

:host{
  width: 100%;
}

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
