import { Agent } from "node:https";
import axios from "axios";
import { status } from "elysia";

import env from "./env";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type ExtractParams<T extends string> = T extends
  | `${infer PartA}/:${infer Param}/${infer Next}`
  | `${infer PartA}/{${infer Param}}/${infer Next}`
  ? Record<Param, any> & ExtractParams<`/${Next}`>
  : T extends `${infer PartA}/:${infer Param}`
    ? Record<Param, any>
    : {};

export const http_instance = axios.create({
  baseURL: env.PVE_API_URL,
  headers: {
    Authorization: `PVEAPIToken=${env.PVE_API_TOKEN_USER}!${env.PVE_API_TOKEN_NAME}=${env.PVE_API_TOKEN}`,
  },
  httpsAgent: new Agent({
    rejectUnauthorized: false,
  }),
});

http_instance.interceptors.response.use(
  (response) => {
    console.log(
      `[HTTP] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`,
      response.data,
    );

    return response;
  },
  (error) => {
    console.error(
      `[HTTP] ${error.config.method?.toUpperCase()} ${error.config.url} - ${error.response?.status}`,
    );
    return Promise.reject(error);
  },
);

http_instance.interceptors.request.use((config) => {
  console.log(
    `[HTTP] ${config.method?.toUpperCase()} ${config.url} - Request initiated`,
  );
  return config;
});

// Convert Proxmox 0/1 integers to proper JSON booleans
export const convertProxmoxBooleans = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }

  // If it's an array, recursively convert each element
  if (Array.isArray(data)) {
    return data.map((item) => convertProxmoxBooleans(item));
  }

  // If it's an object, recursively convert each property
  if (typeof data === "object") {
    const converted: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Convert 0/1 to boolean when the value is exactly 0 or 1
      if ((value === 0 || value === 1) && typeof value === "number") {
        // Fields that should NOT be converted (these are actual numbers)
        const numericFields = [
          "vmid",
          "cpu",
          "cpus",
          "mem",
          "maxmem",
          "disk",
          "maxdisk",
          "netin",
          "netout",
          "diskread",
          "diskwrite",
          "uptime",
          "pid",
          "port",
          "node",
          "type",
          "used",
          "avail",
          "total",
          "size",
          "length",
          "count",
          "id",
          "uid",
          "gid",
          "level",
          "numnodes",
          "sockets",
          "cores",
          "threads",
          "shares",
          "balloon_min",
          "memhost",
          "freemem",
          "totalmem",
          "swap",
          "swapused",
          "swapfree",
        ];

        // Check if this field is definitely numeric
        const isNumericField = numericFields.some(
          (field) => key.toLowerCase() === field.toLowerCase(),
        );

        if (!isNumericField) {
          // Convert to boolean - most 0/1 values in Proxmox are booleans
          converted[key] = value === 1;
        } else {
          // Keep as number
          converted[key] = value;
        }
      } else {
        // Recursively process nested objects/arrays
        converted[key] = convertProxmoxBooleans(value);
      }
    }
    return converted;
  }

  // Return primitive values as-is
  return data;
};

export const replace_params = <
  Path extends string,
  Params extends ExtractParams<Path>,
>(
  path: Path,
  params: Params,
): string => {
  let replacedPath: string = path;
  Object.entries(params).forEach(([key, value]) => {
    // Support both :param (Elysia) and {param} (PVE) formats
    const colonPattern = new RegExp(`:${key}`, "g");
    const bracePattern = new RegExp(`\\{${key}\\}`, "g");
    replacedPath = replacedPath.replace(colonPattern, String(value));
    replacedPath = replacedPath.replace(bracePattern, String(value));
  });

  return replacedPath;
};

export const get_pve = async (
  url: string,
  params?: ExtractParams<typeof url>,
) => {
  const finalUrl = params ? replace_params(url, params) : url;

  try {
    const response = await http_instance.get(finalUrl);

    // Convert Proxmox 0/1 booleans to proper JSON booleans
    const convertedData = convertProxmoxBooleans(response.data);

    return status(response.status as any, convertedData as any);
  } catch (error) {
    if (error instanceof axios.AxiosError) {
      if (error.response) {
        return status(error.response.status as any, error.response.data as any);
      }

      return status(500 as any, {
        error: "Internal Server Error",
        message: error.message,
      });
    }

    if (error instanceof Error) {
      return status(500 as any, {
        error: "Internal Server Error",
        message: error.message,
      });
    }

    return status(500 as any, {
      error: "Internal Server Error",
      message: "An unknown error occurred",
    });
  }
};

export const other_http_methods = async <
  Path extends string,
  Params extends ExtractParams<Path>,
>(
  url: Path,
  method: HttpMethod,
  params?: Params,
  data?: any,
) => {
  const finalUrl = params ? replace_params(url, params) : url;

  try {
    const response = await http_instance.request({
      method,
      url: finalUrl,
      data,
    });

    // Convert Proxmox 0/1 booleans to proper JSON booleans
    const convertedData = convertProxmoxBooleans(response.data);

    return status(response.status as any, convertedData as any);
  } catch (error) {
    if (error instanceof axios.AxiosError) {
      if (error.response) {
        return status(error.response.status as any, error.response.data as any);
      }

      return status(500 as any, {
        error: "Internal Server Error",
        message: error.message,
      });
    }

    if (error instanceof Error) {
      return status(500 as any, {
        error: "Internal Server Error",
        message: error.message,
      });
    }

    return status(500 as any, {
      error: "Internal Server Error",
      message: "An unknown error occurred",
    });
  }
};
