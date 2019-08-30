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

  get name() {
    return this.getAttribute("name");
  }

  set name(val) {
    this.setAttribute("name", val);
  }

  connectedCallback() {
    this._upgradeProperty("name");

    this.querySelector("#label").addEventListener("click", e => {
      if (e.target.id === "edit-icon") {
        // TODO(P2) find a better way to do this
        // HACKEY, trigger task list refgresh when closing an edited task
        if (this.querySelector("#name").classList.contains("editable")) {
          this.firetaskchange();
        }
        // Edit icon should let event bubble
        this.querySelector("#name").classList.toggle("editable");
        return;
      }

      if (this.querySelector("#name").classList.contains("editable")) {
        e.stopPropagation();
        return;
      }
      e.stopPropagation();
      this.task.lastDone = Date.now();
      this.firetaskchange();
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
      this.task.remove();
      this.firetaskchange();
    });
  }

  // TODO(P2) Think about what events should actually fire
  firetaskchange() {
    this.dispatchEvent(
      new CustomEvent("taskchange", {
        bubbles: true
      })
    );
  }

  refresh() {
    // TODO FILL IN;
  }
}

customElements.define("wc-task", Task);

const TEMPLATE = WebComponent.TEMPLATE(/*html*/ `
<template id="task-display">
  <style>
    #content {
      border-bottom: 2px solid #ADD8E6;
    }

    #next {
      padding-bottom: .5em;
    }

    input {
      border: none;
      font: 1em/1.5 "Comic Sans MS", cursive;
      color: rgb(37, 37, 37);
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
      flex: 15;
      padding-left: 1em;
    }

    .left-column {
      flex: 1;
      text-align: center;
      border-left: 1px dotted #ADD8E6;
    }
  </style>
  <wc-accordian id="accordian">
    <div id="label" class="line-item" slot="label">
      <span id="tick-icon" class="right-column"></span>
      <input id="name" type="text" class="center-column"/>
      <span id="edit-icon" class="left-column" >✍</span>
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
