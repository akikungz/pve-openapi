#!/bin/bash

# Script to fetch Proxmox VE API schema
# Usage: ./scripts/fetch-schema.sh

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found. Please create it from .env.example"
    exit 1
fi

# Check required variables
if [ -z "$PVE_API_URL" ] || [ -z "$PVE_API_TOKEN" ] || [ -z "$PVE_API_TOKEN_NAME" ] || [ -z "$PVE_API_TOKEN_USER" ]; then
    echo "Error: Missing required environment variables"
    echo "Please ensure PVE_API_URL, PVE_API_TOKEN, PVE_API_TOKEN_NAME, and PVE_API_TOKEN_USER are set in .env"
    exit 1
fi

# Construct authorization header
AUTH_HEADER="PVEAPIToken=${PVE_API_TOKEN_USER}!${PVE_API_TOKEN_NAME}=${PVE_API_TOKEN}"

# Remove path from PVE_API_URL and construct the schema endpoint
BASE_URL=$(echo "$PVE_API_URL" | sed 's|/api2/json.*||')
SCHEMA_URL="${BASE_URL}/pve-docs/api-viewer/apidoc.js"

echo "Fetching Proxmox API schema from: $SCHEMA_URL"

# Fetch the schema (disable SSL verification with -k)
curl -k \
    -H "Authorization: $AUTH_HEADER" \
    "$SCHEMA_URL" \
    -o schema.js

if [ $? -eq 0 ]; then
    echo "✓ Schema successfully saved to schema.js"
    echo "  You can now convert this to TypeScript and update src/libs/pve.ts"
else
    echo "✗ Failed to fetch schema"
    exit 1
fi
