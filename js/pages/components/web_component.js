/*
 * Web component to subclass.
 *
 * Adds a shadow dom filled with a template on construction.
 *
 */

export class WebComponent extends HTMLElement {
  constructor() {
    super();
    this.listeners = [];
    this.attachShadow({ mode: "open" });
    this._render();
  }

  // Methods to override
  refresh() {}
  template() {
    return "<div></div>";
  }
  connected() {}
  disconnected() {}
  upgrades() {
    return [];
  }

  // Helper methods
  sub(selector, repl) {
    this.qsAll(selector).forEach(el => {
      el.textContent = repl;
    });
  }
  addListener(target, event, listener) {
    let fn = listener.bind(this);
    let key = { event, fn, target };
    target.addEventListener(event, fn);
    this.listeners.push(key);
    return key;
  }
  removeListener(key) {
    key.target.removeEventListener(key.event, key.fn);
    this.listeners = this.listeners.filter(k => k !== key);
  }
  qs(query) {
    return this.shadowRoot.querySelector(query);
  }
  qsAll(query) {
    return this.shadowRoot.querySelectorAll(query);
  }

  // Webcomponent lifecycle hooks
  connectedCallback() {
    this._upgradeProperties();

    requestAnimationFrame(() => {
      // TODO(P3) confirm that requesting frame will order this after rendering
      // (Seems to work for now...)
      this._refresh();
      this.connected();
    });
  }

  adoptedCallback() {
    console.log(this.id() + " adopted");
  }

  disconnectedCallback() {
    this.disconnected();
    this._clearListeners();
  }

  // Private methods
  _clearListeners() {
    this.listeners.forEach(key => {
      key.target.removeEventListener(key.event, key.fn);
    });
    this.listeners = [];
  }

  _clear() {
    while (this.shadowRoot.firstChild) {
      this.shadowRoot.removeChild(this.shadowRoot.firstChild);
    }
  }

  _render() {
    this._clear();
    this.shadowRoot.appendChild(this._template().content.cloneNode(true));
  }

  _refresh() {
    this.refresh();
  }

  _template() {
    let id = this.id() + "-template";
    let template = document.querySelector("#" + id);
    if (!template) {
      template = document.createElement("template");
      template.innerHTML = this.template();
      template.id = id;
      document.querySelector("head").append(template);
    }
    return template;
  }

  _upgradeProperties() {
    let upgrades = this.upgrades();
    upgrades
      .filter(prop => this.hasOwnProperty(prop))
      .forEach(prop => {
        let value = this[prop];
        delete this[prop];
        this[prop] = value;
      });
  }

  /**
   * returns: id of Component
   * Used in dom for Component level nodes.
   */
  id() {
    return this.constructor.name;
  }
}
