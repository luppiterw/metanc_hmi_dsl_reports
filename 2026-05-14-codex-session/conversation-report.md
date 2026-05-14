# Conversation Report

## Summary

The session continued the HMI internal functionality review after prior docs/report
maintenance. The user asked whether `Check` should call backend decode/check
interfaces instead of reimplementing an NC parser in HMI. The design decision was
to keep HMI ownership limited to orchestration and local gate checks, then route
decode/syntax/machine diagnostics through backend/controller adapter results.

The user then requested implementation, review, a minimal safety fix, and finally
report/docs refresh, MetaNC sync, commit, push, and continued review.

## Flow

1. Design `prog.commands.check` and `program.check.state`.
2. Implement check orchestration across:
   - native server
   - mock runtime server
   - generated Web runtime
   - generated QML runtime
3. Route Web/QML Check actions through commands rather than local NC preflight.
4. Update docs and data dictionary in English and zh-CN.
5. Add regression tests for:
   - successful check state
   - unsaved gate
   - backend diagnostic marker
   - warning diagnostic marker
   - stale passed check refresh
   - reused passed check still requiring idle
6. Review the change set and identify the idle-gate reuse risk.
7. Apply the minimal fix: reusable check states are valid for prepare only while
   runtime remains idle.
8. Regenerate outputs, rebuild docs, refresh this report package, sync MetaNC,
   commit, push, then continue review.

## Conversation Assets

- `user-history.md`: user-authored prompts for the day.
- `codex-conversations/index.html`: navigable full conversation index.
- `codex-conversations/all.html`: single-page full conversation view.
- `codex-conversations/all.md`: Markdown full conversation export.

## Boundary

HMI does not own NC parsing or controller semantic validation. The mock
`HMI_CHECK_ERROR` / `HMI_CHECK_WARNING` markers are fixture-only diagnostics used
to prove command/resource transport and prepare gating. Real decode diagnostics
remain a backend/controller adapter responsibility.
