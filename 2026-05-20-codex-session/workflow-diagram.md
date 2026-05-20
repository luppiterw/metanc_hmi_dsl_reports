# Workflow Diagram

```mermaid
flowchart TD
  discussion["Discuss Tool Offset UX scope"]
  identity["Clarify row_key, tool_id, edge_id, T/D labels"]
  design["Write tool_offset_table_ui_design.md"]
  linkdocs["Link from PARAM navigation and project docs"]
  reports["Export daily user history and full Codex conversations"]
  build["Build reports book and HMI docs portal"]
  fixportal["Fix docs portal startup_modes publication gap"]
  sync["Export source HMI package to MetaNC feat/hmi"]
  publish["Commit and push reports, source HMI, and MetaNC sync"]

  discussion --> identity
  identity --> design
  design --> linkdocs
  linkdocs --> reports
  reports --> build
  build --> fixportal
  fixportal --> build
  build --> sync
  sync --> publish
```

This workflow records the delivery order used for the 2026-05-20 session:
settle the Tool Offset UI contract first, publish the report/docs artifacts,
repair the generated docs portal gap found by tests, and only then mirror the
source HMI package into MetaNC.
