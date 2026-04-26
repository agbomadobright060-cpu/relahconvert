const BASE = 'https://relahconvert.com'

// Create context menu items when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  // Parent menu
  chrome.contextMenus.create({
    id: 'relahconvert',
    title: 'RelahConvert',
    contexts: ['image']
  })

  // Sub-menus for each tool
  const tools = [
    { id: 'compress', title: 'Compress Image' },
    { id: 'resize', title: 'Resize Image' },
    { id: 'crop', title: 'Crop Image' },
    { id: 'remove-background', title: 'Remove Background' },
    { id: 'jpg-to-png', title: 'Convert to PNG' },
    { id: 'png-to-jpg', title: 'Convert to JPG' },
    { id: 'jpg-to-webp', title: 'Convert to WebP' },
    { id: 'rotate', title: 'Rotate Image' },
    { id: 'flip', title: 'Flip Image' },
    { id: 'grayscale', title: 'Black & White' },
    { id: 'watermark', title: 'Add Watermark' },
    { id: 'round-corners', title: 'Round Corners' },
    { id: 'blur-face', title: 'Blur Face' },
    { id: 'pixelate-image', title: 'Pixelate Image' },
  ]

  tools.forEach(tool => {
    chrome.contextMenus.create({
      id: tool.id,
      parentId: 'relahconvert',
      title: tool.title,
      contexts: ['image']
    })
  })
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'relahconvert') return

  const imageUrl = info.srcUrl
  if (!imageUrl) return

  const toolUrl = `${BASE}/${info.menuItemId}?url=${encodeURIComponent(imageUrl)}`
  chrome.tabs.create({ url: toolUrl })
})
