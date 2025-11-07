import { Elysia } from "elysia";
import env from "./libs/env";
import openapi from "@elysiajs/openapi";
import {
  generateAllRoutes,
  getAllTags,
  getAllTagGroups,
} from "./generate-routes";

// Generate all routes from PVE schema
const pveRoutes = generateAllRoutes();
const tags = getAllTags();
const tagGroups = getAllTagGroups();

const app = new Elysia()
  .use(
    openapi({
      documentation: {
        info: {
          title: "Proxmox VE API Documentation",
          description:
            "Complete Proxmox Virtual Environment API with auto-generated OpenAPI documentation",
          version: "2.0.0",
        },
        tags,
        "x-tagGroups": tagGroups,
      } as any,
    }),
  )
  // Health check endpoint
  .get("/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "pve-openapi",
    version: "2.0.0",
  }), {
    detail: {
      description: "Health check endpoint",
      tags: ["System"],
    },
  })
  // Use PVE routes
  .use(pveRoutes);

app.listen(env.PORT, (ctx) =>
  console.log(
    `🚀 PVE OpenAPI Documentation running on http://localhost:${ctx.port}`,
  ),
);
