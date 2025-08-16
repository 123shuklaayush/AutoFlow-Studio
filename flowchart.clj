+-------------------+          +----------------------+         +---------------------+
|       User        |          |   Chrome Extension   |         |      Local Store    |
| (clicks, records) |          | (UI + Recorder)      |         |  (IndexedDB/FS)     |
+---------+---------+          +----------+-----------+         +----------+----------+
          |                               |                                |
          | Start Recording               |                                |
          |------------------------------>|  Capture: clicks, inputs,      |
          |                               |  scrolls, DOM, net (HAR),      |
          |                               |  thumbnails                    |
          |                               +--------------+-----------------+
          |                                              |
          |                                              v
          |                                   Save trace chunks + thumbs
          |                                              |
          | Stop Recording                               |
          |------------------------------>+--------------+-----------------+
                                          |  Show summary (steps, creds,   |
                                          |  variables, risks)             |
                                          +--------------+-----------------+
                                                         |
                                                         v
                                      +------------------+------------------+
                                      |   Config Web UI (optional sync)     |
                                      |  - Name workflow, map variables     |
                                      |  - Set schedule/trigger             |
                                      |  - Choose run mode (visible/bg)     |
                                      +------------------+------------------+
                                                         |
                                                         v
                                      +------------------+------------------+
                                      |   Compiler Service (trace -> IR     |
                                      |   -> n8n JSON)                      |
                                      |  - Robust selectors, scroll logic   |
                                      |  - HTTP node swap if API detected   |
                                      +------------------+------------------+
                                                         |
                                                         v
      +---------------------+          +-----------------+------------------+          +-------------------+
      |   Firestore (DB)    |<-------->|         n8n Orchestrator          |<-------->|  n8n Cred Vault   |
      | users, workflows,   |  meta    |  - cron/webhook/manual triggers   |  creds   | (encrypted creds) |
      | runs, logs, status  |          |  - store/import workflow JSON     |          +-------------------+
      +----------+----------+          +-----------------+------------------+
                 |                                         |
                 |                                         v
                 |                           +-------------+--------------+
                 |                           |  Automation Runner          |
                 |                           | (Playwright/Puppeteer)      |
                 |                           | - Open pages/tabs           |
                 |                           | - Perform steps             |
                 |                           | - Verify + capture proofs   |
                 |                           +------+------+---------------+
                 |                                  |    |
                 |          pause (OTP/CAPTCHA) --->|    |---> step proof (thumbs, logs)
                 |                                  |    |
                 |                                  v    v
      +----------+-----------+            +---------+----+-----------+         +------------------------+
      | WhatsApp/Email Bot   |<-----------+  Notifier/Bridge         |-------->| Firebase Storage (FS)  |
      | - progress updates   |  updates   | - progress, alerts       |  links  | thumbs, artifacts (PDF)|
      | - OTP receive        |  OTP reply | - deep-link to resume    |         +------------------------+
      +----------------------+            +---------------------------+