/**
 * Supabase client singleton + auth helpers.
 * Safe to import from any module — only initializes once.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null

/** Get current user (null if not signed in) */
export async function getUser() {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getUser()
    return data?.user || null
  } catch { return null }
}

/** Get current session */
export async function getSession() {
  if (!supabase) return null
  try {
    const { data } = await supabase.auth.getSession()
    return data?.session || null
  } catch { return null }
}

/** Sign in with Google (redirect flow) */
export function signInWithGoogle() {
  if (!supabase) return
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname }
  })
}

/** Sign in with email/password */
export function signInWithEmail(email, password) {
  if (!supabase) return Promise.reject(new Error('Not configured'))
  return supabase.auth.signInWithPassword({ email, password })
}

/** Sign up with email/password */
export function signUpWithEmail(email, password) {
  if (!supabase) return Promise.reject(new Error('Not configured'))
  return supabase.auth.signUp({ email, password })
}

/** Sign out */
export function signOut() {
  if (!supabase) return
  return supabase.auth.signOut()
}

/** Listen for auth state changes */
export function onAuthStateChange(callback) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }
  return supabase.auth.onAuthStateChange(callback)
}
