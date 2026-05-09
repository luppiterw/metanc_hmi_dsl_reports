# Architecture Diagram

```mermaid
flowchart LR
    subgraph RetainedDSL[Retained DSL]
        UI[definition/ui.structure.yaml]
        STORY[definition/story.catalog.yaml]
    end

    subgraph MainJog[MAIN / JOG Display Area]
        FT[Feed Target]
        ST[Spindle Target]
        TOOL[Tool State]
        AUX[Aux State]
        LIVE[Live Manual Status]
    end

    subgraph SoftPanel[Generated Soft Panel]
        AXIS[Axis Selection]
        JOG[JOG +/- / Rapid / Increment]
        MODE[JOG / MDI / AUTO]
        FS[Feed and Spindle Start Stop]
        COOL[Coolant Toggle]
        CYCLE[Reset / Start / Stop / SBLK]
    end

    subgraph Runtime[Runtime Server Simulator]
        COMMANDS[/api/runtime/commands]
        STATE[revisioned state + properties]
        WS[/api/runtime/ws]
    end

    UI --> MainJog
    UI --> SoftPanel
    STORY --> UI
    SoftPanel --> COMMANDS
    COMMANDS --> STATE
    STATE --> WS
    WS --> MainJog
    WS --> SoftPanel
    MODE --> COMMANDS
    WS --> MODEVIEW[main_mode_view render signature]
    MODEVIEW --> MainJog
```
