# Project Architecture

## Overview

The Proxmox VE OpenAPI project is a TypeScript-based API documentation server that automatically generates OpenAPI/openapi documentation from the Proxmox Virtual Environment API schema. It acts as a proxy and documentation layer between clients and the Proxmox server.

## Architecture Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────┐
│    PVE OpenAPI Server (Elysia)  │
│  ┌───────────────────────────┐  │
│  │  OpenAPI Documentation     │  │
│  │  (Swagger UI)              │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  Auto-generated Routes     │  │
│  │  (from PVE Schema)         │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  Type Conversion Layer     │  │
│  │  (Proxmox → Zod/TypeBox)   │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  HTTP Client (Axios)       │  │
│  └───────────────────────────┘  │
└──────────────┬──────────────────┘
               │ Proxied Request
               │ (with API Token)
               ▼
┌─────────────────────────────────┐
│   Proxmox VE Server             │
│   (API endpoint)                │
└─────────────────────────────────┘
```

## Directory Structure

```
pve-openapi/
├── src/
│   ├── index.ts                 # Main application entry point
│   ├── generate-routes.ts       # Route generation orchestration
│   └── libs/
│       ├── env.ts              # Environment configuration & validation
│       ├── http.ts             # HTTP client & request handling
│       ├── pve.ts              # Proxmox API schema (60k+ lines)
│       ├── pve.d.ts            # TypeScript type definitions
│       └── schema-parser.ts    # Schema parsing & type conversion
├── scripts/
│   ├── fetch-schema.sh         # Bash script to fetch schema from Proxmox
│   └── convert-schema.ts       # Convert JSON schema to TypeScript
├── .env                        # Environment variables (not in git)
├── .env.example               # Environment template
├── Dockerfile                 # Docker container definition
├── docker-compose.yml         # Docker Compose configuration
└── [documentation files]
```

## Core Components

### 1. Entry Point (`index.ts`)

**Responsibilities:**
- Initialize Elysia server
- Configure OpenAPI plugin
- Generate routes from schema
- Register health check endpoint
- Start HTTP server

**Key Features:**
- Automatic route generation
- OpenAPI documentation setup
- Tag organization for better navigation

### 2. Route Generator (`generate-routes.ts`)

**Responsibilities:**
- Process Proxmox API schema
- Generate Elysia routes
- Create tag hierarchy
- Organize endpoints by category

**Functions:**
- `generateAllRoutes()` - Main route generation
- `getAllTags()` - Extract endpoint tags
- `getAllTagGroups()` - Group tags by category

### 3. Schema Parser (`libs/schema-parser.ts`)

**Responsibilities:**
- Parse Proxmox API schema structure
- Convert Proxmox types to TypeBox/Zod types
- Generate route handlers
- Create OpenAPI metadata

**Key Functions:**
- `convertPVETypeToElysiaType()` - Type conversion
- `createRouteHandler()` - Generate HTTP handlers
- `processEndpoints()` - Recursive endpoint processing
- `generateTagName()` - Create semantic tag names

**Type Conversions:**
```
Proxmox Type    →  TypeBox/Zod Type
----------------------------------------
boolean         →  t.Boolean()
integer/number  →  t.Number()
string          →  t.String()
array           →  t.Array()
object          →  t.Object()
enum            →  t.Enum()
```

### 4. HTTP Client (`libs/http.ts`)

**Responsibilities:**
- Communicate with Proxmox API
- Handle authentication
- Process responses
- Convert boolean values (0/1 → true/false)
- Error handling

**Key Functions:**
- `get_pve()` - GET requests
- `other_http_methods()` - POST/PUT/DELETE requests
- `replace_params()` - Path parameter substitution
- `convertProxmoxBooleans()` - Response transformation

**Features:**
- SSL verification disabled (self-signed certs)
- Request/response logging
- Automatic error handling
- Status code preservation

### 5. Environment Configuration (`libs/env.ts`)

**Responsibilities:**
- Load environment variables
- Validate configuration
- Provide type-safe config access

**Validation:**
Uses Zod schema to ensure:
- PORT is a valid number
- PVE_API_URL is a valid URL
- All required tokens are present

### 6. API Schema (`libs/pve.ts`)

**Characteristics:**
- 60,633 lines of auto-generated schema
- Describes all Proxmox API endpoints
- Includes parameter definitions
- Contains return types
- Specifies permissions

**Structure:**
```typescript
{
  path: "/cluster/replication/{id}",
  info: {
    GET: { method, parameters, returns, permissions },
    POST: { ... },
    PUT: { ... },
    DELETE: { ... }
  },
  children: [ ... ]
}
```

## Data Flow

### Request Flow (GET)

1. **Client Request** → `GET /api2/json/nodes/pve/qemu`
2. **Elysia Router** → Matches route pattern
3. **Route Handler** → Extracts parameters
4. **HTTP Client** → Calls Proxmox API
5. **Response Processing** → Convert 0/1 to boolean
6. **Client Response** → Return JSON data

### Request Flow (POST/PUT/DELETE)

1. **Client Request** → `POST /api2/json/nodes/pve/qemu`
2. **Body Validation** → Zod schema validation
3. **Route Handler** → Extracts params & body
4. **HTTP Client** → Proxy to Proxmox
5. **Response Processing** → Convert & return

## Type System

### Type Safety Layers

1. **Environment Types** (Zod)
   - Runtime validation
   - TypeScript inference

2. **API Parameter Types** (TypeBox)
   - Request validation
   - OpenAPI schema generation
   - Auto-completion support

3. **Response Types** (TypeScript)
   - Type-safe responses
   - Compile-time checking

## Performance Considerations

### Route Generation
- Executed once at startup
- Recursive processing of schema tree
- O(n) complexity where n = number of endpoints

### Request Handling
- Direct proxy to Proxmox
- Minimal overhead (type conversion only)
- Async/await for non-blocking I/O

### Memory Usage
- Large schema kept in memory (~60k lines)
- Efficient with Bun's performance optimizations

## Security

### Authentication
- Uses Proxmox API tokens
- Token stored in environment variables
- Passed via Authorization header

### HTTPS
- SSL verification disabled by default
- Required for self-signed certificates
- Should use proper certs in production

### Input Validation
- Zod/TypeBox schema validation
- Path parameter sanitization
- Body content validation

## Error Handling

### Error Types

1. **Configuration Errors**
   - Missing environment variables
   - Invalid schema
   - Exit process immediately

2. **HTTP Errors**
   - Proxmox server unreachable
   - Authentication failures
   - Return proper status codes

3. **Validation Errors**
   - Invalid request parameters
   - Schema mismatch
   - Return 400 Bad Request

## Extensibility

### Adding New Features

1. **Custom Endpoints**
   - Add routes in `index.ts`
   - Define schemas with TypeBox

2. **Response Transformations**
   - Modify `convertProxmoxBooleans()`
   - Add new conversion functions

3. **Authentication Methods**
   - Extend HTTP client
   - Add new auth headers

4. **Logging**
   - Already has request/response logging
   - Can add structured logging (pino, winston)

## Testing Strategies

### Unit Tests
- Test type conversions
- Validate schema parsing
- Check parameter extraction

### Integration Tests
- Test actual Proxmox communication
- Verify response transformations
- Check error handling

### End-to-End Tests
- Full request/response cycle
- OpenAPI schema validation
- Documentation accuracy

## Deployment Options

1. **Standalone Bun**
   - Direct execution
   - Systemd service
   - PM2 process manager

2. **Docker**
   - Single container
   - Docker Compose
   - Easy scaling

3. **Kubernetes**
   - Deployment manifests
   - Service exposure
   - ConfigMaps for env vars

## Monitoring

### Health Checks
- `/health` endpoint
- Returns service status
- Timestamp and version info

### Logging
- Request/response logging
- Error tracking
- HTTP status codes

### Metrics (Future)
- Request count
- Response times
- Error rates

## Future Enhancements

1. **Caching**
   - Cache Proxmox responses
   - Redis integration
   - TTL-based invalidation

2. **Rate Limiting**
   - Protect Proxmox server
   - Per-client limits
   - Token bucket algorithm

3. **Authentication**
   - API key management
   - User sessions
   - Role-based access

4. **WebSocket Support**
   - Real-time updates
   - Event streaming
   - VNC console proxy

5. **Multi-tenancy**
   - Multiple Proxmox clusters
   - Cluster selection
   - Unified API

## Best Practices

1. **Use environment variables** for all configuration
2. **Keep schema updated** regularly
3. **Monitor Proxmox connectivity**
4. **Use proper SSL certificates** in production
5. **Implement rate limiting** for production use
6. **Add comprehensive logging** for debugging
7. **Regular security updates** for dependencies
