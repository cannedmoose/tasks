import { WebComponent } from "./components/web_component.js";
import { TaskEdit } from "./components/task_edit.js";
import { TaskList } from "./components/task_list.js";
import { TaskBuilder } from "../utils/task_store.js";
import { toMillis } from "../utils/time_utils.js";

/**
 * The home page
 *
 * TODO(P2) Add menifest so we can access offline.
 */
export class HomePage extends WebComponent {
  constructor(store) {
    super();
    this.store = store;
    this.editing = null;
    this.allTasks = false;
    this.globalFilter = this.globalFilter.bind(this);
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

      // TODO(P3) Figure out a nice way to set props on templated web component
      // in connected AND refresh
      taskList.filter = this.globalFilter;
      taskList.compare = this.timeComp;
      taskList.store = this.store;
      taskList.requestRefresh();
    }

    if (this.allTasks) {
      this.sub("#eye", "○");
    } else {
      this.sub("#eye", "◌");
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
      // TODO(P2) this is causing flickering on task list
      // Figure out why and remove.
      //this.requestRefresh();
    }, 3000);

    this.addListener(this.qs("#eye"), "click", e => {
      this.allTasks = !this.allTasks;
      this.requestRefresh();
    });

    this.addListener(this.qs("#add"), "click", e => {
      this.editing = new TaskBuilder(this.store, {});
      this.requestRefresh();
    });

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
    if (this.allTasks) {
      return true;
    }
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
  margin: .5em;
  padding: .5em;
}

#display {
  margin: 0em .2em;
}

.menu {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;

	padding: 0 .5em;

	border-bottom: 1px solid #ADD8E6;
	border-top: 3px solid #ADD8E6;
}

.menu > * {
	text-align: center;
	flex:1;
	flex-shrink: 0;
	white-space: nowrap;
}

.menu > :first-child {
	text-align: left;
}

.menu > :last-child {
	text-align: right;
}

#label {
	text-decoration: underline;
	cursor: default;
}


</style>
<div id="editdiv">
	<wc-task-edit id="edit"></wc-task-edit>
</div>
<div id="display">
	<div class="menu">
		<div></div>
		<div id="eye" class="button"></div>
		<div id="add" class="button">+</div>
	</div>
  <wc-task-list id="tasks"></wc-task-list>
</div>
`;
  }
}

customElements.define("wc-home-page", HomePage);
