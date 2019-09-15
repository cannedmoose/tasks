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
 *
 * TODO(P1) Cleanup template and CSS
 */
export class TaskEdit extends WebComponent {
  super(task) {
    this.task = task || this.task;
    this.storage = storage || this.storage;
  }

  refresh() {
    if (!this.task) return;
    this.values = {};
    if (!this.task.id) {
      this.qs("#delete").classList.add("hidden");
    } else {
      this.qs("#delete").classList.remove("hidden");
    }
    this.qs("#name").value = this.task.name;
    this.qs("#tag").value = this.task.tags[0];

    let blockedBy = this.qs("#blocked-by");
    this._clear(this.qs("#blocked-by"));
    let nothingEl = document.createElement("option");
    nothingEl.textContent = "--Nothing--";
    nothingEl.value = "";
    blockedBy.append(nothingEl);

    this.task.allTasks().forEach(task => {
      if (this.task.id === task.id) {
        return;
      }
      let el = document.createElement("option");
      el.value = task.id;
      el.textContent = task.name;
      el.selected = task.id == this.task.blockedBy[0];
      blockedBy.append(el);
    });

    let tagList = this.qs("#tags");
    this._clear(tagList);
    this.task.allTags().forEach(tag => {
      let el = document.createElement("option");
      el.value = tag;
      el.textContent = tag;
      tagList.append(el);
    });

    if (this.task.repeat == 1) {
      this.qs("#repeats").page = "Once";
    } else if (this.task.repeat == Infinity) {
      this.qs("#repeats").page = "Forever";
    } else {
      this.qs("#repeats").page = "Multiple";
    }

    this.qs("#repeat-input").value = this.task.repeat;

    let convertedPeriod = fromMillis(this.task.period);
    this.qs("#forever-period").unit = convertedPeriod.unit;
    this.qs("#forever-period").amount = convertedPeriod.amount;

    this.qs("#multiple-period").unit = convertedPeriod.unit;
    this.qs("#multiple-period").amount = convertedPeriod.amount;

    convertedPeriod = fromMillis(this.task.due - Date.now());
    this.qs("#once-due").unit = convertedPeriod.unit;
    this.qs("#once-due").amount = convertedPeriod.amount;
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

    this.addListener(this.qs("#name"), "change", e => {
      this.values.name = this.qs("#name").value;
    });

    this.addListener(this.qs("#tag"), "change", e => {
      this.values.tags = [this.qs("#tag").value];
    });

    this.addListener(this.qs("#blocked-by"), "change", e => {
      if (!this.qs("#blocked-by").value) {
        return;
      }
      this.values.blockedBy = [ParseInt(this.qs("#blocked-by").value)];
      this.values.blocked =
        (this.task.blocked || !this.task.id) &&
        this.values.blockedBy.length > 0;
    });

    this.addListener(this.qs("#repeat-input"), "change", e => {
      this.values.repeat = parseInt(this.qs("#repeat-input").value);
    });

    this.addListener(this.qs("#once-due"), "change", e => {
      let period = parseInt(this.qs("#once-due").millis);
      this.values.period = Math.abs(period);
      this.values.due = Date.now() + this.values.period;
    });

    this.addListener(this.qs("#multiple-period"), "change", e => {
      this.values.period = this.qs("#multiple-period").millis;
    });

    this.addListener(this.qs("#forever-period"), "change", e => {
      this.values.period = this.qs("#forever-period").millis;
    });

    this.addListener(this.qs("#confirm"), "click", e => {
      e.stopPropagation();

      let repeatPage = this.qs("#repeats").page;
      if (repeatPage == "Once") {
        this.values.repeat = 1;
      } else if (repeatPage == "Forever") {
        this.values.repeat = "Infinity";
      } else {
        this.values.repeat = parseInt(this.qs("#repeat-input").value);
      }

      Object.assign(this.task.values, this.values);
      // HMM WHERE TO GET STORE FROM
      this.task.storage.store();
      this.dispatchEvent(
        new CustomEvent("confirm", {
          detail: { task: this.task },
          bubbles: true
        })
      );
    });
  }

  template() {
    // TODO(P1) Styling fixes
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
    }

    .line-item {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      flex: 1;
    }

    .bordered {
      border-bottom: 1px solid #ADD8E6;
      margin-right: 1em;
      flex:1;
    }

    .bordered + *{
      flex:2;
    }

    .hidden{
      display: none;
    }

    input[type=text] {
      max-width: 8em;
    }
  </style>
  <div class="line-item">
    <div class="bordered">Name:</div>
    <input id="name" type="text" placeholder="shopping"/>
  </div>
  <div class="line-item">
    <div class="bordered">Tag:</div>
    <input id="tag" list="tags" type="text" placeholder="todo"/>
  </div>
  <datalist id="tags"></datalist>
  <div class="line-item">
    <div class="bordered">After:</div>
    <select id="blocked-by">
    </select>
  </div>
  <span class="bordered">Repeats</span>
  <wc-tabs id="repeats" page="Once">
    <div label="Once" class="line-item">
      <div class="bordered">Due:</div>
      <wc-time-input id="once-due">
      </wc-time-input>
    </div>
    <div label="Multiple">
      <div class="line-item">
        <div class="bordered">Times:</div>
        <input id="repeat-input" type="number"/>
      </div>
      <div class="line-item">
        <div class="bordered">Every:</div>
        <wc-time-input id="multiple-period">
        </wc-time-input>
      </div>
    </div>
    <div label="Forever" class="line-item">
      <div class="bordered">Every:</div>
      <wc-time-input id="forever-period">
      </wc-time-input>
    </div>
  </wc-tabs>
  <div id="icons" class="button">
    <div id="delete">🗑</div>
    <div id="cancel">✕</div>
    <div id="confirm">✓</div>
  </div>
  `;
  }
}

customElements.define("wc-task-edit", TaskEdit);
