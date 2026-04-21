---
name: Vue3-TypeScript-Pinia-Vant4-h5-create
description: 生成基于 Vue3 + TypeScript + Pinia + Vant4 的聊天 H5 页面与功能模块，包含聊天气泡、消息发送、输入框、Pinia 状态管理、Axios 通用请求、SSE 流式响应、打字机效果、移动端自适应。支持普通接口调用与流式对话，自动处理 Token、请求拦截与异常提示，纯 Vant 组件无第三方 UI 依赖，代码可直接复制运行。当用户需要创建聊天页面、H5 对话、AI 问答、消息流式输出或使用 Vue3 + Vant4 技术栈时自动应用。
---
# Vue3 + TS + Pinia + Vant4 聊天H5生成器
## 技能文档（支持普通请求 / 流式 / 打字机效果）

---

## 技能基本信息
- 技能名称：Vue3 + TS + Pinia + Vant4 聊天H5生成器
- 技术栈：Vue3 + TypeScript + Pinia + Vant4 + Axios
- 适用场景：手机H5聊天、AI对话、消息流式输出
- 核心能力：聊天界面 + 流式请求 + 打字机效果 + 完整TS类型

---

# 一、src/core/http.ts（通用封装：普通+流式+打字机）
```typescript
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
```

# 二、src/core/interceptors.ts（纯 Vant 版本）
```typescript
import type { AxiosInstance } from 'axios'
import { showToast } from 'vant'
import { tokenUtils } from '@/core/auth/token'
import router from '@/router'
import type { ApiResponse } from '@/types'

export function setupInterceptors(http: AxiosInstance): void {
  // 请求拦截
  http.interceptors.request.use((config) => {
    const token = tokenUtils.getToken()
    if (token) {
      config.headers.satoken = token
    }
    if (config.responseType === 'stream') {
      config.headers.Accept = 'text/event-stream'
    }
    return config
  })

  // 响应拦截
  http.interceptors.response.use(
    (response) => {
      if (response.config.responseType === 'stream') {
        return response
      }

      const body = response.data as ApiResponse<unknown> & { message?: string }
      if (typeof body?.code === 'number' && body.code !== 0) {
        if (body.code === 40100) {
          showToast('未登录或登录已过期')
          tokenUtils.clearToken()
          if (router.currentRoute.value.path !== '/login') {
            router.replace('/login')
          }
          return Promise.reject(body)
        }
        showToast(body.msg || body.message || '请求失败')
        return Promise.reject(body)
      }
      return response
    },
    (error) => {
      showToast(error.message || '网络异常')
      return Promise.reject(error)
    }
  )
}
```
# 三、src/core/auth/token.ts（Token 管理）
```typescript
const TOKEN_KEY = 'auth_token'

export const tokenUtils = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  },
}
```

# 四、src/types/chat.ts
```typescript
export interface MessageItem {
  id: string | number
  conversation_id?: string | undefined
  message_type?: string
  role?: string
  content?: string
  user_content?: string
  create_time?: string
  sender?: 'me' | 'other'
  avatar?: string
}

// 后端发送消息接口返回的数据格式
export interface ChatResponse {
  conversation_id: string
  reply: string
  references?: Array<{
    doc_name: string
    content: string
    metadata: {
      title: string
      category: string
      filename: string
    }
  }]
}
```

# 五、src/types/index.ts
```typescript
export interface ApiResponse<T> {
  code: number
  data: T
  msg: string
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
```
# 六、src/stores/chatStore.ts
```typescript
import { defineStore } from 'pinia'
import type { MessageItem } from '@/types/chat'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messageList: [] as MessageItem[],
    inputText: '',
  }),
  actions: {
    addMessage(msg: MessageItem) {
      this.messageList.push(msg)
    },
    setInputText(text: string) {
      this.inputText = text
    },
    clearInput() {
      this.inputText = ''
    },
  },
})
```

# 七、src/api/chat.ts（API 接口层）
```typescript
import { request, requestStream, type StreamRequestOptions } from '@/core/http'
import type { MessageItem, ChatResponse } from '@/types/chat'

// 获取所有聊天历史
export function getAllChatHistory() {
  return request<MessageItem[]>({
    url: '/v1/chat/history/all',
    method: 'GET',
  })
}

// 获取分组聊天历史
export function getGroupedChatHistory() {
  return request<MessageItem[]>({
    url: '/v1/chat/history/grouped',
    method: 'GET',
  })
}

// 获取聊天历史
export function getChatHistory(convId: string) {
  return request<MessageItem[]>({
    url: `/v1/chat/history/${convId}`,
    method: 'GET',
  })
}

// 获取新对话ID
export function getNewConversationId() {
  return request<MessageItem>({
    url: '/v1/chat/new-conversation-id',
    method: 'GET',
  })
}

// 发送聊天消息
export function sendChatMessage(data: { conversation_id: string; message: string }) {
  return request<ChatResponse>({
    url: '/v1/chat/send',
    method: 'POST',
    data,
  })
}

// 发送聊天消息（流式）
export function sendChatStream(
  data: { conversation_id: string; message: string },
  options: StreamRequestOptions
) {
  return requestStream(
    {
      url: '/v1/chat/send-stream',
      method: 'POST',
      data,
    },
    options
  )
}
```

# 八、src/views/ChatPageSSE.vue（SSE 流式聊天页面）
> 完整代码见项目文件，核心特性：
- SSE 流式响应 + 打字机效果
- 对话历史加载与创建
- 仿微信聊天气泡样式
- 自动滚动到底部
- 输入框状态管理
- 路由参数支持 (`/chat-sse/:id?`)

# 九、使用示例
## 1. 普通请求
```typescript
import { request } from '@/core/http'
const data = await request({ url: '/user/info', method: 'GET' })
```

## 2. 流式请求
```typescript
import { requestStream } from '@/core/http'
requestStream(
  { url: '/api/stream', method: 'POST', data: { message: 'hi' } },
  { onChunk: (text) => console.log(text) }
)
```

## 3. 打字机效果（聊天专用）
```typescript
requestStream(
  { url: '/api/chat/stream', method: 'POST', data: { message: '你好' } },
  {
    typewriter: { speed: 40, onType: (c, f) => (reply.value += c) },
    onComplete: () => console.log('完成'),
  }
)
```

## 4. 使用 API 层封装
```typescript
import { sendChatStream, getChatHistory } from '@/api/chat'

// 发送流式消息
sendChatStream(
  { conversation_id: '123', message: '你好' },
  {
    typewriter: {
      speed: 40,
      onType: (char, fullText) => {
        replyText.value = fullText
      }
    },
    onComplete: () => {
      // 完成处理
    },
    onError: (error) => {
      console.error('请求失败', error)
    }
  }
)

// 获取聊天历史
const history = await getChatHistory('123')
```

# 十、技能规则
- 触发：聊天页面、H5对话、流式接口、打字机、SSE
- 技术栈：Vue3 + TS + Pinia + Vant4 + Axios + Vue Router
- 输出：
  - `src/core/http.ts` - HTTP 请求封装（普通+流式）
  - `src/core/interceptors.ts` - Axios 拦截器
  - `src/core/auth/token.ts` - Token 管理
  - `src/types/chat.ts` - 聊天相关类型定义
  - `src/types/index.ts` - 通用类型定义
  - `src/stores/chatStore.ts` - Pinia 状态管理
  - `src/api/chat.ts` - API 接口层
  - `src/views/ChatPageSSE.vue` - SSE 流式聊天页面
- 格式：可直接运行
- 特性：
  - SSE 流式响应
  - 打字机效果
  - 仿微信聊天气泡
  - 移动端自适应
  - 完整 TypeScript 类型
  - 对话历史管理
  - 路由参数支持
- 项目结构：
  ```
  src/
  ├── core/           # 核心模块
  │   ├── http.ts     # HTTP 请求封装
  │   ├── interceptors.ts  # 拦截器
  │   └── auth/
  │       └── token.ts     # Token 管理
  ├── api/            # API 接口层
  │   └── chat.ts
  ├── types/          # 类型定义
  │   ├── chat.ts
  │   └── index.ts
  ├── stores/         # Pinia 状态管理
  │   └── chatStore.ts
  ├── views/          # 页面组件
  │   └── ChatPageSSE.vue
  └── router/         # 路由配置
      └── index.ts
  ```