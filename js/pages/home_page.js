import { TaskList } from "./components/task_list.js";
import { WebComponent } from "./components/web_component.js";

/**
 * The home page
 *
 * TODO(P2) make sure event handlers are cleaned up
 * TODO(P3) allow filter params to be passed in
 *
 */
export class HomePage extends WebComponent {
  constructor(store) {
    super(TEMPLATE);
    this.store = store;
  }

  connectedCallback() {
    let taskDiv = this.querySelector("#tasks");
    let overdue = new TaskList(
      this.store.tasks,
      this.makeFilter(Number.NEGATIVE_INFINITY, 0),
      this.scoreComp
    );

    // TODO(P2) move out of function
    let EVs = e => {
      this.refreshTasks();
    };

    overdue.label = "Overdue";
    overdue.id = "overdue";
    overdue.open = true;
    taskDiv.append(overdue);
    overdue.addEventListener("taskchange", EVs);
    let soon = new TaskList(
      this.store.tasks,
      this.makeFilter(0, 12),
      this.timeComp
    );
    soon.label = "Due Soon";
    soon.id = "soon";
    soon.open = true;
    soon.addEventListener("taskchange", EVs);
    taskDiv.append(soon);
    let later = new TaskList(
      this.store.tasks,
      this.makeFilter(12, 48),
      this.timeComp
    );
    later.label = "Due Later";
    later.id = "later";
    later.open = false;
    later.addEventListener("taskchange", EVs);
    taskDiv.append(later);
    let rest = new TaskList(
      this.store.tasks,
      this.makeFilter(48, Infinity),
      this.timeComp
    );
    rest.label = "Upcoming";
    rest.id = "rest";
    rest.open = false;
    rest.addEventListener("taskchange", EVs);
    taskDiv.append(rest);
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

  refreshTasks() {
    let overdue = this.querySelector("#overdue");
    let soon = this.querySelector("#soon");
    let later = this.querySelector("#later");
    let rest = this.querySelector("#rest");

    overdue.refreshTasks();
    soon.refreshTasks();
    later.refreshTasks();
    rest.refreshTasks();
  }
}

customElements.define("wc-home-page", HomePage);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id = "home-page-template">
    <style>

    :host{
      width: 100%;
    }
  </style>
  <div id="tasks"></div>
</template >
`);
