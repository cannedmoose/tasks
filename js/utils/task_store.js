export class TaskStore {
  constructor(storage) {
    this.storage = storage;
    this.tasks = [];
    this.history = [];
    this.version = 1;
    this.lastId = 0;
  }

  load() {
    // TODO(P2) fallback if undefined
    if (this.storage.tasks) {
      this.tasks = JSON.parse(this.storage.tasks).map(taskJSON => {
        // TODO(P3) HACKEYYY
        return new Task(
          this,
          taskJSON.id,
          taskJSON.name,
          taskJSON.repeat,
          taskJSON.lastDone
        );
      });
      this.lastId = Math.max(...this.tasks.map(task => task.id));
    }
    if (this.storage.taskHistory) {
      this.history = JSON.parse(this.storage.taskHistory);
    }

    this.handleUpgrade();
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

  add(name, repeat, lastDone) {
    let id = this.nextId();
    let task = new Task(this, id, name, repeat, lastDone);
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
    if (!this.storage.version) {
      // Convert repeat time to millis
      tasks.forEach(task => (task.repeat = daysToMillis(task.repeat)));
      store();
    }
  }
}

class Task {
  constructor(storage, id, name, repeat, lastDone) {
    this.storage = storage;
    this.values = { id, name, repeat, lastDone };
  }

  get id() {
    return this.values.id;
  }

  set name(val) {
    this.values.name = val;
    this.storage.store();
  }

  get name() {
    return this.values.name;
  }

  set repeat(val) {
    this.values.repeat = val;
    this.storage.store();
  }

  get repeat() {
    return this.values.repeat;
  }

  set lastDone(val) {
    this.values.lastDone = val;
    this.storage.store();
  }

  get lastDone() {
    return this.values.lastDone;
  }

  remove() {
    this.storage.delete(this);
  }
}

export class TaskBuilder extends Task {
  constructor(realstore, name, repeat, lastDone) {
    super({ store: () => {} }, "", name, repeat, lastDone);
    this.realStore = realstore;
  }

  create() {
    return this.realStore.addTask(this.name, this.repeat, this.lastDone);
  }
}
