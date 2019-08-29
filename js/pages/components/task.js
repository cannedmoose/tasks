import { WebComponent } from "./web_component.js";
import { TimeInput } from "./time_input.js";
import { Accordian } from "./accordian.js";
/**
 * A button that shows task information
 *
 * TODO(P3) Maybe re-use icon spaces for other things...
 * TODO(P1) Add actual edit functionality
 *
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
        // Edit icon should let event bubble
        this.querySelector("#name").classList.toggle("editable");
        return;
      }

      // TODO(P1)
      // Lets let the task do it, it'll know better
      // So it could fire events for
      // name change,
      //   -- Anything displaying a name should refresh it
      // repeat change,
      //   -- Task ordering should refresh
      // last done change
      //   -- Task ordering should refresh
      // Should storage subscribe to event as well?
      // Hmm we could probs still just store directly...
      // Or maybe have a commit? IDK
      // Or could just store every second or something... not gonna miss much
      // Yeah then it kinda works with eventual syncing
      e.stopPropagation();
      this.task.lastDone = Date.now();
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

    this.querySelector("#repeat").addEventListener("change", e => {
      console.log("test", e);
    });
    this.querySelector("#next").addEventListener("change", e => {
      console.log("test", e);
    });

    this.querySelector("#name").addEventListener("change", e => {
      console.log("test", e);
    });
    this.querySelectorAll("#name").forEach(el => {
      el.value = this.task.name;
    });
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
      <input id="name" type="text" class="name center-column"/>
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
