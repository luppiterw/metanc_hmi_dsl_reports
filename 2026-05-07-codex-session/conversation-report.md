# Conversation Report

## User Requests

- Pull remote updates and refresh all final docs/artifacts for inspection.
- Investigate QML Logs runtime warning:
  `Unable to assign [undefined] to QString`.
- Fix QML Logs controls, especially Filter and More behavior.
- Discuss PROG page responsibility boundaries, including current execution line versus editor
  cursor line, and remove misleading backend-looking cursor concepts.
- Hide duplicated `Block No.`/`Format` entries, keep internal placeholders, and bind edit softkeys
  to actual editor capabilities.
- Investigate Web Undo not lighting after document edits.
- Fix New File stem selection, direct clipboard Paste, and natural-line Goto behavior.
- Design and implement a usable Search/Replace panel instead of the old one-shot prompt.
- Fix Web Replace so the visible CodeMirror document and runtime resource stay in sync.
- Merge the separate Search and Replace softkeys into one `Search/Replace` entry.
- Prevent `Ctrl+F` from opening the native editor/browser search UI and route shortcuts to the
  generated Search/Replace panel.
- Investigate why saved Program content is lost after switching to another program and reopening it.
- Investigate why PROG DIR opening A shows the previous program, then opening B still shows A.
- Generate the daily report, update related docs, sync to MetaNC, then commit and push.

## Technical Decisions

- Fix QML issues in generator sources instead of patching generated QML directly.
- Treat Logs toolbar open/closed state as generated client-local state that must be read through
  revision-aware helpers when used in QML bindings.
- Keep Filter/More as inline panels for this slice, but give them explicit minimum heights so
  layout does not collapse when `implicitHeight` is not ready.
- Keep QML startup checks as warning detection only because the local offscreen renderer returns a
  `1x1` image in this environment.
- Treat `PROG EDIT` as a footer-tool mode over the same current-program editor, not a separate
  page with a separate editor object.
- Keep editor cursor state local to the client/editor layer; do not expose cursor movement as a
  backend property write.
- Preserve the Web CodeMirror instance across runtime re-renders when the content page remains
  `PROG`, so editor history and capability state survive runtime notifications.
- Treat Search/Replace/Goto/Paste as client-local editor behavior. They may update local state or
  `res://program.document.content`, but they must not be routed as backend command shims.
- Keep the first Search/Replace implementation as a generated client panel backed by
  `runtime_state.program_search_*`; Web can use CodeMirror decorations, while QML can initially
  select and scroll the current match.
- Use one visible `Search/Replace` softkey even if generated clients retain separate internal
  `find_in_program` and `replace_in_program` action names.
- Own `Ctrl/Cmd+F` in the generated shell so the custom panel opens consistently instead of the
  native CodeMirror search UI.
- Treat Save/Save As as active-editor-document operations. Generated clients pass the current
  editor text as command content, and server-side command handling falls back to
  `program.document.content` if a strict-mode client omits explicit content.
- Keep the Web editor DOM only while the active Program document identity is unchanged. Runtime
  execution updates preserve CodeMirror state, but PROG DIR file activation refreshes the visible
  editor document.

## Result

The QML Logs page now avoids the missing typography token, updates Filter and More panel bindings
after clicks, keeps toolbar controls from squeezing the overflow button, and refreshes logs after
clear/retention actions. PROG editing now keeps execution state separate from editor state, hides
unfinished duplicated tooling entries, and updates Undo/Redo/Cut/Copy/Paste from the live editor
state. PROG editor actions now cover direct clipboard paste, natural-line Goto, and an in-editor
Search/Replace panel. The Web implementation keeps CodeMirror and `res://program.document.content`
in sync during replacements, and the visible edit softkey surface now exposes a single
`Search/Replace` entry with `Ctrl/Cmd+F` / `Ctrl/Cmd+H` routed to the generated panel.
Program Save now persists the edited active document across server, Web/QML runtime shells, and
fixture mock runtime paths. PROG DIR file activation now updates the visible Web editor when moving
from one program document to another, while still preserving editor focus/history for same-document
runtime refreshes. Documentation and report outputs were refreshed for publication.
