# Architecture Diagram

```mermaid
flowchart LR
  Param[PARAM Home] --> ToolMgmt[Tool Mgmt]
  ToolMgmt --> ToolList[Tool List default]

  ToolList --> ListTable[Tool identity + geometry]
  ToolList --> AddTool[Add Tool]
  AddTool --> DetailCreateTool[Detail create_tool draft]

  ToolList --> DetailView[Detail view]
  ToolList --> ToolWear[Tool Wear]
  ToolWear --> WearTable[Edge wear]
  ToolWear --> DetailView

  DetailView --> EditDraft[Detail edit draft]
  DetailView --> EdgeDraft[Detail create_edge draft]
  DetailView --> Remove[Remove selected entry]
  DetailCreateTool --> SaveCreateTool[Save create_offset_entry]
  EdgeDraft --> SaveEdge[Save add_edge_to_tool]
  EditDraft --> SaveEdit[Save update_offset_entry_identity]

  ToolList --> Magazine[Magazine read-only V1]
  ToolWear --> Magazine
  DetailView --> Magazine
  Magazine --> MagazineTable[tooling.magazine.table]
  MagazineTable --> PocketContext[selected_magazine_detail_summary]
  Magazine --> OpenAssignedTool[open selected magazine tool]
  OpenAssignedTool --> DetailView

  Runtime[Runtime contract] --> ToolTable[tooling.tool.table]
  Runtime --> MagazineTable
  Backend[Mock + tooling_management backend] --> Runtime
```

The operator-facing hierarchy is now consistent: list pages are for scanning,
Detail is for drafting and saving, and Magazine is a module-level read model
that can navigate back into Detail without adding another edit surface.
