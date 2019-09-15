# Upcoming

## D3 Port

My update cycle looks v similar, try removing "zip" from webcomponent.

## Sync

Sync online ( google drive based?)

# WebComponent Docs

A reusable webcomponent. Aim is to efficiently use dom nodes.
Nodes are matched to objects, there is a convenience function to sync the data to the dom.

## Convenience

upgrades - Implement this and return props that should be upgraded after component connected
sub - Sub text value of nodes returned by a selectors text content with a string
addListener/removeListener - adds a event lister on a given element, removed automatically on disconnect. AddListener returns key that should be passed to removeListener.
qs/qsAll - querySelector on components shadowroot
zip - Given an iterable of data and a query selector will sync data to nodes in Dom.
bubble - bubbles a custom event through the shadowdom

## Lifecycle

User lifecycle methods:

- refresh: called after render, can be called to tell an element to re-render when things change. Should call refresh on relevant children.
- connected: called after node connected to dom, rendered and refreshed
- disconnected: called after node disconnected to dom

Behind the scenes:
constructor -> render(template)
connectedCallback(non-user) -> \_upgradeProperties -> refresh -> connected
disconnectedCallback(non-user) -> disconnected -> removeListener()

---

# Flows

How do blocking tasks work?
On creation if a task has a blocking task it will be blocked.
Blocked tasks are never due.
On done if a task has a blocking task it will block itself.
On task update if a task has a blocking task it's blockes state does not change,
When a task is done it searches for tasks it blocks.
For each task it unblocks it and sets the due date to the current time plus the tasks period.
