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
