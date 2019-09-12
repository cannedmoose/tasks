import { WebComponent } from "./web_component.js";

/**
 * A series of tabs, only one is visible
 *
 * #Attributes
 *   - page
 * #Events
 *   - select
 * #Slots
 *   - NONE
 *   - Each child treated as a page
 *   - Children should
 *
 * TODO
 * HMMMHMHM
 * OKAY SO just base it off childrens
 * Change a childs slot based on the page..
 */
export class Tabs extends WebComponent {
  constructor() {
    super();
  }

  upgrades() {
    return ["page"];
  }

  refresh() {
    this._clear(this.qs("#label"));
    for (let i = 0; i < this.children.length; i++) {
      let child = this.children[i];
      if (!child.hasAttribute("label")) {
        continue;
      }
      let labelDiv = document.createElement("div");
      this.qs("#label").append(labelDiv);
      this.addListener(labelDiv, "click", e => {
        this.page = labelDiv.textContent;
        this.refresh();
      });
      labelDiv.textContent = child.getAttribute("label");
      if (child.getAttribute("label") === this.page) {
        labelDiv.classList.add("open");
        child.setAttribute("slot", "content");
      } else {
        child.setAttribute("slot", "");
      }
    }
  }

  connected() {
    // TODO(P1)
    // Add onclick for label
  }

  get page() {
    return this.getAttribute("page");
  }

  set page(val) {
    this.setAttribute("page", val);
    this.refresh();
    // Should toggle classlists...
  }

  template() {
    return /*html*/ `
<style>

  #label {
    display: flex;
    flex-direction:center;
  }

  #label > div {
    border: 1px solid black;
  }

  .open {
    background-color: lightBlue; 
  }
</style>
<div id="label" class="button"></div>
<slot id="content" name="content"></div>`;
  }
}

customElements.define("wc-tabs", Tabs);
