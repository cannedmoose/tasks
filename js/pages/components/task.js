import { WebComponent } from "./web_component.js";
import { TimeInput } from "./time_input.js";
import { Accordian } from "./accordian.js";
/**
 * A button that shows task information
 *
 * TODO(P1) Cleanup event speghetti
 * TODO(P3) Maybe re-use icon spaces for other things...
 * TODO(P3) Add an "importance indicator visual" (want more underlines for more important task)
 */
export class Task extends WebComponent {
  constructor(task) {
    super(TEMPLATE);
    this.task = task;
  }

  get create() {
    return this.hasAttribute("create");
  }

  set create(val) {
    if (val) {
      this.setAttribute("create", "");
      this.querySelector("#accordian").classList.add("create");
    } else {
      this.removeAttribute("create");
      this.querySelector("#accordian").classList.remove("create");
    }
  }

  connectedCallback() {
    this._upgradeProperty("name");

    this.querySelector("#label").addEventListener("click", e => {
      if (e.target.id === "edit-icon") {
        // TODO(P2) find a better way to do this
        // HACKEY, trigger task list refgresh when closing an edited task
        if (this.querySelector("#name").classList.contains("editable")) {
          this.firetaskchange("confirm");
        }
        // Edit icon should let event bubble
        this.querySelector("#name").classList.toggle("editable");
        return;
      }

      e.stopPropagation();

      if (!this.querySelector("#name").classList.contains("editable")) {
        this.firetaskchange("done");
      }
    });

    // TODO(P2) this could be convenience function
    // EG for replacing text content given a selector
    // chooses query/query all depending on id or class
    this.querySelectorAll(".name").forEach(el => {
      el.textContent = this.task.name;
    });

    if (this.task.lastDone + this.task.repeat >= Date.now()) {
      this.querySelector("#tick-icon").textContent = "☑";
    } else {
      this.querySelector("#tick-icon").textContent = "☐";
    }

    this.querySelector("#name").value = this.task.name;
    this.querySelector("#repeat").millis = this.task.repeat;
    this.querySelector("#next").millis =
      this.task.lastDone + this.task.repeat - Date.now();

    this.querySelector("#repeat").addEventListener("change", e => {
      this.task.repeat = this.querySelector("#repeat").millis;
    });
    this.querySelector("#next").addEventListener("change", e => {
      this.task.lastDone = Date.now() - (this.task.repeat - e.detail.millis);
    });

    this.querySelector("#name").addEventListener("change", e => {
      this.task.name = this.querySelector("#name").value;
      this.querySelectorAll(".name").forEach(el => {
        el.textContent = this.task.name;
      });
    });

    this.querySelector("#trash-icon").addEventListener("click", e => {
      this.firetaskchange("remove");
    });
  }

  // TODO(P3) Think about what events should actually fire
  // FOR add task 3 events:
  // Done (task was click)
  // Confirm (edit button closed)
  // Delete (trash was clicked)
  firetaskchange(what) {
    this.dispatchEvent(
      new CustomEvent(what, {
        detail: { task: this.task },
        bubbles: true
      })
    );
  }
}

customElements.define("wc-task", Task);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id="task-display">
  <style>
    #content {
      border-bottom: 2px solid #ADD8E6;
      font-size:.5em;
    }

    #next {
      padding-bottom: .5em;
    }

    input {
      border: none;
      /*TODO P1 figure out why we need to re set this*/
      font: 1em/1.5 "Quicksand";
      color: rgb(37, 37, 37);
      min-width: 0;
    }

    #name {
      pointer-events: none;
    }

    .editable {
      border-bottom: 1px black dotted;
      pointer-events: auto !important;
    }

    /*TODO(P2) add an icon class with cursor biz*/
    #trash-icon {
      /*TODO(P3) adding the extra span is a little hackey*/
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      cursor: pointer;
    }

    .line-item {
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-content: stretch;
      border-bottom: 1px solid #ADD8E6;
    }

    .right-column {
      flex: 1;
      border-right: 1px solid #ADD8E6;
      text-align: center;
    }

    .center-column {
      flex: 5;
      padding-left: 1em;
    }

    .left-column {
      flex: 1;
      text-align: center;
      border-left: 1px dotted #ADD8E6;
    }

    .create > #label > #tick-icon, .create > #label > #name {
      visibility: hidden;
    }

    .create > #label > #edit-icon {
      border-left: none;
    }

    .create > #label > #name.editable {
      visibility: visible;
    }

    .create > #label {
      border-top: 2px dotted #ADD8E6;
      border-bottom: 2px dotted #ADD8E6;
      margin-top: 1.5em;
    }

  </style>
  <wc-accordian id="accordian">
    <div id="label" class="line-item" slot="label">
      <span id="tick-icon" class="right-column"></span>
      <input id="name" type="text" placeholder="Name" class="center-column"/>
      <span id="edit-icon" class="left-column">✍</span>
    </div>
    <div id="content" class="line-item" slot="content">
      <span class="right-column"></span>
      <div class="center-column">
        <span>I should <span class="name"></span> every:</span>
        <wc-time-input id="repeat"></wc-time-input>
        <span>I will next <span class="name"></span> in:</span>
        <wc-time-input id="next"></wc-time-input>
      </div>
      <span id="trash-icon" class="left-column"><span></span>🗑</span>
    </div>
  </wc-accordian>
</template>
`);
