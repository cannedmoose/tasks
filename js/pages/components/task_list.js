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
    // TODO(P2) Test to make sure we aren't dropping/duping tasks
    if (el) {
      // We have a task and an element to put it in
      el.task = task;
      // TODO(P2) figure out better way to enable interacting for single element
      el.classList.remove("interacting");
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
  #label,#eye,#add {
    font-size: 1em;
    flex:1;
  }

  #label {
    white-space: nowrap;
    text-decoration: underline;
  }

  #add {
    text-align: right;
  }
  #eye {
    flex:0;
    text-align: center;
  }

  .sticky {
    /*position: -webkit-sticky;*
    position: sticky;
    top:0px;*/
  }
  .menu {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    top: .1em;

    padding: 0 .5em;

    border-bottom: 1px solid #ADD8E6;
    border-top: 3px solid #ADD8E6;
    background-color: white;
  }

  .spacer {
    position: -webkit-sticky;
    position: sticky;
    top: 0px;
    height: .1em;
    background-color: white;
  }

  #content {
    background-color: white;
  }
</style>
    <div class="sticky spacer"></div>
    <div class="sticky menu">
      <div id ="label"></div>
      <div id="eye" class="button"></div>
      <div id="add" class="button">+</div>
    </div>
    <div id ="content"></div>
`;
  }
}

customElements.define("wc-task-list", TaskList);
