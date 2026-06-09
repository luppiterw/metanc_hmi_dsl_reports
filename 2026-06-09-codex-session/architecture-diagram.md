# Architecture Diagram

```mermaid
flowchart LR
  MetaNC[MetaNC feat/hmi] --> DownstreamHMI[MetaNC/nrt/hmi]
  DownstreamHMI --> Import[import_from_metanc.sh]
  Import --> SourceHMI[metanc_hmi_dsl/nrt/hmi]

  SourceHMI --> SharedPackage[Shared HMI package sources]
  SharedPackage --> RuntimeSeed[contract/runtime_seed.py]
  SharedPackage --> MockFixture[fixture/mock_runtime_server.py]
  SharedPackage --> Tests[tests and snapshots]

  SourceHMI --> SourceOnly[Source-only publication surfaces]
  SourceOnly --> ReportsSubmodule[submodules/metanc_hmi_dsl_reports]
  SourceOnly --> ReportTools[tools/reports and repo_sync]
  SourceOnly --> ReportPages[docs report timeline pages]

  SourceHMI --> Export[export_to_metanc.sh]
  Export --> DownstreamFiltered[Filtered downstream integration copy]
  DownstreamFiltered --> DownstreamHMI

  ReportsSubmodule --> ReportBooks[Aggregate and dated mdBook builds]
  SourceHMI --> DocsPortal[docs_html portal]
```

The important boundary is directional. Shared HMI code, fixtures, contracts,
tests, and generated snapshots can move between `MetaNC/nrt/hmi` and the
standalone package. Report history, report-generation tooling, and source-local
timeline pages remain in `metanc_hmi_dsl` and are filtered out of the MetaNC
integration copy.
