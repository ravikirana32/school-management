# P491 Test Report

| Check | Result |
|---|---:|
| Focused P491 dependency/workspace assertions | 39/39 PASS |
| P490 cumulative archive integrity | PASS (`unzip -t`) |
| P490 closure regression verifier | 41/41 PASS |
| P489 resilience regression verifier | 25/25 PASS |
| P488 services hub regression verifier | 18/18 PASS |
| P491 source syntax check | PASS (`node --check`) |
| SHA-256 of P490 archive | PASS; matches observed hash `369bd0bb1032485b915ab559a7ef7764396ef36397928b5aedbf929dd068c63` |
| pnpm install | NOT RUN |
| Expo build/typecheck | NOT RUN |
| Live API/database/Redis | NOT RUN |
| Device tests | NOT RUN |

Static verification is not runtime or device acceptance.
