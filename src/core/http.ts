import axios, { type AxiosRequestConfig } from 'axios'
import { setupInterceptors } from './interceptors'
import type { ApiResponse, PageResult } from '@/types'

export interface StreamRequestOptions {
  onChunk?: (chunk: string) => void
  onComplete?: () => void
  onError?: (err: Error) => void
  typewriter?: {
    speed?: number
    onType: (char: string, fullText: string) => void
  }
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000
})

setupInterceptors(http)

// 普通请求
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const res = await http.request<ApiResponse<T>>(config)
  return res.data.data
}

// 分页请求
export async function requestPage<T>(config: AxiosRequestConfig): Promise<PageResult<T>> {
  const res = await http.request<PageResult<T>>(config)
  return res.data
}

// ====================== 流式请求（完美适配你的后端） ======================
export function requestStream(config: AxiosRequestConfig, options: StreamRequestOptions) {
  // 拼接完整 URL（baseURL + url）
  const baseURL = import.meta.env.VITE_API_BASE_URL || ''
  const fullUrl = baseURL + config.url!
  
  const xhr = new XMLHttpRequest()
  xhr.open(config.method || 'POST', fullUrl)
  xhr.timeout = 0

  // 请求头
  xhr.setRequestHeader('Content-Type', 'application/json')
  
  // 添加 Token（如果需要）
  const token = localStorage.getItem('token')
  if (token) {
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
  }
  
  if (config.headers) {
    Object.entries(config.headers).forEach(([k, v]) => {
      xhr.setRequestHeader(k, v as string)
    })
  }

  let buffer = ''
  let typeText = ''
  let timer: any = null

  function startTypewriter() {
    if (timer) return
    timer = setInterval(() => {
      if (typeText.length <= 0) {
        clearInterval(timer)
        timer = null
        options.onComplete?.()
        return
      }
      const char = typeText[0]
      typeText = typeText.slice(1)
      buffer += char
      options.typewriter!.onType(char, buffer)
    }, options.typewriter?.speed || 50)
  }

  // 实时接收 SSE 流
  let lastLength = 0
  xhr.onprogress = function () {
    // 只处理新增的内容
    const text = xhr.responseText.substring(lastLength)
    lastLength = xhr.responseText.length
    
    const lines = text.split('\n')

    for (const line of lines) {
      const trim = line.trim()
      if (!trim) continue

      try {
        if (trim.startsWith('data: ')) {
          const json = JSON.parse(trim.replace('data: ', ''))
          const content = json.content || ''
          const done = json.done

          if (content) {
            if (options.typewriter) {
              typeText += content
              startTypewriter()
            } else {
              buffer += content
              options.onChunk?.(buffer)
            }
          }

          if (done === true) {
            if (!timer) options.onComplete?.()
          }
        }
      } catch (e) {}
    }
  }

  xhr.onerror = function () {
    clearInterval(timer)
    options.onError?.(new Error('网络异常'))
  }
  
  xhr.onload = function () {
    if (xhr.status >= 400) {
      clearInterval(timer)
      options.onError?.(new Error(`请求失败: ${xhr.status}`))
    }
  }

  xhr.send(JSON.stringify(config.data))
}

export default http
