# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-07

### Added
- Complete project documentation (README.md)
- Environment configuration example (.env.example)
- Contributing guidelines (CONTRIBUTING.md)
- API usage examples (EXAMPLES.md)
- Docker support (Dockerfile, docker-compose.yml, DOCKER.md)
- MIT License
- Schema fetching and conversion scripts
- Enhanced .gitignore with comprehensive exclusions

### Changed
- Updated package.json with new scripts and metadata
- Improved .gitignore to exclude .env and IDE files

### Features
- Auto-generated OpenAPI routes from Proxmox schema
- Interactive Swagger UI documentation
- Type-safe request/response handling with Zod
- Automatic boolean conversion (0/1 to true/false)
- Support for all HTTP methods (GET, POST, PUT, DELETE)
- Path parameter extraction and validation
- Environment variable validation
- HTTP request/response logging
- Initial project structure
- Proxmox VE API schema integration
- Elysia web framework setup
- OpenAPI documentation generation
- HTTP client with Axios
- Type conversion utilities
- Environment configuration with Zod validation
