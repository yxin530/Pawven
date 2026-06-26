/**
 * Application configuration constants.
 * Uses EXPO_PUBLIC_ environment variables where available, with fallback defaults.
 */

export const Config = {
  /** Base URL for all REST API requests */
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',

  /** Request timeout in milliseconds (30 seconds per Requirement 10.1) */
  API_TIMEOUT: 30000,

  /** MQTT broker connection URL for IoT feeder communication */
  MQTT_BROKER_URL:
    process.env.EXPO_PUBLIC_MQTT_BROKER_URL || 'mqtt://localhost:1883',

  /** MQTT client connection options */
  MQTT_OPTIONS: {
    keepalive: 60,
    clean: true,
  },

  /** Cloudinary cloud name for image uploads */
  CLOUDINARY_CLOUD_NAME:
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',

  /** Clerk publishable key for authentication */
  CLERK_PUBLISHABLE_KEY:
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder',

  /** Mapbox access token for map rendering */
  MAPBOX_ACCESS_TOKEN:
    process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || 'pk.placeholder',

  /** Stripe publishable key for payment processing */
  STRIPE_PUBLISHABLE_KEY:
    process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder',
} as const;

export type AppConfig = typeof Config;
