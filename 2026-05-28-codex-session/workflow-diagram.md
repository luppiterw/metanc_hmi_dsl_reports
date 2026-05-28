# Workflow Diagram

```mermaid
flowchart TD
  A[Review Add Tool / Add Edge consistency] --> B[Plan Detail create_tool flow]
  B --> C[Route Add Tool into Detail draft state]
  C --> D[Remove old Web/QML dialog helpers]
  D --> E[Design Magazine V2 pocket workflows]
  E --> F[Add magazine resource, local move state, and footer modes]
  F --> G[Implement mock and real backend magazine commands]
  G --> H[Fix QML conditional footer selection]
  H --> I[Refresh docs, data dictionary, story pack, snapshots]
  I --> J[Run source generation and tests]
  J --> K[Export filtered package to MetaNC feat/hmi]
  K --> L[Run downstream validation]
  L --> M[Rebuild report books and docs portals]
  M --> N[Commit and push reports, source repo, and MetaNC]
  N --> O[Check remote CI]
```
