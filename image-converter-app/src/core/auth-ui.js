/**
 * Auth UI components — sign-in button, user dropdown, sign-in modal.
 * Pure vanilla JS, no framework. Matches existing header.js patterns.
 */
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } from './supabase.js'
import { getT } from './i18n.js'

const t = getT()

// ── Auth i18n keys (fallbacks if not in i18n.js yet) ──
const L = {
  sign_in: t.auth_sign_in || 'Sign in',
  sign_up: t.auth_sign_up || 'Sign up',
  sign_out: t.auth_sign_out || 'Sign out',
  sign_in_google: t.auth_sign_in_google || 'Sign in with Google',
  email: t.auth_email || 'Email',
  password: t.auth_password || 'Password',
  my_account: t.auth_my_account || 'My Account',
  my_files: t.auth_my_files || 'My Files',
  or: t.auth_or || 'or',
  no_account: t.auth_no_account || "Don't have an account?",
  have_account: t.auth_have_account || 'Already have an account?',
}

// ── Sign-in button (shown when not authenticated) ──
export function createSignInButton(onClick) {
  const btn = document.createElement('button')
  btn.className = 'rc-auth-btn'
  btn.setAttribute('aria-label', L.sign_in)
  btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>${L.sign_in}</span>`
  btn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border:1.5px solid var(--border-light);border-radius:8px;background:var(--bg-card);color:var(--text-primary);font-family:"DM Sans",sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;white-space:nowrap;'
  btn.addEventListener('mouseenter', () => { btn.style.borderColor = 'var(--accent)'; btn.style.color = 'var(--accent)' })
  btn.addEventListener('mouseleave', () => { btn.style.borderColor = 'var(--border-light)'; btn.style.color = 'var(--text-primary)' })
  btn.addEventListener('click', onClick)
  return btn
}

// ── User dropdown (shown when authenticated) ──
export function createUserDropdown(user, onSignOut) {
  const wrap = document.createElement('div')
  wrap.style.cssText = 'position:relative;display:inline-flex;'

  const avatar = user.user_metadata?.avatar_url
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const initial = name.charAt(0).toUpperCase()

  const btn = document.createElement('button')
  btn.className = 'rc-user-btn'
  btn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border:1.5px solid var(--border-light);border-radius:8px;background:var(--bg-card);cursor:pointer;transition:all 0.15s;'
  btn.innerHTML = avatar
    ? `<img src="${avatar}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;" referrerpolicy="no-referrer" />`
    : `<div style="width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;font-family:'DM Sans',sans-serif;">${initial}</div>`
  btn.innerHTML += `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>`

  const menu = document.createElement('div')
  menu.style.cssText = 'display:none;position:absolute;top:100%;right:0;margin-top:6px;background:var(--bg-card);border:1.5px solid var(--border-light);border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.12);z-index:1000;min-width:180px;overflow:hidden;'

  // User info header
  const header = document.createElement('div')
  header.style.cssText = 'padding:12px 14px;border-bottom:1px solid var(--border-light);'
  header.innerHTML = `<div style="font-size:13px;font-weight:600;color:var(--text-primary);font-family:'DM Sans',sans-serif;">${name}</div><div style="font-size:11px;color:var(--text-muted);font-family:'DM Sans',sans-serif;margin-top:2px;">${user.email || ''}</div>`
  menu.appendChild(header)

  // Menu items
  const items = [
    { label: L.my_files, href: '/account', icon: '<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>' },
    { label: L.sign_out, action: 'signout', icon: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>' },
  ]

  items.forEach(item => {
    const a = document.createElement('a')
    a.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 14px;font-size:13px;font-weight:500;color:var(--text-primary);text-decoration:none;font-family:"DM Sans",sans-serif;cursor:pointer;transition:background 0.1s;'
    a.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${item.icon}</svg>${item.label}`
    a.addEventListener('mouseenter', () => { a.style.background = 'var(--bg-surface)' })
    a.addEventListener('mouseleave', () => { a.style.background = 'transparent' })
    if (item.action === 'signout') {
      a.addEventListener('click', () => { menu.style.display = 'none'; onSignOut() })
    } else if (item.href) {
      a.href = item.href
    }
    menu.appendChild(a)
  })

  btn.addEventListener('click', (e) => {
    e.stopPropagation()
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none'
  })
  document.addEventListener('click', () => { menu.style.display = 'none' })

  wrap.appendChild(btn)
  wrap.appendChild(menu)
  return wrap
}

// ── Sign-in modal ──
export function showSignInModal() {
  // Remove existing modal if any
  const existing = document.getElementById('rc-auth-modal')
  if (existing) existing.remove()

  let isSignUp = false

  const overlay = document.createElement('div')
  overlay.id = 'rc-auth-modal'
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;'

  const card = document.createElement('div')
  card.style.cssText = 'background:var(--bg-card);border-radius:16px;padding:32px 28px;max-width:380px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,0.2);position:relative;font-family:"DM Sans",sans-serif;'

  // Close button
  const close = document.createElement('button')
  close.style.cssText = 'position:absolute;top:12px;right:12px;background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:20px;line-height:1;padding:4px;'
  close.textContent = '×'
  close.addEventListener('click', () => overlay.remove())
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })

  // Title
  const title = document.createElement('h2')
  title.style.cssText = "font-family:'Fraunces',serif;font-size:22px;font-weight:700;color:var(--text-primary);margin:0 0 20px;text-align:center;"
  title.textContent = L.sign_in

  // Google button
  const googleBtn = document.createElement('button')
  googleBtn.style.cssText = 'width:100%;padding:12px;border:1.5px solid var(--border-light);border-radius:10px;background:var(--bg-card);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;font-family:"DM Sans",sans-serif;font-size:14px;font-weight:600;color:var(--text-primary);transition:all 0.15s;'
  googleBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>${L.sign_in_google}`
  googleBtn.addEventListener('mouseenter', () => { googleBtn.style.background = 'var(--bg-surface)' })
  googleBtn.addEventListener('mouseleave', () => { googleBtn.style.background = 'var(--bg-card)' })
  googleBtn.addEventListener('click', () => { signInWithGoogle() })

  // Divider
  const divider = document.createElement('div')
  divider.style.cssText = 'display:flex;align-items:center;gap:12px;margin:20px 0;color:var(--text-muted);font-size:12px;'
  divider.innerHTML = `<div style="flex:1;height:1px;background:var(--border-light);"></div>${L.or}<div style="flex:1;height:1px;background:var(--border-light);"></div>`

  // Email form
  const form = document.createElement('form')
  form.style.cssText = 'display:flex;flex-direction:column;gap:10px;'
  form.addEventListener('submit', e => e.preventDefault())

  const emailInput = document.createElement('input')
  emailInput.type = 'email'
  emailInput.placeholder = L.email
  emailInput.required = true
  emailInput.style.cssText = 'width:100%;padding:11px 14px;border:1.5px solid var(--border-light);border-radius:10px;font-size:14px;font-family:"DM Sans",sans-serif;color:var(--text-primary);background:var(--bg-surface);outline:none;box-sizing:border-box;'

  const passInput = document.createElement('input')
  passInput.type = 'password'
  passInput.placeholder = L.password
  passInput.required = true
  passInput.style.cssText = emailInput.style.cssText

  const errorMsg = document.createElement('div')
  errorMsg.style.cssText = 'font-size:12px;color:#dc3232;text-align:center;display:none;'

  const submitBtn = document.createElement('button')
  submitBtn.type = 'submit'
  submitBtn.style.cssText = 'width:100%;padding:12px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-family:"DM Sans",sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all 0.15s;'
  submitBtn.textContent = L.sign_in

  submitBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim()
    const pass = passInput.value
    if (!email || !pass) return
    submitBtn.disabled = true
    submitBtn.textContent = '...'
    errorMsg.style.display = 'none'
    try {
      const { error } = isSignUp
        ? await signUpWithEmail(email, pass)
        : await signInWithEmail(email, pass)
      if (error) throw error
      overlay.remove()
    } catch (err) {
      errorMsg.textContent = err.message || 'Something went wrong'
      errorMsg.style.display = 'block'
      submitBtn.disabled = false
      submitBtn.textContent = isSignUp ? L.sign_up : L.sign_in
    }
  })

  // Toggle sign in / sign up
  const toggle = document.createElement('div')
  toggle.style.cssText = 'text-align:center;margin-top:12px;font-size:12px;color:var(--text-muted);'
  const toggleLink = document.createElement('a')
  toggleLink.style.cssText = 'color:var(--accent);cursor:pointer;font-weight:600;text-decoration:none;margin-left:4px;'

  function updateMode() {
    title.textContent = isSignUp ? L.sign_up : L.sign_in
    submitBtn.textContent = isSignUp ? L.sign_up : L.sign_in
    toggle.childNodes[0].textContent = isSignUp ? L.have_account : L.no_account
    toggleLink.textContent = isSignUp ? L.sign_in : L.sign_up
  }

  toggleLink.addEventListener('click', () => { isSignUp = !isSignUp; updateMode() })
  toggle.appendChild(document.createTextNode(L.no_account))
  toggle.appendChild(toggleLink)
  updateMode()

  form.append(emailInput, passInput, errorMsg, submitBtn)
  card.append(close, title, googleBtn, divider, form, toggle)
  overlay.appendChild(card)
  document.body.appendChild(overlay)

  emailInput.focus()
}
