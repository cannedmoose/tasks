# Upcoming

## Redesign

Tag based task management, more expressive tasks

## Sync

Sync online

# WebComponent Docs

A reusable webcomponent. Aim is to efficiently use dom nodes.
Data should flow down tree as props and up tree as events.
Model can change down tree but this should not trigger a refresh, only events should.

## Convenience

upgrade - upgrades returned props after component connected
sub - sub nodes returned by a selectors text content with a string
addListener/removeListener - adds a event lister on a given element, removed automatically on disconnect
qs/qsAll - querySelector on components shadowroot

## Lifecycle

User lifecycle methods:

- refresh: called after render, can be called to tell an element to re-render when things change. Should call refresh on relevant children.
- connected: called after node connected to dom, rendered and refreshed
- disconnected: called after node disconnected to dom

Prefer to re-use nodes (TODO(P3) why?).

Behind the scenes:
constructor -> render(template)
connectedCallback(non-user) -> \_upgradeProperties -> refresh -> connected
disconnectedCallback(non-user) -> disconnected -> removeListener()

TODO(P1) figure out where these are fired in constructed vs templated components
EG what does lifecycle look like from view of the parent.

---

Creating task flow:
Add from tag (tag filled)
Add not from tag (tag not filled)

First field is name
Then tag
Then repetitions (Once or repeated) This affects the other fields on display

- One off (fills repetitions)
  Has a single "due in" (fills period and due fields)
- Repeated
  Has a number of repetitions (fills repetitions)
  Has a period (fills period)

---

How do blocking tasks work?
If a task unblocks another
When it's done the other becomes available to do
This should be with some kind of leadup maybe?
Eg the task becomes due at it's period + the time when it becomes unblocked

So we should have a blocked field to specify a task is blocked by another

How is the blocked field set on task creation/edit?

When a task has a blocking task it becomes blocked after its done
When the blocking task is done it becomes unblocked
When a task has a blocking task it is unblocked on creation
When a task has a blocking task set on edit it's blocking state is unchanged

---

MENU
When clicked should show available filters:

- name filter
- upcoming cutoff (how far into the future to look for due tasks)
- unblocked/all

---