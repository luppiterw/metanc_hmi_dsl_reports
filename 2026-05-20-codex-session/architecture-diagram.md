# Architecture Diagram

```mermaid
flowchart LR
  operator["Operator"]
  table["Tool Offset Table UI"]
  rowkey["Opaque row_key selection"]
  facade["HMI tooling facade commands"]
  projection["tooling.tool.table projection"]
  tooling["tooling_management core"]
  store["Persistence store"]

  operator -->|"T/D/edge labels, names, offsets"| table
  table --> rowkey
  rowkey -->|"resolve against current projection"| projection
  table -->|"Phase 1 set_offset dispatch"| facade
  facade --> tooling
  tooling --> projection
  tooling --> store

  subgraph phase1["Phase 1 Boundary"]
    rowkey
    projection
  end

  subgraph later["Phase 2/3 Boundary"]
    facade
    store
  end
```

The UI row identity is `row_key`, not a user-facing selector and not a
database row id. Internal `tool_id` and `edge_id` remain owned by the tooling
domain; the HMI resolves the selected `row_key` against the latest
`tooling.tool.table` projection before dispatching existing offset writes.

Phase 1 focuses on row identity, display shape, selection, and inline offset
edit dispatch. Add, remove, status, and identity-edit workflows are deferred to
later HMI facade commands.
