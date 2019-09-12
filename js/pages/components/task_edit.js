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
      el.selected = task.id === this.task.blockedBy;
      blockedBy.append(el);
    });

    let tagList = this.qs("#tags");
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

    this.addListener(this.qs("#confirm"), "click", e => {
      e.stopPropagation();
      // TODO(P1)
      // Don't wanna overwrite values
      // Should store them on the object
      // On confirm assign them to object
      let name = this.qs("#name").value;

      let repeatPage = this.qs("#repeats").page;
      let repeat = this.task.repeat;
      let period = this.task.period;
      let due = this.task.due;
      if (repeatPage == "Once") {
        repeat = 1;
        due = Date.now() + period;
        period = Math.abs(this.qs("#once-due").millis);
      } else if (repeatPage == "Multiple") {
        repeat = parseInt(this.qs("#repeat-input").value);
        period = this.qs("#multiple-period").millis;
      } else if (repeatPage == "Forever") {
        repeat = "Infinity";
        period = this.qs("#forever-period").millis;
      }

      let blockedBy = this.qs("#blocked-by").value
        ? [this.qs("#blocked-by").value]
        : [];
      let blocked = blockedBy.length > 0;
      let done = 0;

      let tags = [this.qs("#tag").value];

      this.task.values = {
        name,
        repeat,
        done,
        due,
        period,
        blockedBy,
        blocked,
        tags
      };
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
  <wc-tabs id="repeats" page="Once">
    <div label="Once" class="line-item">
      <div>Due</div>
      <wc-time-input id="once-due">
      </wc-time-input>
    </div>
    <div label="Multiple">
      <div class="line-item">
        <div>Times</div>
        <input id="repeat-input" type="number"/>
      </div>
      <div class="line-item">
        <div>Every</div>
        <wc-time-input id="multiple-period">
        </wc-time-input>
      </div>
    </div>
    <div label="Forever" class="line-item">
      <div>Every</div>
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
