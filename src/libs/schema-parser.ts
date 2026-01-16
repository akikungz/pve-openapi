import { Elysia, t } from "elysia";
import { get_pve, other_http_methods } from "./http";

// Type definitions for PVE API Schema
export interface PVEParameter {
  description?: string;
  type?: string;
  optional?: number | boolean;
  default?: any;
  enum?: string[];
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  maxLength?: number;
  minLength?: number;
  typetext?: string;
  items?: PVEParameter;
  properties?: Record<string, PVEParameter>;
  additionalProperties?: number;
  anyOf?: PVEParameter[];
  oneOf?: PVEParameter[];
  allOf?: PVEParameter[];
}

export interface PVEMethodInfo {
  method: string;
  name: string;
  description?: string;
  allowtoken?: number;
  parameters?: {
    additionalProperties?: number;
    properties?: Record<string, PVEParameter>;
  };
  returns?: {
    type?: string;
    items?: any;
    properties?: Record<string, PVEParameter>;
    links?: any[];
  };
  permissions?: {
    description?: string;
    user?: string;
    check?: string[];
  };
  protected?: number;
  proxyto?: string;
}

export interface PVEEndpoint {
  path: string;
  text?: string;
  leaf?: number;
  info?: {
    GET?: PVEMethodInfo;
    POST?: PVEMethodInfo;
    PUT?: PVEMethodInfo;
    DELETE?: PVEMethodInfo;
    PATCH?: PVEMethodInfo;
  };
  children?: PVEEndpoint[];
}

// Convert PVE parameter type to Elysia/Zod type
export const convertPVETypeToElysiaType = (param: PVEParameter): any => {
  const isOptional = param.optional === 1 || param.optional === true;

  // Handle anyOf/oneOf types (union types)
  if (param.anyOf && param.anyOf.length > 0) {
    const types = param.anyOf.map((p) => convertPVETypeToElysiaType(p));
    let unionType = t.Union(types, {
      description: param.description,
      ...(param.default !== undefined && { default: param.default }),
    });
    return isOptional ? t.Optional(unionType) : unionType;
  }

  // Handle oneOf types (similar to anyOf)
  if (param.oneOf && param.oneOf.length > 0) {
    const types = param.oneOf.map((p) => convertPVETypeToElysiaType(p));
    let unionType = t.Union(types, {
      description: param.description,
      ...(param.default !== undefined && { default: param.default }),
    });
    return isOptional ? t.Optional(unionType) : unionType;
  }

  // Handle enum types
  if (param.enum && param.enum.length > 0) {
    const enumObj: Record<string, string> = {};
    param.enum.forEach((val) => {
      enumObj[val] = val;
    });

    let enumType = t.Enum(enumObj, {
      description: param.description,
      ...(param.default !== undefined && { default: param.default }),
    });

    // If optional, allow null values in enum fields
    if (isOptional) {
      return t.Optional(t.Union([enumType, t.Null()]));
    }

    return enumType;
  }

  // Handle different base types
  let baseType: any;

  switch (param.type) {
    case "boolean":
      baseType = t.Boolean({
        description: param.description,
        ...(param.default !== undefined && { default: param.default }),
      });
      break;

    case "integer":
    case "number":
      baseType = t.Number({
        description: param.description,
        ...(param.minimum !== undefined && { minimum: param.minimum }),
        ...(param.maximum !== undefined && { maximum: param.maximum }),
        ...(param.default !== undefined && { default: param.default }),
      });
      break;

    case "array":
      if (param.items) {
        const itemType = convertPVETypeToElysiaType(param.items);
        baseType = t.Array(itemType, {
          description: param.description,
        });
      } else {
        baseType = t.Array(t.Any(), {
          description: param.description,
        });
      }
      break;

    case "object":
      if (param.properties) {
        const props: Record<string, any> = {};
        Object.entries(param.properties).forEach(([key, value]) => {
          props[key] = convertPVETypeToElysiaType(value);
        });
        baseType = t.Object(props, {
          description: param.description,
        });
      } else {
        baseType = t.Record(t.String(), t.Any(), {
          description: param.description,
        });
      }
      break;

    case "null":
      baseType = t.Null();
      break;

    case "string":
    default:
      // Known standard formats that TypeBox supports
      const knownFormats = [
        "email",
        "uri",
        "url",
        "uuid",
        "date",
        "time",
        "date-time",
        "ipv4",
        "ipv6",
      ];
      const formatToUse =
        param.format && knownFormats.includes(param.format)
          ? param.format
          : undefined;

      baseType = t.String({
        description: param.description,
        ...(param.maxLength && { maxLength: param.maxLength }),
        ...(param.minLength && { minLength: param.minLength }),
        ...(param.pattern && { pattern: param.pattern }),
        ...(formatToUse && { format: formatToUse as any }),
        ...(param.default !== undefined && { default: param.default }),
      });
      break;
  }

  // Handle nullable types - wrap with Union of base type and Null
  // Check if the parameter can be null (common in Proxmox responses)
  const canBeNull = isOptional || param.type === "null";
  if (canBeNull && param.type !== "null") {
    baseType = t.Union([baseType, t.Null()]);
  }

  return isOptional ? t.Optional(baseType) : baseType;
};

// Convert PVE path to Elysia path format
export const convertPVEPath = (pvePath: string): string => {
  // Remove leading slash if exists, we'll add it in the prefix
  return pvePath.replace(/\{(\w+)\}/g, ":$1");
};

// Extract path parameter names from a path string
export const extractPathParams = (path: string): Set<string> => {
  const params = new Set<string>();
  const matches = path.match(/\{(\w+)\}/g);
  if (matches) {
    matches.forEach((match) => {
      const paramName = match.replace(/\{|\}/g, "");
      params.add(paramName);
    });
  }
  return params;
};

// Generate tag name from path
export const generateTagName = (path: string): string => {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return "root";

  // Remove parameter placeholders for tag generation
  const cleanParts = parts
    .map((p) => p.replace(/\{.*?\}/g, ""))
    .filter(Boolean);
  return cleanParts.join(".");
};

// Create Elysia route handler for a single endpoint
export const createRouteHandler = (app: any, endpoint: PVEEndpoint): any => {
  if (!endpoint.info) return app;

  // Use the full path from the endpoint (already includes everything)
  const elysiaPath = convertPVEPath(endpoint.path);
  const tag = generateTagName(endpoint.path);

  // Handle GET method
  if (endpoint.info.GET) {
    const method = endpoint.info.GET;

    app = app.get(
      elysiaPath,
      ({ params }: any) => {
        // Proxmox API doesn't use query parameters, only path params
        return get_pve(
          endpoint.path,
          params && Object.keys(params).length > 0 ? params : undefined,
        );
      },
      {
        detail: {
          description:
            method.description || `Get ${endpoint.text || endpoint.path}`,
          tags: [tag],
        },
        ...(method.returns &&
          method.returns.type !== "null" && {
            response: t.Object({
              data: convertPVETypeToElysiaType(method.returns as PVEParameter),
            }),
          }),
      },
    );
  }

  // Handle POST method
  if (endpoint.info.POST) {
    const method = endpoint.info.POST;
    const hasBody = method.parameters?.properties;
    const pathParams = extractPathParams(endpoint.path);

    app = app.post(
      elysiaPath,
      ({ params, body }: any) => {
        return other_http_methods(endpoint.path, "POST", params, body);
      },
      {
        detail: {
          description:
            method.description || `Create ${endpoint.text || endpoint.path}`,
          tags: [tag],
        },
        ...(hasBody && {
          body: t.Object(
            Object.entries(method.parameters!.properties!).reduce(
              (acc, [key, param]) => {
                // Skip path parameters - they should not be in body
                if (!pathParams.has(key)) {
                  acc[key] = convertPVETypeToElysiaType(param);
                }
                return acc;
              },
              {} as Record<string, any>,
            ),
          ),
        }),
        ...(method.returns &&
          method.returns.type !== "null" && {
            response: t.Object({
              data: convertPVETypeToElysiaType(method.returns as PVEParameter),
            }),
          }),
      },
    );
  }

  // Handle PUT method
  if (endpoint.info.PUT) {
    const method = endpoint.info.PUT;
    const hasBody = method.parameters?.properties;
    const pathParams = extractPathParams(endpoint.path);

    app = app.put(
      elysiaPath,
      ({ params, body }: any) => {
        return other_http_methods(endpoint.path, "PUT", params, body);
      },
      {
        detail: {
          description:
            method.description || `Update ${endpoint.text || endpoint.path}`,
          tags: [tag],
        },
        ...(hasBody && {
          body: t.Object(
            Object.entries(method.parameters!.properties!).reduce(
              (acc, [key, param]) => {
                // Skip path parameters - they should not be in body
                if (!pathParams.has(key)) {
                  acc[key] = convertPVETypeToElysiaType(param);
                }
                return acc;
              },
              {} as Record<string, any>,
            ),
          ),
        }),
        ...(method.returns &&
          method.returns.type !== "null" && {
            response: t.Object({
              data: convertPVETypeToElysiaType(method.returns as PVEParameter),
            }),
          }),
      },
    );
  }

  // Handle DELETE method
  if (endpoint.info.DELETE) {
    const method = endpoint.info.DELETE;
    const hasParams = method.parameters?.properties;
    const pathParams = extractPathParams(endpoint.path);

    app = app.delete(
      elysiaPath,
      ({ params, query }: any) => {
        const allParams = { ...params, ...query };
        return other_http_methods(
          endpoint.path,
          "DELETE",
          allParams,
          undefined,
        );
      },
      {
        detail: {
          description:
            method.description || `Delete ${endpoint.text || endpoint.path}`,
          tags: [tag],
        },
        ...(hasParams && {
          query: t.Object(
            Object.entries(method.parameters!.properties!).reduce(
              (acc, [key, param]) => {
                // Skip path parameters - they should not be in query
                if (!pathParams.has(key)) {
                  acc[key] = convertPVETypeToElysiaType(param);
                }
                return acc;
              },
              {} as Record<string, any>,
            ),
          ),
        }),
      },
    );
  }

  return app;
};

// Recursively process all endpoints
export const processEndpoints = (
  endpoints: PVEEndpoint[],
  basePath: string = "",
): any => {
  let app: any = new Elysia({ prefix: basePath });

  endpoints.forEach((endpoint) => {
    // Create routes for this endpoint
    app = createRouteHandler(app, endpoint);

    // Process children recursively (don't pass endpoint.path as basePath)
    if (endpoint.children && endpoint.children.length > 0) {
      const children = processEndpoints(endpoint.children, "");
      app = app.use(children);
    }
  });

  return app;
};

// Generate all tags from schema for OpenAPI documentation
export const generateTags = (endpoints: PVEEndpoint[]): any[] => {
  const tags = new Set<string>();

  const extractTags = (eps: PVEEndpoint[]) => {
    eps.forEach((ep) => {
      if (ep.path) {
        tags.add(generateTagName(ep.path));
      }
      if (ep.children) {
        extractTags(ep.children);
      }
    });
  };

  extractTags(endpoints);

  return Array.from(tags).map((tag) => ({
    name: tag,
    description: `${tag} endpoints`,
  }));
};

// Generate tag groups for better organization
export const generateTagGroups = (endpoints: PVEEndpoint[]): any[] => {
  const groups = new Map<string, Set<string>>();

  const extractGroups = (eps: PVEEndpoint[]) => {
    eps.forEach((ep) => {
      if (ep.path) {
        const parts = ep.path.split("/").filter(Boolean);
        if (parts.length > 0) {
          const topLevel = parts[0];
          if (!groups.has(topLevel)) {
            groups.set(topLevel, new Set());
          }
          groups.get(topLevel)!.add(generateTagName(ep.path));
        }
      }
      if (ep.children) {
        extractGroups(ep.children);
      }
    });
  };

  extractGroups(endpoints);

  return Array.from(groups.entries()).map(([name, tags]) => ({
    name,
    tags: Array.from(tags),
  }));
};
