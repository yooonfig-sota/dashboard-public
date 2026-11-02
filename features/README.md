# Visitor character persistence

`visitor-cat-v1.js` adds the browser-only React controls to the exported room.
The main room mounts `window.JellyVisitorCat.Controls` with the existing cat
catalogue, weighted draw function, and character state setter. This preserves
the existing rarity distribution. All HTML entry points load the helper before
the application scripts so navigation from another page works too.

Storage key: `jelly-room:visitor-cat:v1`.
Record: `{ version: 1, id: string, selectedAt: number }` (Unix milliseconds).
Selections do not expire automatically. Reset is enabled 24 hours after selection
and draws a character using the existing probabilities (the same cat may recur).
Storage/focus/visibility events synchronize tabs; reset rechecks the stored time.
Storage failure falls back to the current visit with a visible notice.

This checkout contains the static export, not the original Next.js source.
When regenerating the export, port this component into the room source or
preserve its mount, script/stylesheet links, and updated application chunk
references in both HTML and RSC text payloads. Do not edit an existing hashed
chunk in place: generate a new filename so cached clients load the new code.
