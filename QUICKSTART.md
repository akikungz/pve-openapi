# Quick Start Guide

Get up and running with Proxmox VE OpenAPI in 5 minutes!

## Prerequisites Checklist

- [ ] Bun installed ([download here](https://bun.sh))
- [ ] Access to a Proxmox VE server
- [ ] Proxmox API token created

## Step-by-Step Setup

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd pve-openapi

# Install dependencies
bun install
```

### 2. Configure Environment (1 minute)

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` with your editor:
```env
PORT=3006
PVE_API_URL=https://192.168.1.100:8006/api2/json  # Your Proxmox IP
PVE_API_TOKEN=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PVE_API_TOKEN_NAME=openapi
PVE_API_TOKEN_USER=root@pam
```

### 3. Start the Server (30 seconds)

```bash
bun run dev
```

You should see:
```
🚀 PVE OpenAPI Documentation running on http://localhost:3006
```

### 4. Access the Documentation (30 seconds)

Open your browser and go to:
**http://localhost:3006/openapi**

🎉 **You're done!** You now have a fully interactive Proxmox API documentation.

## Your First API Call

### Using curl

```bash
# Check health
curl http://localhost:3006/health

# List nodes
curl http://localhost:3006/api2/json/nodes

# Get cluster status
curl http://localhost:3006/api2/json/cluster/status
```

### Using Browser

Simply visit any endpoint in your browser:
- http://localhost:3006/api2/json/nodes
- http://localhost:3006/api2/json/version
- http://localhost:3006/api2/json/cluster/status

## Troubleshooting

### "Invalid environment variables"

Make sure your `.env` file has all required fields:
```env
PORT=3006
PVE_API_URL=https://your-proxmox-server:8006/api2/json
PVE_API_TOKEN=your-token-secret
PVE_API_TOKEN_NAME=your-token-name
PVE_API_TOKEN_USER=root@pam
```

### "Connection refused"

1. Check your Proxmox server is running
2. Verify the IP address and port
3. Ensure the API token is correct
4. Check firewall rules allow port 8006

### "401 Unauthorized"

1. Verify your API token is valid
2. Check token permissions in Proxmox
3. Ensure the token format is correct:
   - Token: Just the secret (UUID-like string)
   - Name: The token ID you created
   - User: Username with realm (e.g., `root@pam`)

## Next Steps

Now that you're up and running:

1. **Explore the API**
   - Browse endpoints in Swagger UI
   - Try the "Try it out" feature
   - See [EXAMPLES.md](EXAMPLES.md) for common requests

2. **Update the Schema**
   - Run `bun run update-schema` to fetch latest schema
   - Restart the server to apply changes

3. **Deploy to Production**
   - See [DOCKER.md](DOCKER.md) for Docker deployment
   - Use reverse proxy (nginx/traefik) for HTTPS
   - Set up monitoring and logging

4. **Customize**
   - Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the codebase
   - See [CONTRIBUTING.md](CONTRIBUTING.md) to add features

## Common Commands

```bash
# Development (auto-restart on changes)
bun run dev

# Production
bun run start

# Update Proxmox schema
bun run update-schema

# Run in Docker
docker-compose up -d

# View logs
docker-compose logs -f
```

## Getting Help

- **Documentation**: Check the other `.md` files
- **Examples**: See [EXAMPLES.md](EXAMPLES.md)
- **Issues**: Open a GitHub issue
- **Architecture**: Read [ARCHITECTURE.md](ARCHITECTURE.md)

## Quick Reference Card

| What | Where |
|------|-------|
| API Documentation | http://localhost:3006/openapi |
| OpenAPI JSON | http://localhost:3006/openapi/json |
| Health Check | http://localhost:3006/health |
| Example Requests | EXAMPLES.md |
| Configuration | .env file |
| Update Schema | `bun run update-schema` |

---

**Happy API documenting!** 🚀

If you found this useful, consider ⭐ starring the repository!
