# Proxmox VE OpenAPI Documentation Generator

An auto-generated OpenAPI/openapi documentation server for Proxmox Virtual Environment API. This project automatically converts Proxmox VE's API schema into a fully-documented REST API with interactive OpenAPI documentation.

## � Quick Start

See **[QUICKSTART.md](QUICKSTART.md)** for a 5-minute setup guide!

## �📚 Documentation

- **[Quick Start](QUICKSTART.md)** - Get started in 5 minutes
- **[Examples](EXAMPLES.md)** - API usage examples and common requests
- **[Architecture](ARCHITECTURE.md)** - Technical architecture and design
- **[Contributing](CONTRIBUTING.md)** - Guidelines for contributing to the project
- **[Docker Deployment](DOCKER.md)** - Docker and Docker Compose setup
- **[Changelog](CHANGELOG.md)** - Version history and changes

## Features

- 🚀 **Auto-generated Routes**: Automatically generates all REST API routes from Proxmox VE schema
- 📚 **OpenAPI Documentation**: Complete interactive API documentation with Swagger UI
- 🔄 **Type Conversion**: Converts Proxmox API types to TypeScript/Zod schemas
- 🔌 **API Proxy**: Proxies requests to your actual Proxmox VE server
- ✅ **Type Safety**: Full TypeScript support with strict typing
- 🎯 **Smart Boolean Conversion**: Automatically converts Proxmox's 0/1 integers to proper JSON booleans

## Technology Stack

- **Runtime**: [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- **Framework**: [Elysia](https://elysiajs.com) - Fast and friendly TypeScript web framework
- **OpenAPI**: [@elysiajs/openapi](https://github.com/elysiajs/elysia-openapi) - OpenAPI documentation plugin
- **Validation**: [Zod](https://zod.dev) - TypeScript-first schema validation
- **HTTP Client**: [Axios](https://axios-http.com) - Promise-based HTTP client

## Prerequisites

- [Bun](https://bun.sh) installed on your system
- Proxmox VE server (version 7.0+)
- Proxmox API Token (for authentication)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pve-openapi
```

2. Install dependencies:
```bash
bun install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Edit `.env` and configure your Proxmox VE connection:
```env
PORT=3006
PVE_API_URL=https://your-proxmox-server:8006/api2/json
PVE_API_TOKEN=your-api-token-here
PVE_API_TOKEN_NAME=your-token-name
PVE_API_TOKEN_USER=root@pam
```

## Getting a Proxmox API Token

1. Log in to your Proxmox VE web interface
2. Navigate to **Datacenter** → **Permissions** → **API Tokens**
3. Click **Add** to create a new API token
4. Fill in the details:
   - **User**: Select your user (e.g., `root@pam`)
   - **Token ID**: Give it a name (e.g., `openapi`)
   - **Privilege Separation**: Uncheck if you want full permissions
5. Click **Add** and copy the token secret (you won't see it again!)
6. Use these values in your `.env` file:
   - `PVE_API_TOKEN_USER`: The user (e.g., `root@pam`)
   - `PVE_API_TOKEN_NAME`: The token ID (e.g., `openapi`)
   - `PVE_API_TOKEN`: The token secret

## Usage

### Development Mode

Run the server in watch mode (auto-restarts on file changes):

```bash
bun run dev
```

### Production Mode

Run the server normally:

```bash
bun run src/index.ts
```

The server will start on the port specified in your `.env` file (default: 3006).

### Docker Deployment

See **[DOCKER.md](DOCKER.md)** for Docker and Docker Compose deployment instructions.

Quick start with Docker Compose:
```bash
docker-compose up -d
```

## Accessing the Documentation

Once the server is running, you can access:

- **OpenAPI Documentation**: http://localhost:3006/openapi
- **OpenAPI JSON**: http://localhost:3006/openapi/json

## Project Structure

```
pve-openapi/
├── src/
│   ├── index.ts              # Main application entry point
│   ├── generate-routes.ts    # Route generation logic
│   └── libs/
│       ├── env.ts            # Environment configuration with Zod validation
│       ├── http.ts           # HTTP client and Proxmox API communication
│       ├── pve.ts            # Proxmox API schema (auto-generated)
│       ├── pve.d.ts          # TypeScript type definitions
│       └── schema-parser.ts  # Schema parsing and type conversion
├── .env                      # Environment variables (not in git)
├── .env.example             # Environment variables template
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## How It Works

1. **Schema Loading**: The Proxmox VE API schema is loaded from `pve.ts`
2. **Route Generation**: The schema parser recursively processes all endpoints and generates Elysia routes
3. **Type Conversion**: Proxmox parameter types are converted to Elysia/Zod type schemas
4. **Request Proxying**: API requests are proxied to the actual Proxmox server with proper authentication
5. **Response Processing**: Responses are processed to convert Proxmox-specific formats (e.g., 0/1 → boolean)
6. **Documentation**: OpenAPI documentation is automatically generated from the route schemas

## API Schema Generation

To update the Proxmox API schema, use the provided scripts:

```bash
# Fetch and convert schema in one command
bun run update-schema

# Or run steps individually
bun run fetch-schema      # Fetches schema.js from your Proxmox server
bun run convert-schema    # Converts schema.js to src/libs/pve.ts
```

Manual method:
```bash
curl -k https://your-proxmox:8006/api2/json \
  -H "Authorization: PVEAPIToken=USER@REALM!TOKENID=SECRET" \
  > schema.js
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3006` |
| `PVE_API_URL` | Proxmox API base URL | `https://pve.example.com:8006/api2/json` |
| `PVE_API_TOKEN` | Proxmox API token secret | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `PVE_API_TOKEN_NAME` | Proxmox API token ID | `openapi` |
| `PVE_API_TOKEN_USER` | Proxmox user with realm | `root@pam` |

## Development

### Adding New Features

The codebase is organized for easy extension:

- **HTTP Methods**: Extend `http.ts` to add new HTTP utilities
- **Type Conversion**: Modify `schema-parser.ts` to handle new Proxmox types
- **Response Processing**: Update `convertProxmoxBooleans()` in `http.ts` for custom data transformations

### Type Safety

The project uses strict TypeScript with:
- Path parameter type extraction
- Zod schema validation
- Proper error handling with typed responses

## Contributing

Contributions are welcome! Please ensure:
- TypeScript strict mode compliance
- Proper error handling
- Updated documentation for new features

## API Examples

See **[EXAMPLES.md](EXAMPLES.md)** for detailed API usage examples including:
- Common endpoint requests
- JavaScript/TypeScript integration
- Response formats
- Error handling

## License

MIT License - see [LICENSE](LICENSE) file for details

## Troubleshooting

### Connection Errors

If you get connection errors:
- Verify your Proxmox server is accessible
- Check that the API token has proper permissions
- Ensure SSL certificate issues are resolved (the code disables SSL verification by default)

### Schema Errors

If routes aren't generating correctly:
- Verify the `pve.ts` schema is valid
- Check console logs for parsing errors
- Ensure all required environment variables are set

## Acknowledgments

Built with:
- [Elysia](https://elysiajs.com) - The web framework
- [Bun](https://bun.sh) - The JavaScript runtime
- [Proxmox VE](https://www.proxmox.com/en/proxmox-ve) - The virtualization platform
