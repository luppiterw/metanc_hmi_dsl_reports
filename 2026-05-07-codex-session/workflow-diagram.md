# Workflow Diagram

```mermaid
flowchart TD
    user[User reports QML Logs failures]
    inspect[Inspect generated QML and generator sources]
    root1[Missing font_family_ui token]
    root2[Direct readLocalState bindings do not depend on runtime.revision]
    root3[Toolbar widths allow More to be squeezed]
    fix[Patch generator/runtime sources]
    regen[Run generate_targets.sh]
    snap[Refresh QML snapshots]
    test[Run pipeline tests and diff checks]
    docs[Update docs and daily report]
    sync[Sync exported HMI package to MetaNC]
    publish[Commit and push reports, source, and MetaNC]

    user --> inspect
    inspect --> root1
    inspect --> root2
    inspect --> root3
    root1 --> fix
    root2 --> fix
    root3 --> fix
    fix --> regen
    regen --> snap
    snap --> test
    test --> docs
    docs --> sync
    sync --> publish
```
