import { toMillis } from "./time_utils.js";

function init_config() {
  return `{
  "tasks": [
    {
      "id": 3,
      "name": "Do a task",
      "repeat": "1",
      "period": 2419200000,
      "due": 0,
      "tags": [
        "todo"
      ],
      "blocked": false,
      "blockedBy": [],
      "done": 0,
      "lastDone": 0
    },
    {
      "id": 4,
      "name": "Create a task",
      "repeat": "1",
      "period": 2419200000,
      "due": 0,
      "tags": [
        "todo"
      ],
      "blocked": false,
      "blockedBy": [],
      "done": 0,
      "lastDone": 0
    },
    {
      "id": 5,
      "name": "Edit a task",
      "repeat": "1",
      "period": 2419200000,
      "due": 0,
      "tags": [
        "todo"
      ],
      "blocked": false,
      "blockedBy": [],
      "done": 0,
      "lastDone": 0
    }
  ],
  "taskHistory": [],
  "version": "5"
}`;
}

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
    // TODO(P3) Merge store + import
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
      this.import(init_config());
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
          task.done += 1;
          delete entry["name"];
          return entry;
        })
        .filter(e => e);

      localStorage.setItem("tasks", JSON.stringify(tasks));
      localStorage.setItem("taskHistory", JSON.stringify(taskHistory));
      localStorage.setItem("version", 3);
    }

    if (this.storage.version == 3) {
      tasks.forEach(task => {
        task.blockedBy = task.blockedBy.map(b => parseInt(b));
      });

      localStorage.setItem("tasks", JSON.stringify(tasks));
      localStorage.setItem("version", 4);
    }

    if (this.storage.version == 4) {
      taskHistory.reverse();
      tasks.forEach(task => {
        let l = taskHistory.find(h => h.id == task.id);
        if (l) {
          task.lastDone = l.time;
        } else {
          task.lastDone = 0;
        }
      });
      taskHistory.reverse();

      localStorage.setItem("tasks", JSON.stringify(tasks));
      localStorage.setItem("version", 5);
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
  // TODO(P3) Clean up and document schema.
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
    this.lastDone = when;
    this.storage.history.push({
      type: "done",
      id: this.id,
      time: when
    });
    if (this.values.blockedBy.length > 0) {
      this.values.blocked = true;
    }
    this.storage.tasks
      .filter(t => t.blockedBy.includes(this.id) && t.blocked)
      .forEach(t => {
        // Unblock an set due in the future.
        t.values.blocked = false;
        t.values.due = t.period + when;
      });
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
   * When the task was lastDone.
   */
  set lastDone(val) {
    if (val === this.lastDone) return;
    this.values.lastDone = val;
    this.storage.store();
  }

  get lastDone() {
    return this.values.lastDone;
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
      blocked: false,
      lastDone: 0
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
