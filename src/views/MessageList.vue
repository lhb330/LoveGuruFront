<template>
  <div class="message-list-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <van-loading type="spinner" size="24px" vertical>加载中...</van-loading>
    </div>
    
    <template v-else>
      <van-nav-bar
        title="历史对话"
        right-text="开启新对话"
        @click-right="onClickRight"
      />
      <!-- 消息列表 -->
      <div class="message-list">
        <div
          v-for="item in messageList"
          :key="item.id"
          class="message-item"
          @click="handleItemClick(item)"
        >
          <!-- 左侧图标 -->
          <div class="message-icon">
            <van-icon name="chat-o" size="24" color="#999" />
          </div>
        
          <!-- 消息内容 -->
          <div class="message-content">
            <div class="message-header">
              <div class="message-title">{{ item.user_content }}</div>
              <div class="message-time">{{ formatTime(item.create_time || '') }}</div>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="messageList.length === 0" class="empty-state">
          <van-empty description="暂无对话记录" />
        </div>
      </div>
    </template>

    <!-- 底部导航栏 -->
    <van-tabbar v-model="activeTab" active-color="#07c160" inactive-color="#c0c0c0">
      <van-tabbar-item name="chat" icon="chat">消息</van-tabbar-item>
      <van-tabbar-item name="me" icon="user-o">我</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getGroupedChatHistory } from '../api/chat'
import type { MessageItem } from '../types/chat'
import { showToast } from 'vant'

const router = useRouter()
const activeTab = ref('chat')
const loading = ref(false)

// 消息列表数据
const messageList = ref<MessageItem[]>([])

// 加载消息列表
const loadMessageList = async () => {
  try {
    loading.value = true
    const res = await getGroupedChatHistory()
    messageList.value = res || []
  } catch (error: any) {
    console.error('获取消息列表失败:', error)
    showToast(error?.message || '获取消息列表失败')
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadMessageList()
})

const onClickRight = () => {
  // 跳转到聊天详情页
  router.push(`/chat-sse`)
}

const handleItemClick = (item: MessageItem) => {
  console.log('点击消息:', item)
  // 跳转到聊天详情页
  router.push(`/chat-sse/${item.conversation_id}`)
}

// 格式化时间显示
const formatTime = (time: string) => {
  if (!time) return ''
  
  const date = new Date(time)
  const now = new Date()
  
  // 获取年月日
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  // 判断是否是今天
  const isToday = date.toDateString() === now.toDateString()
  
  if (isToday) {
    // 今天只显示时分
    return `${hours}:${minutes}`
  } else {
    // 不是今天显示年月日时分
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }
}
</script>

<style scoped lang="scss">
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 50px); // 减去底部导航栏高度
  background-color: #ededed;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 150px); // 减去导航栏和其他UI元素的高度
}

.message-list-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ededed;
  overflow: hidden;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  background-color: #ededed;
  padding-bottom: 50px;

  .message-item {
    display: flex;
    align-items: center;
    padding: 16px;
    background-color: #fff;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.2s;

    &:active {
      background-color: #f5f5f5;
    }

    .message-icon {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border-radius: 8px;
      margin-right: 12px;
    }

    .message-content {
      flex: 1;
      min-width: 0;

      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .message-title {
          font-size: 15px;
          font-weight: 400;
          color: #333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          margin-right: 12px;
        }

        .message-time {
          font-size: 12px;
          color: #999;
          flex-shrink: 0;
        }
      }
    }
  }
}

:deep(.van-tabbar) {
  border-top: 1px solid #e8e8e8;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
</style>
