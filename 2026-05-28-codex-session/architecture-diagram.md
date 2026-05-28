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

  ToolList --> Magazine[Magazine V2]
  ToolWear --> Magazine
  DetailView --> Magazine
  Magazine --> MagazineTable[tooling.magazine.table]
  MagazineTable --> PocketContext[selected_magazine_detail_summary]
  Magazine --> OpenAssignedTool[open selected magazine tool]
  OpenAssignedTool --> DetailView
  Magazine --> FindEmpty[Find Empty]
  Magazine --> CreateAtPocket[Add Tool at pocket]
  CreateAtPocket --> DetailCreatePocket[Detail create_tool_at_pocket draft]
  DetailCreatePocket --> SaveCreateAtPocket[Save create_tool_at_magazine_pocket]
  Magazine --> AssignTool[Assign selected tool]
  Magazine --> MoveSource[Move source selected]
  MoveSource --> MoveTarget[Confirm enabled empty target]
  MoveTarget --> MoveCommand[move_tool_magazine_pocket]
  Magazine --> Unload[clear_tool_magazine_location]

  Runtime[Runtime contract] --> ToolTable[tooling.tool.table]
  Runtime --> MagazineTable
  Backend[Mock + tooling_management backend] --> Runtime
```

The operator-facing hierarchy is now consistent: list pages are for scanning,
Detail is for drafting and saving, and Magazine is the module-level pocket
surface. Magazine can navigate back into Detail for assigned tools, create a
tool through Detail at an empty pocket, and run command-mediated pocket
assignment/move/unload flows without adding another edit surface.
