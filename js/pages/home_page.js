//import { TaskList } from "./components/task_list.js";
import { WebComponent } from "./components/web_component.js";
import { Task } from "./components/task.js";
import { TaskList } from "./components/task_list.js";
import { TaskBuilder } from "../utils/task_store.js";
import { toMillis, fromMillis } from "../utils/time_utils.js";

/**
 * The home page
 * TODO(P1) comments
 * TODO(P2) make sure event handlers are cleaned up
 * TODO(P3) allow filter params to be passed in
 *
 */
export class HomePage extends WebComponent {
  constructor(store) {
    super();
    this.store = store;
  }

  connected() {
    window.setInterval(() => {
      if (this.querySelector("#tasks").classList.contains("frozen")) {
        return;
      }
      console.log("refresh");
      this.refreshTasks();
    }, 2000);

    let EVs = e => {
      this.refreshTasks();
    };

    let OVs = e => {
      this.querySelector("#tasks").classList.toggle("frozen");
      e.detail.target.classList.toggle("interacting");
      if (!e.detail.target.open) {
        this.refreshTasks();
      }
    };

    let taskDiv = this.querySelector("#tasks");

    let overdue = new TaskList(
      this.store.tasks,
      this.makeFilter(Number.NEGATIVE_INFINITY, 0),
      this.scoreComp
    );
    overdue.label = "Overdue";
    overdue.open = true;
    taskDiv.append(overdue);
    overdue.addListener("taskchange", EVs);
    overdue.addListener("tasktoggle", OVs);

    let soon = new TaskList(
      this.store.tasks,
      this.makeFilter(0, 12),
      this.timeComp
    );
    soon.label = "Due Soon";
    soon.open = true;
    soon.addListener("taskchange", EVs);
    soon.addListener("tasktoggle", OVs);
    taskDiv.append(soon);

    let later = new TaskList(
      this.store.tasks,
      this.makeFilter(12, 48),
      this.timeComp
    );
    later.label = "Due Later";
    later.open = false;
    later.addListener("taskchange", EVs);
    later.addListener("tasktoggle", OVs);
    taskDiv.append(later);
    let rest = new TaskList(
      this.store.tasks,
      this.makeFilter(48, Infinity),
      this.timeComp
    );
    rest.label = "Upcoming";
    rest.open = false;
    rest.addListener("taskchange", EVs);
    rest.addListener("tasktoggle", OVs);
    taskDiv.append(rest);

    var addTask = this.querySelector("#addTask");
    addTask.addListener("toggle", e => {
      // TODO(P1) handle different changes
      /*if (e.detail.task.name !== "") {
      e.detail.task.create();
      }*/
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

  refreshTasks() {
    console.log("REFRESHING");
    this.querySelectorAll("wc-task-list").forEach(el => el.refreshTasks());

    let addTask = this.querySelector("#addTask");
    addTask.task = new TaskBuilder(
      this.store,
      "",
      toMillis("days", 1),
      Date.now() - toMillis("days", 1)
    );
    addTask.refresh();
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
