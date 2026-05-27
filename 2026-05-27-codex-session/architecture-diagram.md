# Architecture Diagram

```mermaid
flowchart LR
  Param[PARAM Home] --> ToolMgmt[Tool Mgmt]
  ToolMgmt --> ToolList[Tool List default view]

  ToolList --> ListFooter[Tool List footer]
  ListFooter --> Wear[Tool Wear]
  ListFooter --> Detail[Detail]
  ListFooter --> ListOps[Add Tool / Add Edge / Refresh / Enable / Disable / Remove]

  Wear --> WearFooter[Tool Wear footer]
  WearFooter --> ToolList
  WearFooter --> Detail
  WearFooter --> WearOps[Refresh / Enable / Disable]

  Detail --> DetailFooter[Detail footer]
  DetailFooter --> ToolList
  DetailFooter --> Wear
  DetailFooter --> DetailOps[Add Edge / Revert / Save]

  Future[Future module selector] -. later .-> Magazine[Magazine]
  Future -. later .-> Monitoring[Monitoring]
  Future -. later .-> Sister[Sister Tools]
  Future -. later .-> OEM[OEM Data]
```

The default Tool Management path is deliberately short: PARAM opens Tool
Management and the operator lands on Tool List. Future modules should be added
through a dedicated selector so the Tool List footer remains focused on daily
row operations.
