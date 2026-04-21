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
