import { Provider } from '@supabase/supabase-js'

export type ExtendedProvider = Provider | 'steam'

declare module '@supabase/supabase-js' {
  interface AuthError {
    provider?: ExtendedProvider
  }
} 