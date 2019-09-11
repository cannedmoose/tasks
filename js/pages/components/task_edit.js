import { WebComponent } from "./web_component.js";
import { TimeInput } from "./time_input.js";
import { Accordian } from "./accordian.js";
import { Tabs } from "./tabs.js";
import { toMillis, fromMillis } from "../../utils/time_utils.js";

/**
 * Edit/Create form for task
 *
 * # Events
 *   - confirm
 *   - cancel
 *   - delete
 */
export class TaskEdit extends WebComponent {
  super(task) {
    this.task = task || this.task;
    this.storage = storage || this.storage;
  }

  refresh() {
    if (!this.task) return;
    if (!this.task.id) {
      this.qs("#delete").classList.add("hidden");
    } else {
      this.qs("#delete").classList.remove("hidden");
    }
    this.qs("#name").value = this.task.name;
    this.qs("#tag").value = this.task.tags[0];

    let blockedBy = this.qs("#blocked-by");
    let nothingEl = document.createElement("option");
    nothingEl.textContent = "--Nothing--";
    blockedBy.append(nothingEl);

    this.task.allTasks().forEach(task => {
      let el = document.createElement("option");
      el.value = task.id;
      el.textContent = task.name;
      blockedBy.append(el);
    });

    let tagList = this.qs("#tags");
    this.task.allTags().forEach(tag => {
      let el = document.createElement("option");
      el.value = tag;
      el.textContent = tag;
      tagList.append(el);
    });

    /**let convertedPeriod = fromMillis(this.task.period);
    this.qs("#period").unit = convertedPeriod.unit;
    this.qs("#period").amount = convertedPeriod.amount;

    let convertedNext = fromMillis(this.task.due - Date.now());
    this.qs("#next").unit = convertedNext.unit;
    this.qs("#next").amount = convertedNext.amount;*/
  }

  connected() {
    this.addListener(this.qs("#delete"), "click", e => {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent("delete", {
          detail: { task: this.task },
          bubbles: true
        })
      );
    });

    this.addListener(this.qs("#cancel"), "click", e => {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent("cancel", {
          detail: { task: this.task },
          bubbles: true
        })
      );
    });

    this.addListener(this.qs("#confirm"), "click", e => {
      e.stopPropagation();
      // TODO(P1) store values
      this.dispatchEvent(
        new CustomEvent("confirm", {
          detail: { task: this.task },
          bubbles: true
        })
      );
    });
  }

  template() {
    // TODO(P1) Styling
    return /*html*/ `
  <style>
    :host {
      display: flex;
      flex-direction: column;
    }

    #icons {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin-top: 1em;

      cursor: pointer;
      -webkit-user-select: none;  /* Chrome all / Safari all */
      -moz-user-select: none;     /* Firefox all */
      -ms-user-select: none;      /* IE 10+ */
      user-select: none;          /* Likely future */
    }

    .line-item {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      border-bottom: 1px solid #ADD8E6;
    }

    .hidden{
      display: none;
    }
  </style>
  <div class="line-item">
    <div>Name:</div>
    <input id="name" type="text" placeholder="shopping"/>
  </div>
  <div class="line-item">
    <div>Tag:</div>
    <input id="tag" list="tags" type="text" placeholder="todo"/>
  </div>
  <datalist id="tags"></datalist>
  <div class="line-item">
    <div>After:</div>
    <select id="blocked-by">
  </select>
  </div>
  <span>Repeats</span>
  <wc-tabs page="Once">
    <div label="Once" class="line-item">
      <div>Due</div>
      <wc-time-input>
      </wc-time-input>
    </div>
    <div label="Multiple">
      <div class="line-item">
        <div>Times</div>
        <input id="tag" type="number"/>
      </div>
      <div class="line-item">
        <div>Every</div>
        <wc-time-input>
        </wc-time-input>
      </div>
    </div>
    <div label="Forever" class="line-item">
      <div>Every</div>
      <wc-time-input>
      </wc-time-input>
    </div>
  </wc-tabs>
  <div id="icons">
    <div id="delete">🗑</div>
    <div id="cancel">✕</div>
    <div id="confirm">✓</div>
  </div>
  `;
  }
}

customElements.define("wc-task-edit", TaskEdit);
