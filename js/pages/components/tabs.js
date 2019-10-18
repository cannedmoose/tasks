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
 * TODO(P2) This is kinda a mess need to clean up
 *   - Want on change event
 *   - Want label to be configurable (maybe let it be passed?)
 *    - So we can have Repeat: Label on same line
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

  connected() {}

  get page() {
    return this.getAttribute("page");
  }

  set page(val) {
    this.setAttribute("page", val);
    this.requestRefresh();
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
    border: 1px solid #ADD8E6;
    font-size: .75em;
    padding: .25em .5em;
    border-radius: 20% 20% 0% 0%;
  }

  #content {
    border: 1px dotted #ADD8E6;
  }

  .open {
    background-color: lightBlue; 
  }

  input[type=text] {
    max-width: 10em;
  }
</style>
<div id="label" class="button"></div>
<div class="content">
  <slot id="content" name="content"></div>
</div>`;
  }
}

customElements.define("wc-tabs", Tabs);
