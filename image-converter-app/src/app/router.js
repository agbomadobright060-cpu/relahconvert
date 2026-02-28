import { tools } from '../tools/configs.js'

export function getCurrentTool() {
  const path = window.location.pathname.replace(/^\/|\/$/g, '')
  return tools[path] || null
}