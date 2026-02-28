import { tools } from '../tools/configs.js'

export function getToolFromPath() {
  const path = window.location.pathname.replace('/', '').replace('.html', '')
  return tools[path] || null
}

export function getCurrentTool() {
  return getToolFromPath()
}