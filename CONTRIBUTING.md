# Contributing to Proxmox VE OpenAPI

Thank you for your interest in contributing to this project! Here are some guidelines to help you get started.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/pve-openapi.git
   cd pve-openapi
   ```

2. **Install Dependencies**
   ```bash
   bun install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Proxmox credentials
   ```

4. **Run in Development Mode**
   ```bash
   bun run dev
   ```

## Code Style

- Use TypeScript strict mode
- Follow the existing code structure
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions focused and small

## Making Changes

### 1. Type Conversions

To add support for new Proxmox types, edit `src/libs/schema-parser.ts`:

```typescript
export const convertPVETypeToElysiaType = (param: PVEParameter): any => {
  // Add your type conversion logic here
}
```

### 2. HTTP Methods

To add new HTTP utilities, modify `src/libs/http.ts`:

```typescript
export const your_new_http_method = async (...) => {
  // Implementation
}
```

### 3. Response Processing

To customize response transformations, update `convertProxmoxBooleans()` in `src/libs/http.ts`.

## Testing

Before submitting a PR:

1. Test all major endpoints:
   - GET requests
   - POST requests with body
   - PUT/DELETE operations

2. Verify OpenAPI documentation loads:
   ```bash
   curl http://localhost:3006/openapi/json
   ```

3. Check for TypeScript errors:
   ```bash
   bun run --check src/index.ts
   ```

## Submitting Pull Requests

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request with:
   - Clear description of changes
   - Any related issue numbers
   - Screenshots if UI changes

## Code Review Process

- All PRs require review before merging
- Address any feedback promptly
- Keep PRs focused on a single feature/fix

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the code

Thank you for contributing! 🎉
