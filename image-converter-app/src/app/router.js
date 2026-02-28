import { tools } from '../tools/configs.js'

export function getCurrentTool() {
  const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '')
  return tools[path] || null
}