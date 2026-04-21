# LoveGuruFront

基于 Vue3 + TypeScript + Pinia + Vant4 构建的移动端聊天 H5 应用，支持 SSE 流式响应和打字机效果。

## 📋 目录

- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [目录说明](#目录说明)
- [快速开始](#快速开始)
- [核心功能](#核心功能)
- [环境配置](#环境配置)
- [开发规范](#开发规范)
- [构建部署](#构建部署)

## 🛠 技术栈

- **框架**: Vue 3.4+ (Composition API)
- **语言**: TypeScript 5.3+
- **状态管理**: Pinia 2.1+
- **UI 组件库**: Vant 4.8+
- **HTTP 请求**: Axios 1.6+
- **路由**: Vue Router 4.3+
- **构建工具**: Vite 5.1+
- **代码规范**: ESLint + Prettier
- **CSS 预处理器**: Sass

## 📁 项目结构

```
LoveGuruFront/
├── .qoder/                          # Qoder AI 配置
│   └── skills/                      # AI 技能文件
│       └── Vue3-TypeScript-Pinia-Vant4-h5-create/
│           └── SKILL.md             # 聊天 H5 生成器技能文档
├── src/                             # 源代码目录
│   ├── api/                         # API 接口层
│   │   └── chat.ts                  # 聊天相关接口
│   ├── assets/                      # 静态资源
│   │   ├── icons/                   # 图标资源
│   │   └── images/                  # 图片资源
│   │       ├── cat.jpeg             # 用户头像
│   │       └── doubao_avatar.png    # AI 头像
│   ├── core/                        # 核心模块
│   │   ├── auth/                    # 认证相关
│   │   │   └── token.ts             # Token 管理工具
│   │   ├── http.ts                  # HTTP 请求封装（普通+流式）
│   │   └── interceptors.ts          # Axios 拦截器
│   ├── router/                      # 路由配置
│   │   └── index.ts                 # 路由定义
│   ├── stores/                      # Pinia 状态管理
│   │   └── chatStore.ts             # 聊天状态管理
│   ├── types/                       # TypeScript 类型定义
│   │   ├── chat.ts                  # 聊天相关类型
│   │   └── index.ts                 # 通用类型定义
│   ├── views/                       # 页面组件
│   │   ├── ChatPage.vue             # 普通聊天页面
│   │   ├── ChatPageSSE.vue          # SSE 流式聊天页面
│   │   ├── MessageList.vue          # 消息列表页面
│   │   └── mockData.ts              # 模拟数据
│   ├── App.vue                      # 根组件
│   ├── env.d.ts                     # 环境变量类型声明
│   └── main.ts                      # 应用入口
├── .env.development                 # 开发环境变量
├── .env.production                  # 生产环境变量
├── .env.example                     # 环境变量示例
├── .eslintrc.cjs                    # ESLint 配置
├── .gitignore                       # Git 忽略配置
├── .prettierrc                      # Prettier 配置
├── index.html                       # HTML 模板
├── package.json                     # 项目依赖配置
├── package-lock.json                # 依赖锁定文件
├── tsconfig.json                    # TypeScript 配置
├── tsconfig.node.json               # Node TypeScript 配置
└── vite.config.ts                   # Vite 配置
```

## 📂 目录说明

### `.qoder/skills/`
Qoder AI 的技能文件目录，包含用于快速生成聊天 H5 页面的 AI 技能文档。

### `src/api/`
**API 接口层**，统一管理所有后端接口调用。

- `chat.ts` - 聊天相关接口
  - `getAllChatHistory()` - 获取所有聊天历史
  - `getGroupedChatHistory()` - 获取分组聊天历史
  - `getChatHistory(convId)` - 获取指定对话历史
  - `getNewConversationId()` - 创建新对话
  - `sendChatMessage(data)` - 发送聊天消息（普通）
  - `sendChatStream(data, options)` - 发送聊天消息（SSE 流式）

### `src/assets/`
**静态资源目录**，存放项目所需的图片、图标等资源。

- `icons/` - 图标文件
- `images/` - 图片资源（头像、背景图等）

### `src/core/`
**核心模块目录**，包含应用的基础设施和工具函数。

- `auth/token.ts` - Token 管理工具
  - `getToken()` - 获取本地 Token
  - `setToken(token)` - 保存 Token
  - `clearToken()` - 清除 Token

- `http.ts` - HTTP 请求封装
  - `request<T>(config)` - 普通 HTTP 请求
  - `requestPage<T>(config)` - 分页请求
  - `requestStream(config, options)` - SSE 流式请求（支持打字机效果）
  - 使用 XMLHttpRequest 实现流式请求，完美适配浏览器环境

- `interceptors.ts` - Axios 拦截器
  - 请求拦截：自动添加 Token、设置 SSE 请求头
  - 响应拦截：统一错误处理、401 自动跳转登录

### `src/router/`
**路由配置目录**。

- `index.ts` - 路由定义
  - `/` - 重定向到 `/message-list`
  - `/message-list` - 消息列表页
  - `/chat/:id?` - 普通聊天页（支持可选对话 ID）
  - `/chat-sse/:id?` - SSE 流式聊天页（支持可选对话 ID）

### `src/stores/`
**Pinia 状态管理目录**。

- `chatStore.ts` - 聊天状态管理
  - `messageList` - 消息列表
  - `inputText` - 输入框文本
  - `addMessage(msg)` - 添加消息
  - `setInputText(text)` - 设置输入文本
  - `clearInput()` - 清空输入

### `src/types/`
**TypeScript 类型定义目录**。

- `chat.ts` - 聊天相关类型
  - `MessageItem` - 消息项接口（包含 id、conversation_id、content、sender 等）
  - `ChatResponse` - 聊天响应接口（包含 reply、references 等）

- `index.ts` - 通用类型
  - `ApiResponse<T>` - 标准 API 响应格式
  - `PageResult<T>` - 分页结果格式

### `src/views/`
**页面组件目录**，包含所有业务页面。

- `ChatPage.vue` - 普通聊天页面
- `ChatPageSSE.vue` - SSE 流式聊天页面（核心页面）
  - SSE 流式响应处理
  - 打字机效果展示
  - 对话历史加载
  - 新对话创建
  - 自动滚动到底部
  - 仿微信聊天气泡样式

- `MessageList.vue` - 消息列表页面
- `mockData.ts` - 模拟数据（开发阶段使用）

### 配置文件说明

- `.env.development` - 开发环境变量
  ```env
  VITE_API_BASE_URL=/api
  ```

- `.env.production` - 生产环境变量
  ```env
  VITE_API_BASE_URL=https://api.yourdomain.com
  ```

- `vite.config.ts` - Vite 配置
  - 路径别名：`@` → `src/`
  - 开发服务器端口：3000
  - API 代理：`/api` → `http://127.0.0.1:9000`

- `tsconfig.json` - TypeScript 配置
  - 目标：ES2020
  - 严格模式：开启
  - 路径别名：`@/*` → `src/*`

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

访问 http://localhost:3000

### 生产环境构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

### 代码检查与格式化

```bash
# ESLint 检查
npm run lint

# Prettier 格式化
npm run format
```

## ✨ 核心功能

### 1. SSE 流式聊天
- 使用 XMLHttpRequest 实现 SSE 流式请求
- 实时接收后端推送的消息片段
- 打字机效果逐字显示

### 2. 对话管理
- 创建新对话
- 加载历史对话
- 对话 ID 路由参数支持

### 3. 状态管理
- Pinia 统一管理聊天状态
- 消息列表响应式更新
- 输入框状态管理

### 4. HTTP 请求封装
- 普通请求、分页请求、流式请求
- 自动 Token 注入
- 统一错误处理和提示

### 5. UI 组件
- Vant4 组件库
- 仿微信聊天气泡样式
- 移动端自适应布局
- 自动滚动到底部

## 🔧 环境配置

### 环境变量

项目使用 Vite 的环境变量系统，所有环境变量必须以 `VITE_` 前缀开头。

| 变量名 | 开发环境 | 生产环境 | 说明 |
|--------|----------|----------|------|
| `VITE_API_BASE_URL` | `/api` | `https://api.yourdomain.com` | API 基础路径 |

### API 路径说明

开发环境下，`/api` 会被 Vite 代理到 `http://127.0.0.1:9000`，避免跨域问题。

**注意**：在代码中使用相对路径（如 `/v1/chat/send`），系统会自动拼接 `VITE_API_BASE_URL`。

## 📝 开发规范

### 代码风格
- 使用 ESLint + Prettier 统一代码风格
- TypeScript 严格模式
- Vue 3 Composition API
- 使用 `<script setup lang="ts">` 语法

### 目录组织
- 按功能模块划分目录
- API 接口统一在 `src/api/` 管理
- 类型定义统一在 `src/types/` 管理
- 核心工具放在 `src/core/`

### 命名规范
- 文件：kebab-case（如 `chat-page.vue`）
- 组件：PascalCase（如 `ChatPage`）
- 变量/函数：camelCase（如 `sendMessage`）
- 类型/接口：PascalCase（如 `MessageItem`）
- 常量：UPPER_SNAKE_CASE（如 `TOKEN_KEY`）

### Git 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链相关
```

## 📦 构建部署

### 开发环境

```bash
npm run dev
```

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 部署说明

1. 将 `dist/` 目录部署到静态服务器
2. 配置服务器将所有路由指向 `index.html`（SPA 模式）
3. 配置生产环境变量 `VITE_API_BASE_URL`

#### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:9000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 许可证

MIT License

## 📞 联系方式

如有问题或建议，请提交 Issue 或联系项目维护者。
