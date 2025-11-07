import { Elysia } from "elysia";
import { apiSchema } from "@/libs/pve";
import {
  processEndpoints,
  generateTags,
  generateTagGroups,
  type PVEEndpoint,
} from "@/libs/schema-parser";

// The API schema is an array with multiple top-level sections
// (cluster, nodes, storage, access, pools, version)

// Generate all routes from the schema
export const generateAllRoutes = (): Elysia => {
  if (!apiSchema || apiSchema.length === 0) {
    throw new Error("Invalid API schema: no entries found");
  }

  // Process all top-level sections (not just apiSchema[0])
  return processEndpoints(apiSchema as PVEEndpoint[], "/api2/json");
};

// Export tags and tag groups for OpenAPI documentation
export const getAllTags = () => {
  if (!apiSchema || apiSchema.length === 0) return [];
  return generateTags(apiSchema as PVEEndpoint[]);
};

export const getAllTagGroups = () => {
  if (!apiSchema || apiSchema.length === 0) return [];
  return generateTagGroups(apiSchema as PVEEndpoint[]);
};
