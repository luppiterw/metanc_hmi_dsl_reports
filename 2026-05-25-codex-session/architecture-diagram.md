# Architecture Diagram

```mermaid
flowchart LR
  subgraph source[standalone metanc_hmi_dsl]
    srcDocs[docs]
    i18n[docs_i18n]
    reports[submodules/metanc_hmi_dsl_reports]
    sync[tools/repo_sync and tools/reports]
    package[HMI package code/tests]
  end

  subgraph export[export_to_metanc.sh]
    copy[filtered package copy]
    materialize[materialize_downstream_docs]
    strip[strip report and source-only docs content]
  end

  subgraph downstream[MetaNC/nrt/hmi]
    downstreamDocs[docs without report portal]
    downstreamEntrypoints[downstream README and AGENTS]
    downstreamPackage[client/server/fixture/contract/tests]
  end

  package --> copy --> downstreamPackage
  srcDocs --> materialize --> downstreamDocs
  materialize --> downstreamEntrypoints
  reports -. excluded .-> strip
  i18n -. excluded .-> strip
  sync -. excluded .-> strip
```
