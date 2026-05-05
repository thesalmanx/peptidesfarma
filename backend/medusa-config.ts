import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode: process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server",
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET!,
      cookieSecret: process.env.COOKIE_SECRET!,
    }
  },
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: backendUrl,
  },
  modules: [
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/fulfillment-manual",
            id: "manual",
          },
          {
            resolve: "./src/modules/fulfillment-shippo",
            id: "fulfillment-shippo",
            options: {
              api_key: process.env.SHIPPO_API_KEY!,
              from_name: process.env.SHIPPO_FROM_NAME || "Peptidesfarma",
              from_street: process.env.SHIPPO_FROM_STREET || "123 Commerce St",
              from_city: process.env.SHIPPO_FROM_CITY || "San Francisco",
              from_state: process.env.SHIPPO_FROM_STATE || "CA",
              from_zip: process.env.SHIPPO_FROM_ZIP || "94105",
              from_country: process.env.SHIPPO_FROM_COUNTRY || "US",
              from_email: process.env.SHIPPO_FROM_EMAIL || "orders@peptidesfarma.com",
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "./src/modules/notification-resend",
            id: "notification-resend",
            options: {
              channels: ["email"],
              api_key: process.env.RESEND_API_KEY!,
              from: process.env.RESEND_FROM_EMAIL || "contact@peptidesfarma.com",
            },
          },
        ],
      },
    },
    // Auth providers (Google + Apple)
    {
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
          },
          ...(process.env.GOOGLE_CLIENT_ID
            ? [
                {
                  resolve: "@medusajs/medusa/auth-google",
                  id: "google",
                  options: {
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
                  },
                },
              ]
            : []),
          ...(process.env.APPLE_CLIENT_ID
            ? [
                {
                  resolve: "./src/modules/auth-apple",
                  id: "apple",
                  options: {
                    clientId: process.env.APPLE_CLIENT_ID,
                    teamId: process.env.APPLE_TEAM_ID,
                    keyId: process.env.APPLE_KEY_ID,
                    privateKey: process.env.APPLE_PRIVATE_KEY,
                    callbackUrl: process.env.APPLE_CALLBACK_URL,
                  },
                },
              ]
            : []),
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          // Use DigitalOcean Spaces (S3-compatible) in production, local file in dev
          ...(process.env.SPACES_BUCKET
            ? [
                {
                  resolve: "@medusajs/medusa/file-s3",
                  id: "spaces",
                  options: {
                    file_url: process.env.SPACES_FILE_URL,
                    bucket: process.env.SPACES_BUCKET,
                    region: process.env.SPACES_REGION,
                    endpoint: process.env.SPACES_ENDPOINT,
                    access_key_id: process.env.SPACES_ACCESS_KEY_ID,
                    secret_access_key: process.env.SPACES_SECRET_ACCESS_KEY,
                    additional_client_config: {
                      forcePathStyle: true,
                    },
                  },
                },
              ]
            : [
                {
                  resolve: "@medusajs/medusa/file-local",
                  id: "local",
                  options: {
                    backend_url: `${backendUrl}/static`,
                  },
                },
              ]),
        ],
      },
    },
    // Redis event bus (replaces in-memory local event bus)
    ...(process.env.REDIS_URL
      ? [
          {
            resolve: "@medusajs/medusa/event-bus-redis",
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
          {
            resolve: "@medusajs/medusa/cache-redis",
            options: {
              redisUrl: process.env.REDIS_URL,
            },
          },
          {
            resolve: "@medusajs/medusa/workflow-engine-redis",
            options: {
              redis: {
                redisUrl: process.env.REDIS_URL,
              },
            },
          },
          {
            resolve: "@medusajs/medusa/locking",
            options: {
              providers: [
                {
                  id: "locking-redis",
                  resolve: "@medusajs/medusa/locking-redis",
                  is_default: true,
                  options: {
                    redisUrl: process.env.REDIS_URL,
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
})
