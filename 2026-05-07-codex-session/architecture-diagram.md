# Architecture Diagram

```mermaid
flowchart LR
    dsl[Retained DSL package]
    qmlgen[client/qml_client generator]
    mainqml[generated/qml/Main.qml]
    store[generated/qml/RuntimeStore.qml]
    logs[Diagnostics Logs view]
    webgen[client/web_client generator]
    webapp[generated/web app]
    prog[PROG current-program editor]
    editor[CodeMirror editor instance]
    search[Search/Replace panel]
    shortcuts[Shortcut router]
    caps[Editor capability local state]
    local[Client local state]
    resource[res://program.document.content]
    server[Runtime server log APIs]
    snapshots[Web/QML snapshots and tests]
    reports[Reports submodule and docs_html]
    metanc[MetaNC nrt/hmi sync]

    dsl --> qmlgen
    dsl --> webgen
    qmlgen --> mainqml
    qmlgen --> store
    webgen --> webapp
    mainqml --> logs
    mainqml --> prog
    webapp --> prog
    webapp --> shortcuts
    prog --> editor
    prog --> search
    shortcuts --> search
    search --> editor
    search --> resource
    editor --> caps
    editor --> resource
    caps --> local
    search --> local
    store --> local
    logs --> local
    logs --> server
    webapp --> snapshots
    mainqml --> snapshots
    store --> snapshots
    snapshots --> reports
    reports --> metanc
```
