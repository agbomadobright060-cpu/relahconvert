import { injectHeader } from './core/header.js'
import { supabase, getUser, signOut } from './core/supabase.js'
import { signInWithGoogle, showSignInModal } from './core/auth-ui.js'
import { getT } from './core/i18n.js'

const t = getT()
const app = document.querySelector('#app')

const L = {
  my_account: t.auth_my_account || 'My Account',
  my_files: t.auth_my_files || 'My Files',
  sign_in: t.auth_sign_in || 'Sign in',
  sign_out: t.auth_sign_out || 'Sign out',
  saved_files: t.account_saved_files || 'Saved Files',
  no_files: t.account_no_files || 'No saved files yet. Use any tool and click "Save to Account" after processing.',
  storage: t.account_storage || 'Storage',
  sign_in_prompt_title: t.account_sign_in_title || 'Sign in to view your account',
  sign_in_prompt_desc: t.account_sign_in_desc || 'Sign in to save processed images and sync preferences across devices.',
  download: t.download || 'Download',
  delete_btn: t.account_delete || 'Delete',
}

document.body.style.cssText = 'margin:0;padding:0;min-height:100vh;background:var(--bg-page);'
const style = document.createElement('style')
style.textContent = `
  .account-wrap{max-width:700px;margin:32px auto;padding:0 16px 60px;font-family:'DM Sans',sans-serif;}
  .account-title{font-family:'Fraunces',serif;font-size:clamp(24px,4vw,36px);font-weight:400;color:var(--text-primary);margin:0 0 24px;line-height:1;letter-spacing:-0.02em;}
  .account-card{background:var(--bg-card);border-radius:14px;padding:24px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);}
  .account-card h2{font-family:'Fraunces',serif;font-size:18px;font-weight:700;color:var(--text-primary);margin:0 0 16px;}
  .user-info{display:flex;align-items:center;gap:16px;margin-bottom:16px;}
  .user-avatar{width:56px;height:56px;border-radius:50%;object-fit:cover;}
  .user-avatar-placeholder{width:56px;height:56px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;font-family:'DM Sans',sans-serif;}
  .user-name{font-size:18px;font-weight:700;color:var(--text-primary);}
  .user-email{font-size:13px;color:var(--text-muted);margin-top:2px;}
  .storage-bar{height:8px;background:var(--bg-surface);border-radius:8px;overflow:hidden;margin:8px 0;}
  .storage-fill{height:100%;background:var(--accent);border-radius:8px;transition:width 0.3s;}
  .storage-text{font-size:12px;color:var(--text-muted);}
  .files-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;}
  .file-card{background:var(--bg-surface);border-radius:10px;overflow:hidden;position:relative;}
  .file-card img{width:100%;height:100px;object-fit:cover;display:block;}
  .file-card .file-info{padding:8px 10px;}
  .file-card .file-name{font-size:11px;font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .file-card .file-meta{font-size:10px;color:var(--text-muted);margin-top:2px;}
  .file-card .file-actions{display:flex;gap:6px;margin-top:6px;}
  .file-card .file-btn{flex:1;padding:5px;border:none;border-radius:6px;font-size:10px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;text-align:center;}
  .file-btn.dl{background:var(--accent);color:var(--text-on-accent);}
  .file-btn.del{background:var(--bg-card);color:var(--text-muted);border:1px solid var(--border-light);}
  .file-btn.del:hover{color:#dc3232;border-color:#dc3232;}
  .empty-state{text-align:center;padding:40px 20px;color:var(--text-muted);font-size:14px;}
  .sign-in-prompt{text-align:center;padding:60px 20px;}
  .sign-in-prompt h2{font-family:'Fraunces',serif;font-size:24px;color:var(--text-primary);margin:0 0 12px;}
  .sign-in-prompt p{color:var(--text-muted);font-size:14px;margin:0 0 20px;}
  .sign-in-prompt button{padding:12px 32px;border:none;border-radius:10px;background:var(--accent);color:var(--text-on-accent);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:700;cursor:pointer;}
`
document.head.appendChild(style)

injectHeader()

const MAX_STORAGE_MB = 50

async function renderAccount() {
  const user = await getUser()

  if (!user) {
    app.innerHTML = `
      <div class="account-wrap">
        <div class="sign-in-prompt">
          <h2>${L.sign_in_prompt_title}</h2>
          <p>${L.sign_in_prompt_desc}</p>
          <button id="promptSignIn">${L.sign_in}</button>
        </div>
      </div>
    `
    document.getElementById('promptSignIn').addEventListener('click', () => {
      const { showSignInModal } = require('./core/auth-ui.js')
      showSignInModal()
    })
    return
  }

  const avatar = user.user_metadata?.avatar_url
  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const initial = name.charAt(0).toUpperCase()

  // Fetch saved files
  let files = []
  let totalSize = 0
  if (supabase) {
    const { data } = await supabase
      .from('saved_files')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    files = data || []
    totalSize = files.reduce((sum, f) => sum + (f.file_size || 0), 0)
  }

  const usedMB = (totalSize / (1024 * 1024)).toFixed(1)
  const pct = Math.min(100, (totalSize / (MAX_STORAGE_MB * 1024 * 1024)) * 100)

  app.innerHTML = `
    <div class="account-wrap">
      <h1 class="account-title">${L.my_account}</h1>

      <div class="account-card">
        <div class="user-info">
          ${avatar
            ? `<img class="user-avatar" src="${avatar}" referrerpolicy="no-referrer" />`
            : `<div class="user-avatar-placeholder">${initial}</div>`
          }
          <div>
            <div class="user-name">${name}</div>
            <div class="user-email">${user.email || ''}</div>
          </div>
        </div>
        <div class="storage-text">${L.storage}: ${usedMB} MB / ${MAX_STORAGE_MB} MB</div>
        <div class="storage-bar"><div class="storage-fill" style="width:${pct}%;"></div></div>
      </div>

      <div class="account-card">
        <h2>${L.saved_files}</h2>
        ${files.length === 0
          ? '<div class="empty-state">' + L.no_files + '</div>'
          : `<div class="files-grid">${files.map(f => `
              <div class="file-card" data-id="${f.id}" data-path="${f.storage_path}">
                <img src="" alt="${f.file_name}" data-path="${f.storage_path}" class="file-thumb" />
                <div class="file-info">
                  <div class="file-name" title="${f.file_name}">${f.file_name}</div>
                  <div class="file-meta">${(f.file_size / 1024).toFixed(0)} KB${f.tool_used ? ' · ' + f.tool_used : ''}</div>
                  <div class="file-actions">
                    <button class="file-btn dl" data-path="${f.storage_path}" data-name="${f.file_name}">${L.download}</button>
                    <button class="file-btn del" data-id="${f.id}" data-path="${f.storage_path}">${L.delete_btn}</button>
                  </div>
                </div>
              </div>
            `).join('')}</div>`
        }
      </div>
    </div>
  `

  // Load thumbnails
  document.querySelectorAll('.file-thumb').forEach(async (img) => {
    const path = img.dataset.path
    if (!supabase || !path) return
    const { data } = await supabase.storage.from('user-files').createSignedUrl(path, 300)
    if (data?.signedUrl) img.src = data.signedUrl
  })

  // Download buttons
  document.querySelectorAll('.file-btn.dl').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!supabase) return
      const { data } = await supabase.storage.from('user-files').createSignedUrl(btn.dataset.path, 60)
      if (data?.signedUrl) {
        const a = document.createElement('a')
        a.href = data.signedUrl
        a.download = btn.dataset.name
        a.click()
      }
    })
  })

  // Delete buttons
  document.querySelectorAll('.file-btn.del').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!supabase || !confirm('Delete this file?')) return
      btn.textContent = '...'
      await supabase.storage.from('user-files').remove([btn.dataset.path])
      await supabase.from('saved_files').delete().eq('id', btn.dataset.id)
      renderAccount()
    })
  })
}

renderAccount()
