# Conversation Report

## User Requests

- Discuss whether the JOG-mode content on the MAIN page is too mixed and too close to
  soft-panel behavior.
- Clarify that soft-panel controls should not be repeated inside the JOG-mode home page.
- Implement a first version directly, without committing yet.
- Generate and update reports/docs, sync to MetaNC, commit, and push.

## Technical Decisions

- Treat the soft panel as the actual operation surface for manual actions.
- Treat MAIN/JOG as a contextual display surface for manual setup and read-only status.
- Keep feed and spindle target controls in MAIN/JOG for now because they are setup values,
  not direct jog motion or cycle actions.
- Keep live feed/spindle/coolant/tool state visible so the operator can inspect manual
  context without leaving the main dashboard.
- Do not duplicate soft-panel command nodes in the MAIN/JOG tree; this keeps future
  adapter and test ownership focused on one command surface.

## Result

The generated Web and QML targets now present a simpler JOG home area. The JOG main area
shows manual setup and live status, while all real machine-operation controls remain in
the soft panel. Story/catalog and report documentation were updated so later manual
operation work does not accidentally reintroduce duplicated command controls into the
display area.
