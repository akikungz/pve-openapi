import { PVEEndpoint } from "./schema-parser";

/**
 * Proxmox VE API Schema
 * Contains 6 top-level sections: cluster, nodes, storage, access, pools, version
 */
declare const apiSchema: PVEEndpoint[];
export { apiSchema };
