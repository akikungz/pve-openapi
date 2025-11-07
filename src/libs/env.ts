import z from "zod";

export const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)),
  PVE_API_URL: z.url(),
  PVE_API_TOKEN: z.string(),
  PVE_API_TOKEN_NAME: z.string(),
  PVE_API_TOKEN_USER: z.string(),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error(
    "❌ Invalid environment variables:",
    z.treeifyError(_env.error),
  );

  process.exit(1);
}

export const env = _env.data;

export type Env = z.infer<typeof envSchema>;

export default env;
