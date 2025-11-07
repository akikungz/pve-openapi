# API Usage Examples

This document provides examples of how to use the Proxmox VE OpenAPI endpoints.

## Base URL

All endpoints are relative to: `http://localhost:3006/api2/json`

## Authentication

The API automatically handles authentication with your Proxmox server using the credentials configured in your `.env` file.

## Example Requests

### Get Cluster Status

```bash
curl http://localhost:3006/api2/json/cluster/status
```

Response:
```json
{
  "data": [
    {
      "name": "cluster-name",
      "type": "cluster",
      "version": 1,
      "quorate": true,
      "nodes": 3
    }
  ]
}
```

### List All Nodes

```bash
curl http://localhost:3006/api2/json/nodes
```

### Get Node Status

```bash
curl http://localhost:3006/api2/json/nodes/{node}
```

Replace `{node}` with your node name, e.g., `pve`:
```bash
curl http://localhost:3006/api2/json/nodes/pve
```

### List Virtual Machines on a Node

```bash
curl http://localhost:3006/api2/json/nodes/pve/qemu
```

### Get VM Status

```bash
curl http://localhost:3006/api2/json/nodes/pve/qemu/100
```

Replace `100` with your VM ID.

### List Storage

```bash
curl http://localhost:3006/api2/json/storage
```

### Create a VM (POST Request)

```bash
curl -X POST http://localhost:3006/api2/json/nodes/pve/qemu \
  -H "Content-Type: application/json" \
  -d '{
    "vmid": 999,
    "name": "test-vm",
    "memory": 2048,
    "cores": 2,
    "sockets": 1
  }'
```

### Update VM Configuration (PUT Request)

```bash
curl -X PUT http://localhost:3006/api2/json/nodes/pve/qemu/999/config \
  -H "Content-Type: application/json" \
  -d '{
    "memory": 4096,
    "cores": 4
  }'
```

### Delete a VM (DELETE Request)

```bash
curl -X DELETE http://localhost:3006/api2/json/nodes/pve/qemu/999
```

## Using with JavaScript/TypeScript

### Fetch API

```typescript
// Get cluster status
const response = await fetch('http://localhost:3006/api2/json/cluster/status');
const data = await response.json();
console.log(data);
```

### Axios

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3006/api2/json'
});

// List nodes
const nodes = await api.get('/nodes');
console.log(nodes.data);

// Create VM
const createVM = await api.post('/nodes/pve/qemu', {
  vmid: 999,
  name: 'test-vm',
  memory: 2048,
  cores: 2
});
```

## OpenAPI/openapi Documentation

For a complete, interactive API reference, visit:

**http://localhost:3006/openapi**

The Swagger UI provides:
- Complete endpoint listing
- Request/response schemas
- Try-it-out functionality
- Example values
- Parameter descriptions

## Response Format

All successful responses follow this format:

```json
{
  "data": <response_data>
}
```

Error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Boolean Values

Note: The API automatically converts Proxmox's 0/1 boolean values to proper JSON `true`/`false` values.

Proxmox returns:
```json
{ "enabled": 1, "disabled": 0 }
```

This API converts to:
```json
{ "enabled": true, "disabled": false }
```

## Common Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/version` | GET | Get API version |
| `/cluster/status` | GET | Get cluster status |
| `/nodes` | GET | List all nodes |
| `/nodes/{node}` | GET | Get node details |
| `/nodes/{node}/qemu` | GET | List VMs on node |
| `/nodes/{node}/qemu/{vmid}` | GET | Get VM details |
| `/nodes/{node}/qemu` | POST | Create new VM |
| `/nodes/{node}/qemu/{vmid}/config` | PUT | Update VM config |
| `/nodes/{node}/qemu/{vmid}` | DELETE | Delete VM |
| `/nodes/{node}/storage` | GET | List storage on node |
| `/storage` | GET | List all storage |
| `/access/users` | GET | List users |
| `/pools` | GET | List resource pools |

For a complete list of endpoints, check the Swagger documentation at `/openapi`.
