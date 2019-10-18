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
    if (this.task.blockedBy.length > 0) {
      this.qs("#blocked-by").value = this.task.blockedBy[0];
    } else {
      this.qs("#blocked-by").value = "";
    }

    let taskList = this.qs("#tasks");
    this._clear(taskList);
    this.task.allTasks().forEach(task => {
      let el = document.createElement("option");
      el.value = task.id;
      el.textContent = task.name;
      taskList.append(el);
    });

    let tagList = this.qs("#tags");
    this._clear(tagList);
    this.task.allTags().forEach(tag => {
      let el = document.createElement("option");
      el.value = tag;
      el.textContent = tag;
      tagList.append(el);
    });

    if (this.task.repeat == Infinity) {
      this.qs("#repeats").page = "Forever";
    } else {
      this.qs("#repeats").page = "Multiple";
    }

    if (this.task.repeat != Infinity) {
      this.qs("#repeat-input").value = this.task.repeat;
    } else {
      this.qs("#repeat-input").value = 10;
    }
    //this.qs("#repeat-count").value = this.task.done;

    let convertedPeriod = fromMillis(this.task.period);
    this.qs("#forever-period").unit = convertedPeriod.unit;
    this.qs("#forever-period").amount = convertedPeriod.amount;

    this.qs("#multiple-period").unit = convertedPeriod.unit;
    this.qs("#multiple-period").amount = convertedPeriod.amount;
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
      this.values.blockedBy = [parseInt(this.qs("#blocked-by").value)];
      this.values.blocked =
        (this.task.blocked || !this.task.id) &&
        this.values.blockedBy.length > 0;
    });

    this.addListener(this.qs("#repeat-input"), "change", e => {
      this.values.repeat = parseInt(this.qs("#repeat-input").value);
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
      if (repeatPage == "Forever") {
        this.values.repeat = "Infinity";
      } else {
        this.values.repeat = parseInt(this.qs("#repeat-input").value);
      }

      Object.assign(this.task.values, this.values);
      // TODO(P2) HMM WHERE TO GET STORE FROM
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
    // TODO(P2) Styling fixes
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
			align-items: center;
    }

    .bordered {
      /*border-bottom: 1px solid #ADD8E6;*/
			margin-right: 1em;
			font-size: .5em;
      flex:1;
    }

    .bordered + *{
      flex:2;
    }

    .hidden{
      display: none;
    }

    input {
			max-width: 10em;
			font-size: .75em;
		}

		#forever-period {
			max-width: 10em;
			min-width: 10em;
			font-size: .75em;
		}

		#repeats {
			margin-top: .5em;
		}
  </style>
  <div class="line-item">
    <div class="bordered">Name:</div>
    <input id="name" type="text" placeholder="Exercise"/>
  </div>
  <div class="line-item">
    <div class="bordered">Tag:</div>
    <input id="tag" list="tags" type="text" placeholder="todo"/>
  </div>
  <datalist id="tags"></datalist>
  <div class="line-item">
    <div class="bordered">After:</div>
    <input id="blocked-by" list="tasks" type="text" placeholder="nothing"/>
	</div>
	<datalist id="tasks"></datalist>
	<!---
	TODO(P2) add these back in 
	<div class="line-item">
    <div class="bordered">Blocked:</div>
    <input type="checkbox" id="blocked" />
	</div>
	<div class="line-item">
    <div class="bordered">Done:</div>
    <input type="number" id="repeat-count" />
	</div>
	--->
  <wc-tabs id="repeats" page="Forever">
		<div label="Multiple">
			<div class="line-item">
        <div class="bordered">Every:</div>
        <wc-time-input id="multiple-period">
        </wc-time-input>
      </div>
      <div class="line-item">
        <div class="bordered">Times:</div>
        <input id="repeat-input" type="number"/>
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
