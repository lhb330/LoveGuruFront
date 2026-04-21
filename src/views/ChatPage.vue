<template>
  <div class="chat-page">
    <van-nav-bar 
      :title="conversationTitle" 
      left-text="返回" 
      left-arrow 
      @click-left="$router.back()" 
      right-text="新对话"
      @click-right="onClickRight"
      fixed 
      placeholder
    />

    <div class="message-container" ref="messageContainerRef">
      <div
        v-for="msg in messageList"
        :key="msg.id"
        class="message-item"
        :class="msg.sender === 'me' ? 'me' : 'other'"
      >
        <!-- 对方消息：头像在左，气泡在右 -->
        <template v-if="msg.sender === 'other'">
          <van-image 
            round
            fit="cover"
            :src="doubaoAvatar"
            width="36"
            height="36"
            class="avatar" 
          />
          <div class="bubble other">
            {{ msg.content }}
          </div>
        </template>
        
        <!-- 我的消息：气泡在左，头像在右 -->
        <template v-else>
          <div class="bubble me">
            {{ msg.content }}
          </div>
          <van-image 
            round
            fit="cover"
            width="36"
            height="36"
            :src="catAvatar"
            class="avatar"
          />
        </template>
      </div>

      <!-- 正在输入的AI回复 -->
      <div v-if="replyText" class="message-item other">
        <van-image
            round
            fit="cover"
            :src="doubaoAvatar"
            width="36"
            height="36"
            class="avatar" 
          />
        <div class="bubble other">
          {{ replyText }}
          <span v-if="isTyping" class="typing-indicator">...</span>
        </div>
      </div>
      
      <!-- 时间分隔线示例 -->
      <div v-if="messageList.length > 0" class="time-divider">
        {{ getCurrentTime() }}
      </div>
    </div>

    <div class="input-bar">
      <div class="input-wrapper">
        <van-field
          v-model="inputText"
          placeholder="请输入消息..."
          type="textarea"
          rows="1"
          autosize
          :border="false"
          @keyup.enter="sendMessage"
        />
      </div>
      <van-button 
        @click="sendMessage"
        :disabled="!hasInputText"
        :class="['send-btn', { 'active': hasInputText }]"
      >
        发送
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chatStore'
import { sendChatStream, getChatHistory, getNewConversationId, sendChatMessage } from '@/api/chat'
import type { MessageItem } from '@/types/chat'
import { showToast } from 'vant'
import doubaoAvatar from '@/assets/images/doubao_avatar.png'
import catAvatar from '@/assets/images/cat.jpeg'
import { mockReplies } from './mockData'

const route = useRoute()
const store = useChatStore()
const messageList = store.messageList
const inputText = ref<string>('')
const replyText = ref('')
const isTyping = ref(false)
const messageContainerRef = ref<HTMLElement | null>(null)
const loading = ref(false)
const hasInputText = ref(false)
const conversationId = ref<string>()

// 监听输入框文字变化
watch(inputText, (newValue, oldValue) => {
  hasInputText.value = newValue.trim().length > 0
})

// 对话标题
const conversationTitle = ref('聊天对话')

// 获取当前时间
const getCurrentTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainerRef.value) {
      messageContainerRef.value.scrollTop = messageContainerRef.value.scrollHeight
    }
  })
}

let mockReplyIndex = 0

// 模拟流式打字机效果
const simulateStreamReply = (userMessage: string) => {
  const reply = mockReplies[mockReplyIndex % mockReplies.length]
  mockReplyIndex++
  
  replyText.value = ''
  isTyping.value = true
  
  let charIndex = 0
  const typeSpeed = 50
  
  const typeInterval = setInterval(() => {
    if (charIndex < reply.length) {
      replyText.value += reply[charIndex]
      charIndex++
      scrollToBottom()
    } else {
      clearInterval(typeInterval)
      isTyping.value = false
      
      // 添加到消息列表
      store.addMessage({
        id: Date.now().toString(),
        content: reply,
        sender: 'other',
        avatar: '',
        create_time: new Date().toLocaleTimeString(),
      })
      replyText.value = ''
      scrollToBottom()
    }
  }, typeSpeed)
  inputText.value = ''
  hasInputText.value = false
}

const onClickRight = async () => {
  try {
    showToast('正在创建新对话...')
    const newConv = await getNewConversationId()
    
    // 清空当前消息列表
    messageList.length = 0
    replyText.value = ''
    isTyping.value = false
    conversationId.value = newConv.conversation_id

    conversationTitle.value = `对话 ${newConv.conversation_id}`
    
    showToast('新对话已创建')
  } catch (error: any) {
    console.error('创建新对话失败:', error)
    showToast(error?.message || '创建新对话失败')
  }
}

// 发送消息
const sendMessage = async () => {
  if (!inputText.value.trim()) return
  
  // 检查是否有对话ID
  if (!conversationId.value) {
    showToast('请先创建对话')
    return
  }
  
  const currentTime = new Date().toLocaleTimeString()
  const userMsg = inputText.value
  
  // 添加用户消息到列表
  store.addMessage({
    id: Date.now().toString(),
    conversation_id: conversationId.value,
    content: userMsg,
    sender: 'me',
    avatar: '',
    create_time: currentTime,
  })

  store.clearInput()
  replyText.value = ''
  scrollToBottom()

  // 调用后端接口发送消息
  try {
    isTyping.value = true
    
    // 使用普通请求获取回复
    const response = await sendChatMessage({ 
      conversation_id: conversationId.value, 
      message: userMsg 
    })
    
    // 提取 reply 字段
    const replyContent = response.reply || ''
    
    // 模拟流式打字机效果
    replyText.value = ''
    let charIndex = 0
    const typeSpeed = 40
    
    const typeInterval = setInterval(() => {
      if (charIndex < replyContent.length) {
        replyText.value += replyContent[charIndex]
        charIndex++
        scrollToBottom()
      } else {
        clearInterval(typeInterval)
        isTyping.value = false
        
        // 添加到消息列表
        store.addMessage({
          id: Date.now().toString(),
          conversation_id: conversationId.value,
          content: replyContent,
          sender: 'other',
          avatar: '',
          create_time: new Date().toLocaleTimeString(),
        })
        replyText.value = ''
        scrollToBottom()
      }
    }, typeSpeed)
    
  } catch (error: any) {
    console.error('发送消息失败:', error)
    isTyping.value = false
    showToast(error?.message || '发送消息失败')
  }
}

// 加载对话历史
const loadChatHistory = async (convId: string) => {
  try {
    loading.value = true
    conversationTitle.value = `对话 ${convId}`
    conversationId.value = convId
    const res = await getChatHistory(convId)
    
    // 清空现有消息
    messageList.length = 0
    
    // 将接口返回的数据转换为消息列表格式
    if (res && res.length > 0) {
      res.forEach((item: MessageItem) => {
        store.addMessage({
          id: item.id.toString(),
          content: item.content || '',
          sender: item.role === 'user' ? 'me' : 'other',
          avatar: item.avatar,
          create_time: item.create_time || '',
        })
      })
      scrollToBottom()
    }
  } catch (error: any) {
    console.error('获取对话历史失败:', error)
    showToast(error?.message || '获取对话历史失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时添加一些初始消息
onMounted(() => {
  // 获取路由参数中的对话ID
  const convId = route.params.id as string
  
  if (convId) {
    // 如果有对话ID，加载对话历史
    loadChatHistory(convId)
  }else {
    onClickRight()
  }
})
</script>

<style scoped>
.chat-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f2f2f7;
}

.message-container {
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.message-item {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
  gap: 10px;
}

.message-item.me {
  justify-content: flex-end;
}

.message-item .bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 18px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  line-height: 1.5;
  word-wrap: break-word;
  position: relative;
  flex-shrink: 0;
}

.message-item .avatar {
  flex-shrink: 0;
}

.message-item.me .bubble {
  background: #95ec69;
  color: #000;
}

.message-item.other .bubble {
  background: #ffffff;
  color: #333;
}

.typing-indicator {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.time-divider {
  text-align: center;
  margin: 16px 0;
  color: #999;
  font-size: 12px;
  position: relative;
}

.time-divider::before,
.time-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background: #e0e0e0;
}

.time-divider::before {
  left: 0;
}

.time-divider::after {
  right: 0;
}

.input-bar {
  display: flex;
  padding: 12px;
  background: #ffffff;
  align-items: center;
  gap: 8px;
  border-top: 1px solid #e0e0e0;
}

.input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
}

.input-bar :deep(.van-field) {
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 18px;
  flex: 1;
}

.input-bar :deep(.van-field__control) {
  min-height: 20px;
  max-height: 80px;
}

.voice-icon {
  color: #666;
  cursor: pointer;
}

.voice-icon:hover {
  color: #07c160;
}

.send-btn {
  height: 40px;
  padding: 0 20px;
  background: #e0e0e0;
  border: none;
  color: #999;
  font-weight: 500;
  font-size: 14px;
  border-radius: 6px;
  flex-shrink: 0;
}

.send-btn.active {
  background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
  color: #ffffff;
}

.send-btn:active {
  opacity: 0.8;
}
</style>
