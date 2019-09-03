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

  // Abstract, should be implemented
  refresh() {}

  // Abstract, should be implemented
  template() {
    return "<div></div>";
  }

  // Abstract, should be implemented
  connected() {}

  // Abstract, should be implemented
  disconnected() {}

  upgrades() {
    return [];
  }

  addListener(target, event, listener) {
    let fn = listener.bind(this);
    let key = { event, fn, target };
    target.addEventListener(event, fn);
    this.listeners.push(key);
    return key;
  }

  // Not key relies on object equality...
  removeListener(key) {
    key.target.removeEventListener(key.event, key.fn);
    this.listeners = this.listeners.filter(k => k !== key);
  }

  _clearListeners() {
    this.listeners.forEach(key => {
      key.target.removeEventListener(key.event, key.fn);
    });
    this.listeners = [];
  }

  connectedCallback() {
    // Wait for dom update, hopefully children have been rendered then
    // TODO(P3) make sure this doesn't break down
    this._upgradePropertys();
    this._refresh();

    requestAnimationFrame(() => {
      /** At this point children should be rendered (their constructors have run + and doms rendered) but this is not necissarily called in order! */
      // THEREFORE DO MINIMUM IN CONNECTED
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

  // Private (python style)
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

  sub(selector, repl) {
    this.querySelectorAll(selector).forEach(el => {
      el.textContent = repl;
    });
  }

  /**
   * returns: id of Component
   * Used in dom for Component level nodes.
   */
  id() {
    return this.constructor.name;
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

  _upgradePropertys() {
    let upgrades = this.upgrades();
    upgrades
      .filter(prop => this.hasOwnProperty(prop))
      .forEach(prop => {
        let value = this[prop];
        delete this[prop];
        this[prop] = value;
      });
  }

  querySelector(query) {
    return this.shadowRoot.querySelector(query);
  }

  qs(query) {
    return this.shadowRoot.querySelector(query);
  }

  querySelectorAll(query) {
    return this.shadowRoot.querySelectorAll(query);
  }
}
