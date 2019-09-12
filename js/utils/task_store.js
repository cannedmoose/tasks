import { toMillis } from "./time_utils.js";

export class TaskStore {
  constructor(storage) {
    this.storage = storage;
    this.tasks = [];
    this.history = [];
    this.version = 0;
    this.lastId = 0;
  }

  load() {
    this.handleUpgrade();
    this.tasks = JSON.parse(this.storage.tasks || "[]").map(
      taskJSON => new Task(this, taskJSON)
    );
    this.lastId = Math.max(...this.tasks.map(task => task.id));
    if (!this.lastId || this.lastId < 1) {
      this.lastId = 1;
    }
    this.history = JSON.parse(this.storage.taskHistory || "[]");
    this.version = this.storage.version;
  }

  store() {
    localStorage.setItem(
      "tasks",
      JSON.stringify(this.tasks.map(tasks => tasks.values))
    );
    localStorage.setItem("taskHistory", JSON.stringify(this.history));
    localStorage.setItem("version", this.version);
  }

  import(str) {
    // TODO(P2) Merge store + import
    let vals = JSON.parse(str);
    localStorage.setItem("tasks", JSON.stringify(vals.tasks));
    localStorage.setItem("taskHistory", JSON.stringify(vals.taskHistory));
    localStorage.setItem("version", vals.version);
    this.load();
  }

  add(vals) {
    let id = this.nextId();
    vals.id = id;
    let task = new Task(this, vals);
    this.tasks.push(task);
    this.store();
    return task;
  }

  nextId() {
    this.lastId += 1;
    return this.lastId;
  }

  remove(task) {
    this.tasks = this.tasks.filter(t => t.id !== task.id);
    this.store();
  }

  handleUpgrade() {
    let tasks = JSON.parse(this.storage.tasks || "[]");
    let taskHistory = JSON.parse(this.storage.taskHistory || "[]");

    // Prehistory versions
    if (!this.storage.version || this.storage.version < 2) {
      localStorage.setItem("tasks", "[]");
      localStorage.setItem("taskHistory", "[]");
      localStorage.setItem("version", 3);
    }

    // Change to schema
    if (this.storage.version == 2) {
      // Upgrade schema
      tasks.forEach(task => {
        task.period = task.repeat;
        task.due = task.lastDone + task.repeat;
        task.tags = ["todo"];
        task.repeat = "Infinity";
        task.blocked = false;
        task.blockedBy = [];
        task.done = 0;
        delete task["lastDone"];
      });

      taskHistory = taskHistory
        .map(entry => {
          let task = tasks.find(t => t.name === entry.name);
          if (!task) return undefined;
          entry.id = task.id;
          entry.type = "done";
          delete entry["name"];
          return entry;
        })
        .filter(e => e);

      localStorage.setItem("tasks", JSON.stringify(tasks));
      localStorage.setItem("taskHistory", JSON.stringify(taskHistory));
      localStorage.setItem("version", 3);
    }
  }
  allTags() {
    if (this.tasks.length == 0) {
      return ["Todo"];
    }
    return this.tasks
      .map(task => task.tags[0])
      .filter((value, index, self) => self.indexOf(value) === index);
  }
}

class Task {
  constructor(storage, values) {
    this.storage = storage;
    this.values = values;
  }

  do(when) {
    if (!when) {
      when = Date.now();
    }
    this.values.done += 1;
    this.values.due = when + this.period;
    this.storage.history.push({
      type: "done",
      id: this.id,
      time: when
    });
    if (this.values.blockedBy.length > 0) {
      this.values.blocked = true;
    }
    this.storage.tasks
      .filter(t => t.blockedBy[0] == this.id && t.blocked)
      .forEach(t => (t.values.blocked = false));
    this.storage.store();
  }

  pause(period) {
    this.values.due += period;
    this.storage.store();
  }

  isDue(now) {
    return (
      !this.values.blocked &&
      this.values.due < now &&
      this.values.done < this.values.repeat
    );
  }

  /**
   * Unique Identifier of task.
   */
  get id() {
    return this.values.id;
  }

  set id(val) {
    if (val === this.name) return;
    this.values.id = val;
    this.storage.store();
  }

  /**
   * Display name of task.
   */
  set name(val) {
    if (val === this.name) return;
    this.values.name = val;
    this.storage.store();
  }

  get name() {
    return this.values.name;
  }

  /**
   * How many times overall to repeat task.
   */
  set repeat(val) {
    if (val === this.repeat) return;
    this.values.repeat = val;
    this.storage.store();
  }

  get repeat() {
    return this.values.repeat;
  }

  /**
   * How many times the task has been done
   */
  set done(val) {
    if (val === this.done) return;
    this.values.done = val;
    this.storage.store();
  }

  get done() {
    return this.values.done;
  }

  /**
   * When the task is next due.
   */
  set due(val) {
    if (val === this.due) return;
    this.values.due = val;
    this.storage.store();
  }

  get due() {
    return this.values.due;
  }

  /**
   * How often task should be done.
   */
  set period(val) {
    if (val === this.period) return;
    this.values.period = val;
    this.storage.store();
  }

  get period() {
    return this.values.period;
  }

  /**
   * Tags (text) task appears in
   */
  set tags(val) {
    if (val == this.tags) return;
    this.values.tags = val;
    this.storage.store();
  }

  get tags() {
    return this.values.tags;
  }

  set blockedBy(val) {
    if (val == this.blockedBy) return;
    this.values.blockedBy = val;
    this.storage.store();
  }

  get blockedBy() {
    return this.values.blockedBy;
  }

  set blocked(val) {
    if (val == this.blocked) return;
    this.values.blocked = val;
    this.storage.store();
  }

  get blocked() {
    return this.values.blocked;
  }

  remove() {
    this.storage.remove(this);
  }

  allTasks() {
    return this.storage.tasks;
  }

  allTags() {
    return this.storage.allTags();
  }
}

export class TaskBuilder extends Task {
  constructor(realstore, vals) {
    let defaults = {
      name: "",
      repeat: "Infinity",
      due: Date.now(),
      done: 0,
      period: toMillis("days", 1),
      tags: ["todo"],
      blockedBy: [],
      blocked: false
    };
    Object.assign(defaults, vals);
    super({ store: () => {}, allTags: () => realstore.allTags() }, defaults);
    this.realStore = realstore;
    this.vals = {};
    Object.assign(this.vals, vals);
  }

  create() {
    return this.realStore.add(this.values);
  }

  clear() {
    let defaults = {
      name: "",
      repeat: "Infinity",
      due: Date.now(),
      period: toMillis("days", 1),
      tags: ["todo"],
      nextTasks: []
    };
    defaults.assign(this.vals);
    this.values = defaults;
  }

  allTasks() {
    return this.realStore.tasks;
  }
}
