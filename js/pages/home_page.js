import { WebComponent } from "./components/web_component.js";
import { TaskEdit } from "./components/task_edit.js";
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
    this.editing = null;
  }

  refresh() {
    let edit = this.qs("#edit");
    let taskList = this.qs("#tasks");
    let display = this.qs("#display");
    if (this.editing) {
      edit.classList.remove("hidden");
      display.classList.add("hidden");

      edit.task = this.editing;
      edit.requestRefresh();
    } else {
      edit.classList.add("hidden");
      display.classList.remove("hidden");

      // TODO(P2) Tasklist is being constructed via template
      // Want some way to set it's shit during refresh AND connection
      taskList.filter = this.globalFilter;
      taskList.compare = this.timeComp;
      taskList.store = this.store;
      taskList.requestRefresh();
    }
  }

  connected() {
    let taskList = this.qs("#tasks");
    taskList.filter = this.globalFilter;
    taskList.compare = this.timeComp;
    taskList.store = this.store;

    // Set up periodic refresh
    window.setInterval(() => {
      if (this.qs("#display").classList.contains("hidden")) {
        return;
      }
      //this.requestRefresh();
    }, 3000);
    this.addListener(this.qs("#tasks"), "done", e => {
      e.detail.task.do();
      this.requestRefresh();
    });

    this.addListener(this.qs("#tasks"), "edit", e => {
      this.editing = e.detail.task;
      this.requestRefresh();
    });

    this.addListener(this.qs("#edit"), "delete", e => {
      e.detail.task.remove();
      this.editing = null;
      this.requestRefresh();
    });

    this.addListener(this.qs("#edit"), "cancel", e => {
      this.editing = null;
      this.requestRefresh();
    });

    this.addListener(this.qs("#edit"), "confirm", e => {
      if (!this.editing.id) {
        this.editing.create();
      }
      this.editing = null;
      this.requestRefresh();
    });
  }

  timeComp(t1, t2) {
    return t1.due - t2.due;
  }

  // look for tasks 12 hours ahead or done within last 12 hours
  globalFilter(task) {
    let now = Date.now();
    let period = toMillis("hours", 12);
    return task.isDue(now + period) || task.lastDone > now - period;
  }

  template() {
    return /*html*/ `
<style>

:host{
  width: 100%;
}

.hidden {
  display: none;
}

#edit {
  border: 2px dotted #ADD8E6;
  margin: 1em;
  padding: 1em;
}

#display {
  margin: 0em .2em;
}


</style>
<wc-task-edit id="edit"></wc-task-edit>
<div id="display">
  <wc-task-list id="tasks"></wc-task-list>
</div>
`;
  }
}

customElements.define("wc-home-page", HomePage);
