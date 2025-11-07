# Docker Deployment

## Using Docker

### Build the Image

```bash
docker build -t pve-openapi .
```

### Run the Container

```bash
docker run -d \
  --name pve-openapi \
  -p 3006:3006 \
  -e PORT=3006 \
  -e PVE_API_URL=https://your-proxmox:8006/api2/json \
  -e PVE_API_TOKEN=your-token \
  -e PVE_API_TOKEN_NAME=your-token-name \
  -e PVE_API_TOKEN_USER=root@pam \
  pve-openapi
```

### Using Environment File

1. Copy `.env.example` to `.env` and configure it
2. Run with env file:

```bash
docker run -d \
  --name pve-openapi \
  -p 3006:3006 \
  --env-file .env \
  pve-openapi
```

## Using Docker Compose

### Quick Start

1. Configure your `.env` file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

2. Start the service:
```bash
docker-compose up -d
```

3. View logs:
```bash
docker-compose logs -f
```

4. Stop the service:
```bash
docker-compose down
```

### Production Deployment

For production, you might want to add a reverse proxy (nginx/traefik) and use secrets management:

```yaml
version: '3.8'

services:
  pve-openapi:
    build: .
    ports:
      - "3006:3006"
    environment:
      - PORT=3006
      - PVE_API_URL=${PVE_API_URL}
      - PVE_API_TOKEN=${PVE_API_TOKEN}
      - PVE_API_TOKEN_NAME=${PVE_API_TOKEN_NAME}
      - PVE_API_TOKEN_USER=${PVE_API_TOKEN_USER}
    restart: always
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.pve-api.rule=Host(`api.yourdomain.com`)"

networks:
  proxy:
    external: true
```

## Container Management

### View Logs
```bash
docker logs pve-openapi
docker logs -f pve-openapi  # Follow logs
```

### Restart Container
```bash
docker restart pve-openapi
```

### Stop Container
```bash
docker stop pve-openapi
```

### Remove Container
```bash
docker rm pve-openapi
```

## Updating

1. Pull latest changes
2. Rebuild the image:
```bash
docker build -t pve-openapi .
```

3. Recreate the container:
```bash
docker-compose up -d --force-recreate
```

## Troubleshooting

### Check Container Status
```bash
docker ps -a | grep pve-openapi
```

### Enter Container Shell
```bash
docker exec -it pve-openapi sh
```

### Check Environment Variables
```bash
docker exec pve-openapi env
```
