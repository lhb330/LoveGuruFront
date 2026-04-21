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
