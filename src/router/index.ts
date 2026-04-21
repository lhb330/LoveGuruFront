import { createRouter, createWebHistory } from 'vue-router'
import ChatPage from '@/views/ChatPage.vue'
import ChatPageSSE from '@/views/ChatPageSSE.vue'
import MessageList from '@/views/MessageList.vue'

const routes = [
  {
    path: '/',
    redirect: '/message-list',
  },
  {
    path: '/message-list',
    name: 'MessageList',
    component: MessageList,
  },
  {
    path: '/chat/:id?',
    name: 'Chat',
    component: ChatPage,
  },
  {
    path: '/chat-sse/:id?',
    name: 'ChatSSE',
    component: ChatPageSSE,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
