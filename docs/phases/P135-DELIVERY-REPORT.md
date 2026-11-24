# P135 Delivery Report

P135 adds a read-only dependency planner for historical operationalization. The API loads posted historical batches and cross-batch allocations, expands prerequisites for selected batches, and calculates a deterministic topological order so target batches appear before dependent source batches. Cycles are explicitly returned as blocked batch IDs. The response includes dependency edges, allocation references, row/link counts, and whether each prerequisite has already been operationalized.

The School Admin Finance workspace now exposes this plan and displays the order, dependencies, linked-row counts, readiness, and cycle blockers. Existing per-batch operationalization remains unchanged. The planner does not execute batches, post journals, or mutate accounting data.

Split/partial allocations remain a deliberate outstanding limitation. P133 can store multiple partial allocation rows, but P131's one-to-one operational link schema and P134's single-full-allocation materializer cannot yet represent multiple operational payments/refunds for one historical source row. P135 therefore does not claim split allocation completion.

No mobile accounting workflow was added: these are privileged finance operations currently surfaced in School Admin, not parent/teacher mobile experiences. No migration was added. Runtime PostgreSQL and UI build acceptance remain outstanding. Unit/API/browser/mobile test creation and execution remain deferred.
