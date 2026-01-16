import { Elysia } from "elysia";
import env from "./libs/env";
import openapi from "@elysiajs/openapi";
import {
  generateAllRoutes,
  getAllTags,
  getAllTagGroups,
} from "./generate-routes";
import { http_instance } from "./libs/http";

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
  .use(pveRoutes)
  .all("/proxy/*", async (ctx) => {
    const proxiedPath = ctx.path.replace("/proxy", "");

    const res = await http_instance.request({
      method: ctx.request.method,
      url: proxiedPath,
      data: ctx.body,
    });

    return ctx.status(res.status, res.data);
  }, {
    detail: {
      description: "Proxy endpoint to forward requests to Proxmox VE API with path after /proxy and target path after /api2/json",
      tags: ["Proxy"],
      hide: true,
    },
  });

app.listen(env.PORT, (ctx) =>
  console.log(
    `🚀 PVE OpenAPI Documentation running on http://localhost:${ctx.port}`,
  ),
);
