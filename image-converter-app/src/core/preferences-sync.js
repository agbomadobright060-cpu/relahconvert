/**
 * Preferences sync — bidirectional sync between localStorage and Supabase.
 * Theme and language are saved to Supabase when user is signed in.
 * On sign-in, Supabase preferences override local ones.
 */
import { supabase, getUser } from './supabase.js'

let currentUserId = null

/** Initialize sync — call once after auth state is known */
export async function initPreferencesSync(user) {
  if (!supabase || !user) { currentUserId = null; return }
  currentUserId = user.id

  // Fetch preferences from Supabase
  const { data } = await supabase
    .from('user_preferences')
    .select('theme, language')
    .eq('user_id', user.id)
    .single()

  if (data) {
    // Apply Supabase preferences locally
    if (data.theme && data.theme !== localStorage.getItem('relahconvert-theme')) {
      localStorage.setItem('relahconvert-theme', data.theme)
      window.dispatchEvent(new CustomEvent('rc:apply-theme', { detail: data.theme }))
    }
    if (data.language && data.language !== localStorage.getItem('rc_lang')) {
      localStorage.setItem('rc_lang', data.language)
      // Language change requires reload
      window.location.reload()
    }
  } else {
    // First sign-in — upload current local preferences to Supabase
    const theme = localStorage.getItem('relahconvert-theme') || 'light'
    const language = localStorage.getItem('rc_lang') || 'en'
    await supabase.from('user_preferences').upsert({
      user_id: user.id,
      theme,
      language,
      updated_at: new Date().toISOString()
    })
  }
}

/** Push a preference change to Supabase (fire-and-forget) */
export function syncPreference(key, value) {
  if (!supabase || !currentUserId) return
  supabase.from('user_preferences').upsert({
    user_id: currentUserId,
    [key]: value,
    updated_at: new Date().toISOString()
  }).then(() => {}).catch(() => {})
}

/** Clear sync state on sign-out */
export function clearPreferencesSync() {
  currentUserId = null
}
