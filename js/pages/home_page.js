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
    let display = this.qs("#display");
    if (this.editing) {
      edit.classList.remove("hidden");
      display.classList.add("hidden");

      edit.task = this.editing;
      edit.refresh();
    } else {
      edit.classList.add("hidden");
      display.classList.remove("hidden");

      let tags = this.store.allTags();
      let dueTasks = this.store.tasks.filter(task => task.isDue(Date.now()));
      let t = tags.sort((tag1, tag2) => {
        let due1 = dueTasks
          .filter(task => task.tags.includes(tag1))
          .sort((t1, t2) => t2.due - t1.due);
        let due2 = dueTasks
          .filter(task => task.tags.includes(tag2))
          .sort((t1, t2) => t2.due - t1.due);
        let lengthDiff = due2.length - due1.length;
        if (lengthDiff == 0) {
          lengthDiff = due1.length > 0 ? due2[0].due - due1[0].due : 0;
        }
        return lengthDiff;
      });

      this.zip(t, "wc-task-list", "#tasks", (tag, el) => {
        let taskFilter = task => task.tags.includes(tag);
        let template = new TaskBuilder(this.store, { tags: [tag] });
        if (el) {
          el.filter = taskFilter;
          el.label = tag;
          el.template = template;
          el.tag = tag;
          el.refresh();
        } else {
          el = new TaskList(this.store, taskFilter, this.timeComp, tag);
          el.label = tag;
          el.template = template;
          el.open = true;
          el.tag = tag;
          return el;
        }
      });
    }
  }

  connected() {
    // Set up periodic refresh
    window.setInterval(() => {
      if (this.qs("#display").classList.contains("hidden")) {
        return;
      }
      this.refresh();
    }, 3000);
    this.addListener(this.qs("#tasks"), "done", e => {
      e.detail.task.do();
      this.refresh();
    });

    this.addListener(this.qs("#tasks"), "edit", e => {
      this.editing = e.detail.task;
      this.refresh();
    });

    this.addListener(this.qs("#edit"), "delete", e => {
      e.detail.task.remove();
      this.editing = null;
      this.refresh();
    });

    this.addListener(this.qs("#edit"), "cancel", e => {
      this.editing = null;
      this.refresh();
    });

    this.addListener(this.qs("#edit"), "confirm", e => {
      if (!this.editing.id) {
        this.editing.create();
      }
      this.editing = null;
      this.refresh();
    });
  }

  timeComp(t1, t2) {
    return t1.due - t2.due;
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
  <div id="tasks" ></div>
</div>
`;
  }
}

customElements.define("wc-home-page", HomePage);
