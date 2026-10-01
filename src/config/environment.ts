/**
 * Centralized environment configuration.
 * Provides type-safe access to environment variables.
 */

export type Environment = 'local' | 'development' | 'production'

export interface EnvironmentConfig {
  environment: Environment
  supabase: {
    url: string
    anonKey: string
    serviceRoleKey?: string
  }
  api: {
    // Edge Functions deployed from the companion kowabowa-backend repo.
    // Same Supabase project as `supabase.url` above, different codebase.
    functionsUrl: string
  }
}

export function getCurrentEnvironment(): Environment {
  const value = process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'development'
  if (value === 'local' || value === 'production') return value
  return 'development'
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const environment = getCurrentEnvironment()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
    )
  }

  const functionsUrl = process.env.NEXT_PUBLIC_FUNCTIONS_URL || `${supabaseUrl}/functions/v1`

  return {
    environment,
    supabase: {
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    api: {
      functionsUrl,
    },
  }
}

export const env = {
  get environment() {
    return getCurrentEnvironment()
  },
  get supabase() {
    return getEnvironmentConfig().supabase
  },
  get api() {
    return getEnvironmentConfig().api
  },
  get isDevelopment() {
    const current = getCurrentEnvironment()
    return current === 'local' || current === 'development'
  },
}

export default env
