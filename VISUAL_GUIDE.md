# Visual Project Guide

## 🎨 Project Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────┘

1. SETUP
   📋 Read QUICKSTART.md
   ⬇️
   💻 Run: bun install
   ⬇️
   ⚙️  Configure .env
   ⬇️
   🚀 Run: bun run dev
   
2. EXPLORE
   🌐 Visit: http://localhost:3006/openapi
   ⬇️
   📖 Browse API endpoints
   ⬇️
   🧪 Try sample requests
   
3. INTEGRATE
   📝 Read EXAMPLES.md
   ⬇️
   💡 Copy code examples
   ⬇️
   🔌 Integrate with your app

4. DEPLOY
   🐳 Read DOCKER.md
   ⬇️
   📦 Build container
   ⬇️
   🚢 Deploy to production
```

## 📚 Documentation Map

```
                    README.md
                   (Start Here)
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   QUICKSTART.md   EXAMPLES.md    DOCKER.md
   (Setup)         (Usage)        (Deploy)
        │               │               │
        │               │               │
        └───────────────┼───────────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
        ARCHITECTURE.md    CONTRIBUTING.md
        (Deep Dive)        (Contribute)
```

## 🏗️ System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER/CLIENT                            │
│  • Swagger UI: http://localhost:3006/openapi               │
│  • REST API: http://localhost:3006/api2/json/*             │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/HTTPS
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              ELYSIA SERVER (PORT 3006)                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  ROUTES LAYER                                          │ │
│  │  • /health                    [System]                 │ │
│  │  • /openapi                   [Docs]                   │ │
│  │  • /api2/json/*               [Auto-generated]         │ │
│  └────────────────────────────────────────────────────────┘ │
│                        │                                     │
│  ┌────────────────────┼────────────────────────────────────┐ │
│  │  MIDDLEWARE LAYER  │                                    │ │
│  │  • OpenAPI Plugin  │                                    │ │
│  │  • Type Validation │                                    │ │
│  │  • Logging        │                                    │ │
│  └────────────────────┼────────────────────────────────────┘ │
│                        │                                     │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │  SCHEMA PARSER                                          │ │
│  │  • Type Conversion (Proxmox → TypeBox)                 │ │
│  │  • Route Generation                                     │ │
│  │  • Tag Organization                                     │ │
│  └────────────────────┬────────────────────────────────────┘ │
│                        │                                     │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │  HTTP CLIENT (Axios)                                    │ │
│  │  • Request Proxy                                        │ │
│  │  • Response Transform (0/1 → true/false)               │ │
│  │  • Error Handling                                       │ │
│  └────────────────────┬────────────────────────────────────┘ │
└────────────────────────┼────────────────────────────────────┘
                         │ HTTPS + API Token
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              PROXMOX VE SERVER                               │
│              https://your-proxmox:8006                       │
│              /api2/json/*                                    │
└─────────────────────────────────────────────────────────────┘
```

## 📁 File Organization

```
pve-openapi/
│
├── 📖 DOCS/             (Read first)
│   ├── README.md        ← Start here
│   ├── QUICKSTART.md    ← Setup guide
│   ├── EXAMPLES.md      ← Usage examples
│   ├── ARCHITECTURE.md  ← Technical details
│   ├── CONTRIBUTING.md  ← How to contribute
│   ├── DOCKER.md        ← Deployment
│   ├── CHANGELOG.md     ← Version history
│   └── LICENSE          ← MIT License
│
├── ⚙️  CONFIG/           (Configuration)
│   ├── .env.example     ← Copy to .env
│   ├── .gitignore       ← Git exclusions
│   ├── package.json     ← Dependencies & scripts
│   └── tsconfig.json    ← TypeScript config
│
├── 🐳 DOCKER/           (Containerization)
│   ├── Dockerfile       ← Container definition
│   └── docker-compose.yml ← Compose config
│
├── 🔨 SCRIPTS/          (Utilities)
│   ├── fetch-schema.sh  ← Fetch API schema
│   └── convert-schema.ts ← Convert to TS
│
└── 💻 SRC/              (Source code)
    ├── index.ts         ← Entry point
    ├── generate-routes.ts ← Route generator
    └── libs/
        ├── env.ts       ← Environment config
        ├── http.ts      ← HTTP client
        ├── pve.ts       ← API schema (60k lines)
        └── schema-parser.ts ← Type converter
```

## 🎯 Use Case Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        ACTORS                                 │
└──────────────────────────────────────────────────────────────┘

👨‍💻 Developer                  🔧 DevOps                   👤 API User
    │                           │                         │
    ├─ Read ARCHITECTURE.md     ├─ Read DOCKER.md        ├─ Read QUICKSTART.md
    ├─ Read CONTRIBUTING.md     ├─ Build container       ├─ Access Swagger UI
    ├─ Modify code              ├─ Deploy service        ├─ Make API calls
    ├─ Add features             ├─ Monitor health        ├─ View responses
    └─ Submit PR                └─ Scale service         └─ Integrate app


┌──────────────────────────────────────────────────────────────┐
│                      COMMON TASKS                             │
└──────────────────────────────────────────────────────────────┘

Task: "I want to get started quickly"
  → Read: QUICKSTART.md
  → Time: 5 minutes

Task: "I want to see API examples"
  → Read: EXAMPLES.md
  → Try: Swagger UI

Task: "I want to deploy to production"
  → Read: DOCKER.md
  → Run: docker-compose up -d

Task: "I want to understand the code"
  → Read: ARCHITECTURE.md
  → Explore: src/ directory

Task: "I want to contribute"
  → Read: CONTRIBUTING.md
  → Fork & PR

Task: "I want to update the schema"
  → Run: bun run update-schema
  → Restart server
```

## 🔄 Development Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   DEVELOPMENT CYCLE                          │
└─────────────────────────────────────────────────────────────┘

1. SETUP
   git clone <repo>
   bun install
   cp .env.example .env
   
2. DEVELOP
   bun run dev (auto-reload)
   Edit code in src/
   Test in browser
   
3. UPDATE SCHEMA (if needed)
   bun run update-schema
   Review changes
   Restart server
   
4. TEST
   curl http://localhost:3006/health
   Visit /openapi
   Try endpoints
   
5. COMMIT
   git add .
   git commit -m "description"
   git push
   
6. DEPLOY
   docker-compose build
   docker-compose up -d
```

## 🎓 Learning Path

```
┌─────────────────────────────────────────────────────────────┐
│               RECOMMENDED LEARNING ORDER                     │
└─────────────────────────────────────────────────────────────┘

Level 1: BEGINNER
  1. README.md          ← Overview
  2. QUICKSTART.md      ← Setup
  3. EXAMPLES.md        ← Usage
     ↓
     You can now: Use the API

Level 2: INTERMEDIATE
  4. DOCKER.md          ← Deployment
  5. package.json       ← Scripts
     ↓
     You can now: Deploy the API

Level 3: ADVANCED
  6. ARCHITECTURE.md    ← Design
  7. src/               ← Code
  8. CONTRIBUTING.md    ← Development
     ↓
     You can now: Extend the API

Level 4: EXPERT
  9. schema-parser.ts   ← Type system
  10. http.ts           ← Networking
     ↓
     You can now: Architect changes
```

## 📊 Feature Matrix

```
┌──────────────────────────────────────────────────────────────┐
│                    WHAT CAN YOU DO?                          │
└──────────────────────────────────────────────────────────────┘

✅ Browse Proxmox API documentation (Swagger UI)
✅ Make API calls via REST
✅ Get type-safe responses
✅ Auto-convert boolean values
✅ Deploy with Docker
✅ Update API schema
✅ Monitor service health
✅ Extend with new features
✅ Contribute to project
✅ Deploy to production

┌──────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT OPTIONS                         │
└──────────────────────────────────────────────────────────────┘

1. Local Development
   └─ bun run dev
   
2. Production (Bare Metal)
   └─ bun run start
   
3. Docker Container
   └─ docker run ...
   
4. Docker Compose
   └─ docker-compose up -d
   
5. Kubernetes
   └─ kubectl apply -f k8s/
   
6. Cloud Platforms
   ├─ AWS (ECS, Fargate)
   ├─ Google Cloud (Cloud Run)
   ├─ Azure (Container Instances)
   └─ DigitalOcean (App Platform)
```

## 🎨 Color-Coded Priority

```
🔴 CRITICAL: Must read before starting
   • README.md
   • QUICKSTART.md
   • .env.example

🟡 IMPORTANT: Should read for production
   • DOCKER.md
   • EXAMPLES.md
   • ARCHITECTURE.md

🟢 OPTIONAL: Read when needed
   • CONTRIBUTING.md
   • CHANGELOG.md
   • PROJECT_SUMMARY.md
```

## 🚦 Status Indicators

```
Service Status:
✅ Running  → Server is up
⚠️  Warning → Check logs
❌ Error    → Service down
🔄 Updating → Schema refresh

Health Check:
GET /health
  ↓
{
  "status": "ok",          ✅
  "timestamp": "...",
  "service": "pve-openapi",
  "version": "2.0.0"
}
```

---

## 📞 Quick Reference

**Start Server**: `bun run dev`
**View Docs**: `http://localhost:3006/openapi`
**Health Check**: `http://localhost:3006/health`
**Update Schema**: `bun run update-schema`
**Deploy Docker**: `docker-compose up -d`

---

**Remember**: The Swagger UI is your interactive playground! 🎮
