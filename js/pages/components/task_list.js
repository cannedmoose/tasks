import { Accordian } from "./accordian.js";
import { TaskView } from "./task_view.js";
import { WebComponent } from "./web_component.js";
import { TaskBuilder } from "../../utils/task_store.js";

/**
 * A list of tasks.
 *
 * Displays a subset of tasks from a larger array, given by a filter.
 * Sorts taks by given comparator.
 * #Attributes
 *   - label
 */
export class TaskList extends WebComponent {
  constructor(store, filter, compare, template, tag) {
    super();
    this.store = store;
    this.filter = filter;
    this.compare = compare;
    this.template = template;
    this.tag = this.tag || tag;
  }

  upgrades() {
    return ["label"];
  }

  refresh() {
    let filter = this.filter;
    let tagState = this.tag ? this.store.tagState[this.tag] || "due" : "due";
    if (tagState == "due") {
      this.sub("#eye", "○");
      filter = task => task.isDue(Date.now()) && this.filter(task);
    } else if (tagState == "none") {
      this.sub("#eye", "●");
      filter = task => false;
    } else {
      this.sub("#eye", "◌");
    }
    let filteredTasks = this.store.tasks.filter(filter).sort(this.compare);
    this.zip(filteredTasks, "wc-task-view", "#content", this.refreshTask);
    this.sub("#label", this.label);
  }

  refreshTask(task, el) {
    if (el) {
      // We have a task and an element to put it in
      el.task = task;
      el.refresh();
    } else {
      // We have a task but no element to put it in
      let el = new TaskView(task);
      this.addListener(el, "done", this.bubble);
      this.addListener(el, "edit", this.bubble);
      return el;
    }
  }

  connected() {
    this.addListener(this.qs("#add"), "click", e => {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent("edit", {
          detail: { task: this.template },
          bubbles: true
        })
      );
    });

    this.addListener(this.qs("#eye"), "click", e => {
      // TODO(P1) properly store tagstate
      let tagState = this.store.tagState[this.tag] || "due";
      if (tagState == "due") {
        this.store.tagState[this.tag] = "all";
      } else if (tagState == "none") {
        this.store.tagState[this.tag] = "due";
      } else {
        this.store.tagState[this.tag] = "none";
      }
      this.store.store();
      this.refresh();
    });
  }

  get label() {
    return this.getAttribute("label");
  }

  set label(val) {
    this.setAttribute("label", val);
  }

  template() {
    return /*html*/ `
<style>
  :host {
    background-color: white;
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
    flex:0;
    padding:0 .5em;
    white-space: nowrap;
  }

  #label {
    text-decoration: underline;
    cursor: default;
  }
</style>
    <div class="menu">
      <div id ="label" class="button"></div>
      <div id="eye" class="button"></div>
      <div id="add" class="button">+</div>
    </div>
    <div id ="content"></div>
`;
  }
}

customElements.define("wc-task-list", TaskList);
