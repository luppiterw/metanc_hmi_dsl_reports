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

    subgraph WebGenerator[Web Generator Source Split]
        ENTRY[generator.py entrypoint]
        CSS[styles.py stylesheet builder]
        LEGACY[legacy shell CSS fragments]
        CORE[widget_core JS fragments]
        FEAT[features: Program / Logs / DEBUG]
        WIDGET[widget_emitters.py assembly]
        RUNTIMEJS[runtime_fragments JS template]
    end

    UI --> MainJog
    UI --> SoftPanel
    STORY --> UI
    UI --> ENTRY
    ENTRY --> CSS
    CSS --> LEGACY
    ENTRY --> WIDGET
    CORE --> WIDGET
    FEAT --> WIDGET
    WIDGET --> GENWEB[byte-stable generated app.js]
    ENTRY --> RUNTIMEJS
    RUNTIMEJS --> GENRUNTIME[byte-stable generated runtime.js]
    SoftPanel --> COMMANDS
    COMMANDS --> STATE
    STATE --> WS
    WS --> MainJog
    WS --> SoftPanel
    MODE --> COMMANDS
    WS --> MODEVIEW[main_mode_view render signature]
    MODEVIEW --> MainJog
```
