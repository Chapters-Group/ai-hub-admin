# CHAPTERS AI Hub — Admin Panel Design Document

## 1. Product Vision

### What Is This?

A centralized web application that allows CHAPTERS Group administrators to manage, monitor, and configure Open WebUI deployments across all portfolio companies from a single interface. Instead of logging into each company's Open WebUI instance individually, the admin panel provides a unified dashboard where you can provision users, manage knowledge bases, configure AI agents, and track adoption — all through the Open WebUI API.

### Who Uses This?

| User | Role | What They Do |
|------|------|-------------|
| Anuraag / CHAPTERS AI Team | Super Admin | Full access to all instances. Provisions new companies, manages agents, monitors usage across the portfolio. |
| Company IT Contact | Company Admin | Manages their own company's users, uploads documents to knowledge bases, views their company's usage. Limited to their own instance. |
| Managing Directors | Read-Only Viewer | Views analytics dashboards and adoption metrics for presentations and investment reviews. |

### Core Problem It Solves

Managing 50+ Open WebUI instances manually is unsustainable. Every new employee onboarding, every document update, every agent configuration change requires logging into a specific instance. The admin panel turns this O(n) problem into O(1).

---

## 2. Information Architecture

### The Mental Model

The application is organized around a simple hierarchy that mirrors how CHAPTERS operates:

```
CHAPTERS Group (top level)
  └── Portfolio Company (e.g., BleTec, Somentec, rocom)
       ├── Users (employees at the company)
       ├── AI Agents / Models (customer support, HR, product docs)
       │    └── Knowledge Bases (documents powering each agent)
       ├── Groups (who can access what)
       └── Analytics (usage, adoption, tokens)
```

Every screen in the application operates within this hierarchy. The user always knows: "I'm looking at [Company X] → [Category Y]".

---

## 3. Application Screens — Detailed Breakdown

### 3.1 Global Navigation

**Persistent sidebar** visible on all screens:

```
┌─────────────────────────┐
│  CHAPTERS AI Hub         │
│  ─────────────────────── │
│  🏠 Dashboard            │
│  🏢 Companies            │
│  ─────────────────────── │
│  CURRENT COMPANY:        │
│  [▾ BleTec GmbH      ]  │  ← Company selector dropdown
│  ─────────────────────── │
│  👥 Users                │
│  🤖 Models & Agents      │
│  📚 Knowledge Bases      │
│  👨‍👩‍👧‍👦 Groups & Permissions │
│  📝 Prompts & Templates  │
│  🔧 Tools & Functions    │
│  ⚙️ Configuration        │
│  📊 Analytics            │
│  🔑 Authentication       │
│  📁 Files                │
│  ─────────────────────── │
│  PLATFORM                │
│  🏗️ Provisioning         │
│  📈 Portfolio Overview    │
│  🔗 API Proxy Manager    │
│  ⚕️ Health Monitor       │
│  ─────────────────────── │
│  Settings | Logout       │
└─────────────────────────┘
```

The **company selector** is the most important UI element. When switched, all screens below reload with that company's data. This is the "context" for the entire application.

---

### 3.2 Screen: Dashboard (Home)

**Purpose:** At-a-glance health and activity across all companies.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Dashboard                                          [Today ▾]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 12       │ │ 347      │ │ 8,420    │ │ 2.1M     │       │
│  │ Active   │ │ Active   │ │ Messages │ │ Tokens   │       │
│  │ Companies│ │ Users    │ │ Today    │ │ Today    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌─────────────────────────┐ ┌──────────────────────────┐   │
│  │ Messages per Day (7d)   │ │ Top Companies by Usage   │   │
│  │ [Line Chart]            │ │ 1. BleTec      — 2,340   │   │
│  │                         │ │ 2. Somentec    — 1,890   │   │
│  │                         │ │ 3. rocom       — 1,220   │   │
│  │                         │ │ 4. Convotis    — 980     │   │
│  │                         │ │ 5. Aareon      — 670     │   │
│  └─────────────────────────┘ └──────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Recent Activity Feed                                   │  │
│  │ • 10:32 — BleTec: 3 new users added                   │  │
│  │ • 09:45 — Somentec: Knowledge base "Billing FAQ"      │  │
│  │            updated (4 files added)                     │  │
│  │ • 08:12 — rocom: Model "IT-Support Agent" created     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**API endpoints used:**
- `GET /api/v1/analytics/summary` (per instance, aggregated)
- `GET /api/v1/analytics/daily` (per instance)
- `GET /api/v1/analytics/users` (per instance)
- `GET /api/v1/analytics/tokens` (per instance)
- `GET /api/v1/analytics/messages` (per instance)

---

### 3.3 Screen: Companies

**Purpose:** Registry of all portfolio company instances. This is the master list.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Companies                              [+ Add Company]      │
├──────────────────────────────────────────────────────────────┤
│  [🔍 Search companies...]                                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Company         │ URL                  │ Status │ Users│  │
│  ├─────────────────┼──────────────────────┼────────┼──────│  │
│  │ 🟢 BleTec       │ bletec.chat.chap...  │ Online │ 45   │  │
│  │ 🟢 Somentec     │ somentec.chat.ch...  │ Online │ 32   │  │
│  │ 🟡 rocom        │ rocom.chat.chap...   │ Slow   │ 28   │  │
│  │ 🔴 Convotis     │ convotis.chat.ch...  │ Down   │ 0    │  │
│  │ ⚪ Aareon       │ —                    │ Not    │ —    │  │
│  │                 │                      │ Deployed       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Clicking a company → sets it as current company +           │
│  navigates to its detail page                                │
└──────────────────────────────────────────────────────────────┘
```

**Company Detail Page:**

```
┌──────────────────────────────────────────────────────────────┐
│  ← Companies  /  BleTec GmbH                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Instance URL: https://bletec.chat.chaptersgroup.com         │
│  API Key:      sk-•••••••••••••••42fa     [Rotate] [Copy]   │
│  Status:       🟢 Online (v0.6.51)                           │
│  Deployed:     2025-09-15                                    │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 45       │ │ 3        │ │ 5        │ │ 12       │       │
│  │ Users    │ │ Agents   │ │ Knowledge│ │ Groups   │       │
│  │          │ │          │ │ Bases    │ │          │       │
│  └──[View]──┘ └──[View]──┘ └──[View]──┘ └──[View]──┘       │
│                                                              │
│  Quick Actions:                                              │
│  [Sync Models] [Export Config] [Check Health] [Open WebUI ↗]│
└──────────────────────────────────────────────────────────────┘
```

**API endpoints used:**
- Stored in admin panel's own database (company registry)
- `GET /api/models` (to verify connectivity and get version)
- `GET /api/v1/users/` (user count)
- `GET /api/v1/knowledge/` (KB count)

---

### 3.4 Screen: Users

**Purpose:** Manage employees who have access to the company's Open WebUI instance.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Users — BleTec GmbH                    [+ Create User]      │
├──────────────────────────────────────────────────────────────┤
│  [🔍 Search users...]    [Role: All ▾]  [Status: All ▾]     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Name          │ Email              │ Role  │ Last Active│  │
│  ├───────────────┼────────────────────┼───────┼───────────│  │
│  │ Max Müller    │ m.muller@bletec.de │ Admin │ 2 hrs ago │  │
│  │ Anna Schmidt  │ a.schmidt@bletec.de│ User  │ Today     │  │
│  │ Tom Weber     │ t.weber@bletec.de  │ User  │ 3 days ago│  │
│  │ Lisa Koch     │ l.koch@bletec.de   │ Pending│ Never    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Bulk Actions: [Select All] [Activate] [Deactivate] [Delete]│
└──────────────────────────────────────────────────────────────┘
```

**Create/Edit User Dialog:**

```
┌─────────────────────────────────────┐
│  Create New User                     │
├─────────────────────────────────────┤
│  Name:     [________________]       │
│  Email:    [________________]       │
│  Password: [________________] [🎲]  │
│  Role:     [User ▾]                 │
│  Groups:   [☑ All Users]            │
│            [☐ Management]           │
│            [☐ IT Team]              │
│                                     │
│  [Cancel]              [Create User]│
└─────────────────────────────────────┘
```

**API endpoints used:**
- `GET /api/v1/users/` — List all users
- `GET /api/v1/users/search` — Search users
- `POST /api/v1/auths/signup` — Create new user
- `POST /api/v1/users/{id}/update` — Update user
- `DELETE /api/v1/users/{id}` — Delete user
- `GET /api/v1/users/{id}/settings` — Get user settings
- `POST /api/v1/users/{id}/settings` — Update user settings
- `GET /api/v1/users/permissions` — Get permissions config
- `POST /api/v1/users/permissions` — Update permissions

---

### 3.5 Screen: Models & Agents

**Purpose:** Create and configure custom AI models (agents) that combine a base LLM + system prompt + knowledge base + tools.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Models & Agents — BleTec GmbH           [+ Create Agent]    │
├──────────────────────────────────────────────────────────────┤
│  [Base Models]  [Custom Agents]  [Connections]               │
│                                                              │
│  Custom Agents tab:                                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🤖 BleTec Product Support                              │  │
│  │    Base: gpt-4o │ KB: IT-Blech Docs │ Status: Active  │  │
│  │    [Edit] [Clone] [Toggle] [Delete]                    │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 🤖 BleTec HR Assistant                                 │  │
│  │    Base: gpt-4o-mini │ KB: HR Policies │ Active        │  │
│  │    [Edit] [Clone] [Toggle] [Delete]                    │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 🤖 BleTec Internal Docs                                │  │
│  │    Base: gpt-4o │ KB: Internal Wiki │ Active           │  │
│  │    [Edit] [Clone] [Toggle] [Delete]                    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  [Sync Models] [Import] [Export All]                         │
└──────────────────────────────────────────────────────────────┘
```

**Create/Edit Agent Page (full page, not dialog):**

```
┌──────────────────────────────────────────────────────────────┐
│  ← Models & Agents  /  Edit: BleTec Product Support          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  BASIC INFORMATION                                           │
│  Agent Name:    [BleTec Product Support     ]               │
│  Agent ID:      bletec-product-support (auto-generated)     │
│  Description:   [Product documentation assistant for...]    │
│  Base Model:    [gpt-4o ▾]                                  │
│                                                              │
│  SYSTEM PROMPT                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ You are the BleTec product support assistant.        │   │
│  │ Answer questions using ONLY the provided             │   │
│  │ documentation. If the answer is not found in the     │   │
│  │ documents, say so clearly. Always respond in the     │   │
│  │ same language as the user's question.                │   │
│  │                                                      │   │
│  │ Mandatory response rules:                            │   │
│  │ 1. Never make up information                         │   │
│  │ 2. Always cite which document you referenced         │   │
│  │ 3. If unsure, say "I don't have this information"    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  KNOWLEDGE BASES (RAG)                                       │
│  Attached:                                                   │
│  [☑ IT-Blech Product Docs (42 files)]                       │
│  [☐ BleTec FAQ (12 files)]                                  │
│  [☐ General CHAPTERS Docs (8 files)]                        │
│                                                              │
│  MODEL PARAMETERS                                            │
│  Temperature:   [0.3 ────●──── 1.0]                        │
│  Top K:         [5 ▾]                                       │
│  Max Tokens:    [4096 ▾]                                    │
│                                                              │
│  ACCESS CONTROL                                              │
│  Who can use this agent:                                     │
│  [☑ All Users]                                              │
│  [☑ IT Team]                                                │
│  [☐ Management Only]                                        │
│                                                              │
│  TOOLS                                                       │
│  [☐ Web Search]                                             │
│  [☐ Code Execution]                                         │
│  [☐ Image Generation]                                       │
│                                                              │
│  [Cancel]    [Save as Draft]    [Save & Activate]           │
└──────────────────────────────────────────────────────────────┘
```

**Connections Tab** (manages Azure OpenAI connections):

```
┌──────────────────────────────────────────────────────────────┐
│  Connections — BleTec GmbH                                   │
├──────────────────────────────────────────────────────────────┤
│  OpenAI-Compatible APIs:                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🟢 Azure OpenAI (Sweden Central)                       │  │
│  │    URL: https://bletec-ai.openai.azure.com/v1         │  │
│  │    Models: gpt-4o, gpt-4o-mini                        │  │
│  │    [Edit] [Verify] [Remove]                            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  [+ Add Connection]                                          │
└──────────────────────────────────────────────────────────────┘
```

**API endpoints used:**
- `GET /api/models` — List all models
- `POST /api/models/create` — Create custom model
- `POST /api/models/update` — Update model
- `DELETE /api/models/delete` — Delete model
- `POST /api/models/{id}/toggle` — Enable/disable
- `POST /api/models/{id}/access` — Set group access
- `GET /api/models/base` — List available base models
- `POST /api/models/sync` — Sync model list
- `POST /api/models/import` — Import model configs
- `GET /api/models/export` — Export model configs
- `GET /api/v1/configs/connections` — Get connections
- `POST /api/v1/configs/connections` — Update connections
- `POST /api/v1/openai/verify` — Verify connection

---

### 3.6 Screen: Knowledge Bases

**Purpose:** Manage document collections that power RAG for each agent.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Knowledge Bases — BleTec GmbH        [+ Create Knowledge]   │
├──────────────────────────────────────────────────────────────┤
│  [🔍 Search...]                                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📚 IT-Blech Product Documentation                      │  │
│  │    42 files │ 128 MB │ Last updated: 2 days ago        │  │
│  │    Used by: BleTec Product Support                     │  │
│  │    Status: ✅ Fully indexed                             │  │
│  │    [Manage Files] [Reindex] [Export] [Delete]          │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 📚 HR Policies & Procedures                            │  │
│  │    18 files │ 24 MB │ Last updated: 1 week ago         │  │
│  │    Used by: BleTec HR Assistant                        │  │
│  │    Status: ✅ Fully indexed                             │  │
│  │    [Manage Files] [Reindex] [Export] [Delete]          │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 📚 Customer FAQ                                        │  │
│  │    8 files │ 6 MB │ Last updated: 3 weeks ago          │  │
│  │    Used by: (none)                                     │  │
│  │    Status: ⚠️ 2 files pending processing               │  │
│  │    [Manage Files] [Reindex] [Export] [Delete]          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**Manage Files Sub-Screen:**

```
┌──────────────────────────────────────────────────────────────┐
│  ← Knowledge Bases / IT-Blech Product Documentation          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  📁 Drag & drop files here or [Browse Files]         │   │
│  │     Supported: PDF, DOCX, TXT, MD, CSV, XLSX        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Files (42):                                     [Select All]│
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ☐ │ 📄 installation-guide-v3.pdf    │ 4.2 MB │ ✅     │  │
│  │ ☐ │ 📄 api-reference.md             │ 890 KB │ ✅     │  │
│  │ ☐ │ 📄 release-notes-2025.docx      │ 1.1 MB │ ✅     │  │
│  │ ☐ │ 📄 troubleshooting.pdf          │ 2.3 MB │ ⏳     │  │
│  │ ☐ │ 📄 hardware-specs.xlsx          │ 340 KB │ ❌     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Selected: [Delete Selected] [Reprocess Selected]            │
└──────────────────────────────────────────────────────────────┘
```

**API endpoints used:**
- `GET /api/v1/knowledge/` — List all knowledge bases
- `POST /api/v1/knowledge/create` — Create knowledge base
- `GET /api/v1/knowledge/{id}` — Get details
- `POST /api/v1/knowledge/{id}/update` — Update
- `DELETE /api/v1/knowledge/{id}` — Delete
- `POST /api/v1/knowledge/{id}/file/add` — Add file to KB
- `POST /api/v1/knowledge/{id}/file/remove` — Remove file
- `POST /api/v1/knowledge/{id}/reindex` — Reindex
- `POST /api/v1/knowledge/{id}/reset` — Reset vectors
- `GET /api/v1/knowledge/search` — Search across KBs
- `POST /api/v1/files/` — Upload file
- `GET /api/v1/files/` — List files
- `GET /api/v1/files/{id}` — Get file info
- `DELETE /api/v1/files/{id}` — Delete file
- `GET /api/v1/files/{id}/content` — Download file

---

### 3.7 Screen: Groups & Permissions

**Purpose:** Control who can access which models and features.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Groups & Permissions — BleTec GmbH     [+ Create Group]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 👨‍👩‍👧‍👦 All Users (default)                                 │  │
│  │    45 members │ Access: BleTec HR Assistant             │  │
│  │    [Manage Members] [Edit Permissions] [Edit Access]   │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 👨‍👩‍👧‍👦 IT Team                                              │  │
│  │    12 members │ Access: All models                     │  │
│  │    [Manage Members] [Edit Permissions] [Edit Access]   │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 👨‍👩‍👧‍👦 Management                                           │  │
│  │    5 members │ Access: HR Assistant, Internal Docs     │  │
│  │    [Manage Members] [Edit Permissions] [Edit Access]   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Global Permissions:                                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ File uploads:       [✅ Enabled]                       │  │
│  │ File deletions:     [✅ Enabled]                       │  │
│  │ Temporary chats:    [✅ Enabled]                       │  │
│  │ Knowledge creation: [❌ Admin only]                    │  │
│  │ Tool creation:      [❌ Admin only]                    │  │
│  │ Model creation:     [❌ Admin only]                    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**API endpoints used:**
- `GET /api/v1/groups/` — List groups
- `POST /api/v1/groups/create` — Create group
- `GET /api/v1/groups/{id}` — Get group details
- `POST /api/v1/groups/{id}/update` — Update group
- `DELETE /api/v1/groups/{id}` — Delete group
- `GET /api/v1/groups/export` — Export groups
- `GET /api/v1/users/permissions` — Get permissions
- `POST /api/v1/users/permissions` — Update permissions

---

### 3.8 Screen: Prompts & Templates

**Purpose:** Manage reusable prompt templates that can be shared across agents or companies.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Prompts & Templates — BleTec GmbH       [+ Create Prompt]   │
├──────────────────────────────────────────────────────────────┤
│  [Company Prompts]  [CHAPTERS Templates]                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📝 Customer Support Base Prompt                        │  │
│  │    Version 3 │ Last edited: Jan 12 │ Tag: support     │  │
│  │    Used by: BleTec Product Support agent               │  │
│  │    [Edit] [Version History] [Clone to Other Company]   │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 📝 HR Policy Q&A Prompt                                │  │
│  │    Version 1 │ Last edited: Dec 05 │ Tag: hr          │  │
│  │    [Edit] [Version History] [Clone to Other Company]   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  "Clone to Other Company" → deploys the same prompt template │
│  to another portfolio company's Open WebUI instance          │
└──────────────────────────────────────────────────────────────┘
```

**API endpoints used:**
- `GET /api/v1/prompts/` — List prompts
- `POST /api/v1/prompts/create` — Create prompt
- `GET /api/v1/prompts/{slug}` — Get prompt
- `POST /api/v1/prompts/{slug}/update` — Update
- `DELETE /api/v1/prompts/{slug}` — Delete
- `GET /api/v1/prompts/{slug}/history` — Version history
- `POST /api/v1/prompts/{slug}/access` — Set access
- `GET /api/v1/prompts/tags` — List prompt tags

---

### 3.9 Screen: Tools & Functions

**Purpose:** Manage tools (web search, code execution, custom functions) and filter/pipe functions available to agents.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Tools & Functions — BleTec GmbH                             │
├──────────────────────────────────────────────────────────────┤
│  [Tools]  [Functions]  [Tool Servers]                        │
│                                                              │
│  Tools tab:                                          [+ Add] │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🔧 Web Search (SearXNG)          │ Active │ [Config]  │  │
│  │ 🔧 Email Sender (Graph API)      │ Active │ [Config]  │  │
│  │ 🔧 Social Media Publisher        │ Inactive│ [Config] │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Functions tab:                                      [+ Add] │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ⚡ PII Filter (pipe)              │ Global │ [Valves]  │  │
│  │ ⚡ Response Formatter (filter)    │ Active │ [Valves]  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Tool Servers tab:                                   [+ Add] │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🌐 MCP Server: SharePoint        │ 🟢 Connected       │  │
│  │ 🌐 MCP Server: Jira              │ 🔴 Disconnected    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**API endpoints used:**
- Tools: `GET/POST/DELETE /api/v1/tools/`, per-tool `valves`, `access`, `toggle`
- Functions: `GET/POST/DELETE /api/v1/functions/`, per-function `valves`, `toggle`, `toggle/global`
- Tool Servers: `GET/POST /api/v1/configs/tool_servers`

---

### 3.10 Screen: Configuration

**Purpose:** Manage instance-level settings — RAG config, code execution, banners, OAuth.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Configuration — BleTec GmbH                                 │
├──────────────────────────────────────────────────────────────┤
│  [General] [RAG] [Auth & OAuth] [Banners] [Code Execution]  │
│                                                              │
│  RAG tab:                                                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Chunk Size:        [400        ]                       │  │
│  │ Chunk Overlap:     [100        ]                       │  │
│  │ Top K Results:     [5          ]                       │  │
│  │ Relevance Threshold: [0.3 ───●── 1.0]                │  │
│  │                                                        │  │
│  │ Embedding Model:                                       │  │
│  │ Engine:   [OpenAI ▾]                                  │  │
│  │ Model:    [text-embedding-3-small ▾]                  │  │
│  │ API URL:  [https://bletec-ai.openai.azure.com/v1]    │  │
│  │                                                        │  │
│  │ [Save Configuration]                                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  General tab:                                                │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Default Model:     [gpt-4o ▾]                         │  │
│  │ Enable Signup:     [❌ Disabled]                       │  │
│  │ Default User Role: [User ▾]                           │  │
│  │ WebUI Name:        [BleTec AI Hub    ]                │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Auth & OAuth tab:                                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ SSO Provider:      [Microsoft Entra ID ▾]             │  │
│  │ Client ID:         [••••••••••••••]                   │  │
│  │ Allowed Domains:   [bletec.de]                        │  │
│  │ Auto-create users: [✅ Enabled]                       │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**API endpoints used:**
- `GET/POST /api/v1/retrieval/config` — RAG configuration
- `GET/POST /api/v1/retrieval/embedding/config` — Embedding config
- `GET/POST /api/v1/configs/` — General configs
- `GET/POST /api/v1/configs/banners` — Banner management
- `GET/POST /api/v1/configs/code_execution` — Code execution settings
- `GET/POST /api/v1/configs/oauth` — OAuth settings
- `GET/POST /api/v1/auths/admin/config` — Auth admin config

---

### 3.11 Screen: Analytics

**Purpose:** Usage metrics and adoption tracking for the selected company.

**Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  Analytics — BleTec GmbH           [Last 7 days ▾] [Export]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 45       │ │ 32       │ │ 2,340    │ │ 890K     │       │
│  │ Total    │ │ Active   │ │ Messages │ │ Tokens   │       │
│  │ Users    │ │ Users    │ │ (7d)     │ │ (7d)     │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌─────────────────────────────┐ ┌────────────────────────┐ │
│  │ Daily Messages              │ │ Messages by Model      │ │
│  │ [Area Chart - 7 days]       │ │ [Pie Chart]            │ │
│  │                             │ │ ● Product Support 52%  │ │
│  │                             │ │ ● HR Assistant   31%   │ │
│  │                             │ │ ● Internal Docs  17%   │ │
│  └─────────────────────────────┘ └────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Top Users (7d)                                         │  │
│  │ 1. Max Müller — 342 messages                          │  │
│  │ 2. Anna Schmidt — 289 messages                        │  │
│  │ 3. Tom Weber — 198 messages                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Model Leaderboard (from user feedback)                 │  │
│  │ ⭐ 4.6 BleTec Product Support                         │  │
│  │ ⭐ 4.2 HR Assistant                                   │  │
│  │ ⭐ 3.8 Internal Docs                                  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

**API endpoints used:**
- `GET /api/v1/analytics/summary` — Summary stats
- `GET /api/v1/analytics/daily` — Daily breakdown
- `GET /api/v1/analytics/messages` — Message analytics
- `GET /api/v1/analytics/models` — Per-model usage
- `GET /api/v1/analytics/tokens` — Token consumption
- `GET /api/v1/analytics/users` — Per-user stats
- `GET /api/v1/evaluations/leaderboard` — Model ratings
- `GET /api/v1/evaluations/` — Feedback data

---

### 3.12 Screen: Authentication & API Keys

**Purpose:** Manage SSO configuration, API keys, and authentication settings.

```
┌──────────────────────────────────────────────────────────────┐
│  Authentication — BleTec GmbH                                │
├──────────────────────────────────────────────────────────────┤
│  [SSO / OAuth]  [API Keys]  [LDAP]  [Signup Settings]       │
│                                                              │
│  API Keys tab:                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Admin API Key:     sk-•••••42fa   [Rotate] [Copy]     │  │
│  │ Created: 2025-09-15 │ Last used: 2 min ago            │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ Chatbot Proxy Key: sk-•••••8b21   [Rotate] [Copy]     │  │
│  │ Created: 2025-11-01 │ Last used: 1 hr ago             │  │
│  └────────────────────────────────────────────────────────┘  │
│  [+ Generate New API Key]                                    │
└──────────────────────────────────────────────────────────────┘
```

**API endpoints used:**
- `GET/POST /api/v1/auths/admin/config` — Auth config
- `POST /api/v1/auths/api_key` — Generate API key
- `DELETE /api/v1/auths/api_key` — Delete API key
- `GET /api/v1/auths/api_key` — Get current key
- `GET/POST /api/v1/configs/oauth` — OAuth settings

---

### 3.13 Screen: Files

**Purpose:** Manage all uploaded files across the instance (independent of knowledge bases).

```
┌──────────────────────────────────────────────────────────────┐
│  Files — BleTec GmbH                        [+ Upload Files] │
├──────────────────────────────────────────────────────────────┤
│  [🔍 Search files...]     [Type: All ▾]                      │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ☐ │ File Name              │ Size  │ KB       │ Status│  │
│  ├───┼────────────────────────┼───────┼──────────┼───────│  │
│  │ ☐ │ install-guide-v3.pdf   │ 4.2MB │ IT-Blech │ ✅    │  │
│  │ ☐ │ hr-policy-2025.docx    │ 1.1MB │ HR Docs  │ ✅    │  │
│  │ ☐ │ specs-sheet.xlsx       │ 340KB │ (none)   │ ❌    │  │
│  │ ☐ │ meeting-notes.md       │ 12KB  │ (none)   │ ✅    │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Selected: [Add to Knowledge Base] [Delete] [Reprocess]      │
└──────────────────────────────────────────────────────────────┘
```

**API endpoints used:**
- `POST /api/v1/files/` — Upload
- `GET /api/v1/files/` — List
- `GET /api/v1/files/search` — Search
- `GET /api/v1/files/{id}` — Details
- `GET /api/v1/files/{id}/content` — Download
- `DELETE /api/v1/files/{id}` — Delete
- `POST /api/v1/retrieval/process/file` — Process file for RAG

---

### 3.14 Platform Screens (Cross-Company)

These screens operate at the CHAPTERS level, not per-company.

#### 3.14.1 Provisioning

**Purpose:** Onboard a new portfolio company in one workflow.

```
┌──────────────────────────────────────────────────────────────┐
│  Provision New Company                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1 of 4: Company Details                                │
│  ──────────────────────────────────────────────────           │
│  Company Name:    [                    ]                     │
│  Domain:          [.chat.chaptersgroup.com]                  │
│  Contact Person:  [                    ]                     │
│  Contact Email:   [                    ]                     │
│                                                              │
│  Step 2 of 4: Instance Setup                                 │
│  ──────────────────────────────────────────────────           │
│  Instance URL:    [Auto-generated from domain]               │
│  API Key:         [Will be generated on connection]          │
│                                                              │
│  Step 3 of 4: Default Agents                                 │
│  ──────────────────────────────────────────────────           │
│  Deploy standard agents:                                     │
│  [☑ HR Assistant (CHAPTERS template)]                        │
│  [☑ General Q&A (CHAPTERS template)]                         │
│  [☐ Product Support (requires custom KB)]                    │
│  [☐ Customer Support (requires custom KB)]                   │
│                                                              │
│  Step 4 of 4: Initial Users                                  │
│  ──────────────────────────────────────────────────           │
│  Admin user:      [admin@company.de]                         │
│  [+ Add more users]                                          │
│                                                              │
│  [Back]                                      [Provision Now] │
└──────────────────────────────────────────────────────────────┘
```

#### 3.14.2 Portfolio Overview

**Purpose:** Bird's-eye view for MDs and leadership presentations.

```
┌──────────────────────────────────────────────────────────────┐
│  Portfolio AI Adoption Overview             [Export to PPTX]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 12/52    │ │ 347      │ │ 52,400   │ │ €2,840   │       │
│  │ Companies│ │ Total    │ │ Messages │ │ Est. Cost│       │
│  │ Deployed │ │ Users    │ │ (30d)    │ │ (30d)    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Adoption Heatmap (messages/user/week by company)       │  │
│  │ [Heatmap grid visualization]                           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Company          │ Users │ Active │ Msgs/wk │ Status  │  │
│  ├──────────────────┼───────┼────────┼─────────┼─────────│  │
│  │ BleTec           │ 45    │ 32     │ 2,340   │ 🟢 High │  │
│  │ Somentec         │ 32    │ 18     │ 1,890   │ 🟢 High │  │
│  │ rocom            │ 28    │ 22     │ 1,220   │ 🟡 Med  │  │
│  │ Convotis         │ 15    │ 3      │ 120     │ 🔴 Low  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

#### 3.14.3 API Proxy Manager

**Purpose:** Manage the customer-facing chatbot API proxies.

```
┌──────────────────────────────────────────────────────────────┐
│  API Proxy Manager                       [+ Register Agent]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Active API Agents:                                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Endpoint                  │ Company │ Requests/day│ ●  │  │
│  ├──────────────────────────┼─────────┼─────────────┼────│  │
│  │ /chat/bletec-support     │ BleTec  │ 342         │ 🟢│  │
│  │ /chat/rocom-support      │ rocom   │ 128         │ 🟢│  │
│  │ /chat/somentec-billing   │ Somentec│ 56          │ 🟡│  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  [Widget Code Generator] — generates embed code per agent    │
└──────────────────────────────────────────────────────────────┘
```

#### 3.14.4 Health Monitor

**Purpose:** Real-time status of all Open WebUI instances.

```
┌──────────────────────────────────────────────────────────────┐
│  Health Monitor                          [Auto-refresh: 60s] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Instance            │ Status │ Response │ Version      │  │
│  ├─────────────────────┼────────┼──────────┼──────────────│  │
│  │ chat.chaptersgroup  │ 🟢 200 │ 120ms    │ v0.6.51     │  │
│  │ bletec.chat.chap... │ 🟢 200 │ 230ms    │ v0.6.51     │  │
│  │ somentec.chat.ch... │ 🟢 200 │ 180ms    │ v0.6.49     │  │
│  │ rocom.chat.chap...  │ 🟡 200 │ 2100ms   │ v0.6.51     │  │
│  │ convotis.chat.ch... │ 🔴 503 │ timeout  │ —           │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  [🔔 Alerts: Convotis instance down since 14:32]            │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. Cross-Cutting Features

### 4.1 Clone & Sync Across Companies

One of the most powerful features: take any configuration from one company and deploy it to others.

- **Clone Agent** → Select source company → Select agent → Select target companies → Deploy
- **Clone Prompt Template** → Same flow
- **Clone Tool Configuration** → Same flow
- **Sync RAG Config** → Push standardized RAG settings to all companies

This works by reading from the source instance's API and writing to the target instance's API.

### 4.2 Bulk Operations

- Create the same user across multiple instances (e.g., a CHAPTERS consultant who needs access everywhere)
- Push a document to all companies' HR knowledge bases
- Update a system prompt across all instances that use a specific template
- Rotate API keys across all instances

### 4.3 Audit Log

Track every action taken through the admin panel:
- Who did what, when, on which company's instance
- Stored in the admin panel's own database (not in Open WebUI)
- Essential for GDPR compliance documentation

### 4.4 Role-Based Access in the Admin Panel Itself

The admin panel needs its own auth layer (separate from Open WebUI):

| Role | Access |
|------|--------|
| Super Admin | All companies, all features, provisioning |
| Company Admin | Their company only, all features except provisioning |
| Viewer | Read-only access to analytics and configuration |

---

## 5. Data Architecture

### What the Admin Panel Stores (Its Own Database)

- Company registry (name, URL, API key, status, metadata)
- Admin panel users and roles
- Audit logs
- Cached analytics for portfolio overview
- Clone/sync job history
- Health check history
- API proxy agent configurations

### What It Does NOT Store

- Open WebUI users, chats, files, knowledge bases — these live in each instance
- The admin panel is a **management layer**, not a data store
- All data flows through the Open WebUI API in real-time

---

## 6. API Endpoints Coverage Summary

| Screen | API Category | Endpoints Used | Coverage |
|--------|-------------|---------------|----------|
| Dashboard | analytics | 6/8 | 75% |
| Users | users, auths | 15/41 | 37% |
| Models & Agents | models, configs | 14/29 | 48% |
| Knowledge Bases | knowledge, files | 16/29 | 55% |
| Groups | groups, users | 8/31 | 26% |
| Prompts | prompts | 8/15 | 53% |
| Tools & Functions | tools, functions, configs | 15/47 | 32% |
| Configuration | retrieval, configs, auths | 12/52 | 23% |
| Analytics | analytics, evaluations | 8/23 | 35% |
| Authentication | auths, configs | 8/35 | 23% |
| Files | files, retrieval | 8/29 | 28% |
| **Total unique** | | **~118/412** | **29%** |

The remaining ~294 endpoints are primarily end-user features (chat operations, ollama pass-through, channel messaging, memories, notes, folders, images, audio, tasks, skills) that don't belong in an admin panel. The 118 endpoints cover virtually all administrative and management functionality.

---

## 7. Recommended Build Order

### Phase 1 — Foundation (Week 1-2)
1. FastAPI backend with company registry + auth
2. React shell with sidebar navigation + company selector
3. Health Monitor (simplest screen, validates API connectivity)
4. Companies screen (CRUD for the registry)

### Phase 2 — Core Management (Week 3-4)
5. Users screen (most requested by company admins)
6. Knowledge Bases screen (most operationally critical)
7. Models & Agents screen (the showcase feature)
8. Groups & Permissions screen

### Phase 3 — Configuration & Insights (Week 5-6)
9. Configuration screen (RAG, auth, general settings)
10. Analytics screen
11. Authentication & API Keys screen
12. Files screen

### Phase 4 — Platform Features (Week 7-8)
13. Provisioning wizard
14. Portfolio Overview
15. Clone & Sync features
16. API Proxy Manager
17. Prompts & Templates
18. Tools & Functions

### Phase 5 — Polish
19. Audit logging
20. Export to PPTX/PDF for presentations
21. Email notifications for health alerts
22. Bulk operations

---

## 8. Technical Decisions

Decisions confirmed during design review:

### Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | React + shadcn/ui + Tremor | Biggest community, easiest to find help, pairs naturally with FastAPI backend |
| **Backend** | FastAPI (Python) | Consistent with existing CHAPTERS tooling, async-first, excellent OpenAPI docs |
| **Database** | PostgreSQL | Consistent with the rest of the AI Hub stack |
| **Charts/Viz** | Tremor | React-native charting library, designed for dashboards |
| **UI Components** | shadcn/ui (Tailwind CSS) | Copy-paste components, fully customizable, no vendor lock-in |

### Hosting

Local development for now. No cloud hosting decisions needed for MVP. The admin panel will run as two local processes (FastAPI backend + React dev server) connecting to remote Open WebUI instances over HTTPS.

### Authentication & API Key Model

- On each Open WebUI deployment (CHAPTERS + each OpCo), a dedicated admin account is created using email/password (not Microsoft SSO).
- This admin account generates an API key within that instance.
- The admin panel stores each instance's URL + API key in its own PostgreSQL database.
- Each instance therefore has its own independent API key. The admin panel uses the correct key when making API calls to a specific instance.
- All API calls go over HTTPS through the Application Gateway — no VPN or special network access required.

### Provisioning Scope

"Provision Now" **only registers an already-deployed Azure instance** in the admin panel's database. It does NOT trigger infrastructure deployment. The Azure deployment pipeline (`spoke-deploy.sh`, `hub-onboard.sh`, etc.) is completely separate from the admin panel. The provisioning wizard collects the instance URL, connects to it with the provided API key, verifies connectivity, and saves it to the registry.

### API Proxy Manager Scope

The API Proxy is an **admin-only tool for testing chat APIs** directly from the admin panel UI. It is NOT a customer-facing chatbot proxy. Think of it as a built-in API playground/Postman specifically for the chat completion endpoints, allowing the admin to test agents, prompts, and model configurations without leaving the admin panel.

### Access Control (MVP)

The MVP is **super admin only** — a single admin role with full access to all companies and all features. Role-based access control (Company Admin, Viewer roles) will be added in a later phase.

### Build Strategy

All screens will be implemented. Development will pause for a checkpoint after the first ~9-10 screens (Phases 1-3), then continue with the remaining screens (Phase 4-5).
