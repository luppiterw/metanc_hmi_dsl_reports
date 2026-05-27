# Architecture Diagram

```mermaid
flowchart LR
  Param[PARAM Home] --> ToolMgmt[Tool Mgmt]
  ToolMgmt --> ToolList[Tool List default view]

  ToolList --> ListTable[Identity + geometry table]
  ListTable --> ListFooter[Tool List footer]
  ListFooter --> Wear[Tool Wear]
  ListFooter --> DetailView[Detail view]
  ListFooter --> AddTool[Add Tool dialog]
  ListFooter --> ListOps[Refresh / Enable / Disable / Remove]

  Wear --> WearTable[Edge wear table]
  WearTable --> WearFooter[Tool Wear footer]
  WearFooter --> ToolList
  WearFooter --> DetailView

  DetailView --> ViewFooter[view footer: Add Edge / Edit]
  ViewFooter --> EditDraft[Detail edit draft]
  ViewFooter --> EdgeDraft[Detail create_edge draft]
  EditDraft --> EditFooter[edit footer: Revert / Save]
  EdgeDraft --> EdgeFooter[create_edge footer: Revert / Save]
  EdgeFooter --> SavedEdge[Accepted Save selects new edge]
  SavedEdge --> Wear

  Future[Future module selector] -. later .-> Magazine[Magazine]
  Future -. later .-> Monitoring[Monitoring]
  Future -. later .-> Sister[Sister Tools]
  Future -. later .-> OEM[OEM Data]
```

The default Tool Management path is deliberately short: PARAM opens Tool
Management and the operator lands on Tool List. Detail write actions are
state-specific so read-only review does not look like a disabled editing mode.
