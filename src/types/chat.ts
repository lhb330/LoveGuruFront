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
  }>
}
