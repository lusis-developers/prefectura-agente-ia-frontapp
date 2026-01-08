<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { useChatStore } from '@/stores/chat';
import { useThemeStore } from '@/stores/theme';
import { useRouter } from 'vue-router';

const chatStore = useChatStore();
const themeStore = useThemeStore();
const router = useRouter();

const newMessage = ref('');
const messagesContainer = ref<HTMLElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const handleSend = async () => {
  if (!newMessage.value.trim() || chatStore.isTyping) return;

  const text = newMessage.value;
  newMessage.value = '';
  await chatStore.sendMessage(text);
};

const handleLogout = () => {
  localStorage.removeItem('isAuth');
  router.push('/login');
};

watch(() => chatStore.messages.length, scrollToBottom);
watch(() => chatStore.isTyping, (val) => { if (val) scrollToBottom(); });

onMounted(() => {
  if (chatStore.messages.length === 0) {
    chatStore.messages.push({
      role: 'assistant',
      content: '¡Hola! Soy el Agente de la Prefectura del Guayas. ¿En qué puedo ayudarte hoy?',
      timestamp: Date.now()
    });
  }
  scrollToBottom();
});
</script>

<template>
  <div class="agent-view">
    <!-- Header -->
    <header class="app-header">
      <div class="header-left">
        <img src="@/assets/logo-prefectura.png" alt="Logo" class="logo" />
        <div class="brand-info">
          <h1>Agente IA</h1>
          <span class="status">En línea</span>
        </div>
      </div>
      
      <div class="header-right">
        <select v-model="chatStore.selectedProvider" class="provider-select">
          <option value="claude">Claude 3.5 Sonnet</option>
          <option value="gemini">Gemini 1.5 Pro</option>
        </select>
        
        <button @click="themeStore.toggleTheme" class="icon-btn">
          <span v-if="themeStore.theme === 'dark'">🌞</span>
          <span v-else>🌙</span>
        </button>
        
        <button @click="handleLogout" class="logout-btn">Salir</button>
      </div>
    </header>

    <!-- Main Chat Area -->
    <main class="chat-wrapper">
      <div class="messages-container" ref="messagesContainer">
        <div 
          v-for="(msg, index) in chatStore.messages" 
          :key="index"
          :class="['message-bubble', msg.role]"
        >
          <div class="avatar" v-if="msg.role === 'assistant'">
            <img src="@/assets/logo-prefectura.png" alt="AI" />
          </div>
          
          <div class="content-wrapper">
            <div class="message-content">
              {{ msg.content }}
            </div>
            <div class="message-meta">
              <span class="time">{{ new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
              <span v-if="msg.provider" class="provider-tag">{{ msg.provider }}</span>
            </div>
          </div>
        </div>

        <div v-if="chatStore.isTyping" class="message-bubble assistant typing">
          <div class="avatar">
            <img src="@/assets/logo-prefectura.png" alt="AI" />
          </div>
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <!-- Input Bar -->
      <div class="input-area">
        <form @submit.prevent="handleSend" class="input-form">
          <input 
            v-model="newMessage"
            type="text" 
            placeholder="Escribe tu mensaje aquí..."
            :disabled="chatStore.isTyping"
          />
          <button type="submit" :disabled="!newMessage.trim() || chatStore.isTyping" class="send-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </form>
        <p class="disclaimer">Este es un asistente de IA enfocado en procesos y servicios de la Prefectura del Guayas.</p>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.agent-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-main);
  transition: background-color var(--transition-speed);
}

.app-header {
  padding: 0.75rem 1.5rem;
  background: var(--bg-card);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;

  .header-left {
    display: flex;
    align-items: center;
    gap: 1rem;

    .logo {
      height: 38px;
    }

    .brand-info {
      h1 {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-main);
        margin: 0;
      }

      .status {
        font-size: 0.75rem;
        color: #10b981;
        display: flex;
        align-items: center;
        gap: 0.25rem;

        &::before {
          content: '';
          width: 6px;
          height: 6px;
          background: currentColor;
          border-radius: 50%;
        }
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}

.provider-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-main);
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
  cursor: pointer;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn {
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 0.4rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--accent);
    color: #fff;
  }
}

.chat-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  overflow: hidden;
  position: relative;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--text-main), 0.1);
    border-radius: 10px;
  }
}

.message-bubble {
  display: flex;
  gap: 1rem;
  max-width: 80%;
  animation: slideUp 0.3s ease-out;

  &.user {
    align-self: flex-end;
    flex-direction: row-reverse;

    .message-content {
      background: var(--accent);
      color: white;
      border-radius: 18px 18px 4px 18px;
    }

    .message-meta {
      justify-content: flex-end;
    }
  }

  &.assistant {
    align-self: flex-start;

    .message-content {
      background: var(--bg-card);
      color: var(--text-main);
      border-radius: 18px 18px 18px 4px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
  }

  .avatar {
    width: 32px;
    height: 32px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    img {
      width: 22px;
      height: auto;
    }
  }

  .message-content {
    padding: 0.85rem 1.25rem;
    font-size: 0.95rem;
    line-height: 1.5;
    white-space: pre-wrap;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .message-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.4rem;
    font-size: 0.7rem;
    color: var(--text-sec);

    .provider-tag {
      text-transform: uppercase;
      background: rgba(var(--accent), 0.1);
      color: var(--accent);
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 700;
    }
  }
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 0.85rem 1.25rem;
  background: var(--bg-card);
  border-radius: 18px 18px 18px 4px;

  span {
    width: 6px;
    height: 6px;
    background: var(--text-sec);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

.input-area {
  padding: 1.5rem;
  background: linear-gradient(to top, var(--bg-main), transparent);

  .input-form {
    background: var(--bg-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    display: flex;
    padding: 0.5rem;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    transition: focus-within 0.2s;

    &:focus-within {
      border-color: var(--accent);
    }

    input {
      flex: 1;
      background: transparent;
      border: none;
      color: var(--text-main);
      padding: 0.75rem 1rem;
      font-size: 1rem;
      outline: none;

      &::placeholder {
        color: var(--text-sec);
        opacity: 0.5;
      }
    }

    .send-btn {
      width: 42px;
      height: 42px;
      background: var(--accent);
      border: none;
      border-radius: 12px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.05);
      }

      &:disabled {
        opacity: 0.5;
        background: var(--text-sec);
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }

  .disclaimer {
    font-size: 0.7rem;
    color: var(--text-sec);
    text-align: center;
    margin-top: 0.75rem;
    opacity: 0.6;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1.0);
  }
}

[data-theme="light"] {
  .app-header {
    background: white;
    border-color: #e2e8f0;
  }

  .provider-select,
  .icon-btn {
    background: #f1f5f9;
    border-color: #e2e8f0;
    color: #1e293b;
  }

  .message-bubble.assistant .message-content {
    background: #f8fafc;
    border-color: #e2e8f0;
  }

  .avatar {
    box-shadow: 0 0 0 1px #e2e8f0;
  }

  .input-form {
    background: white;
    border-color: #e2e8f0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .typing-indicator {
    background: #f8fafc;
  }
}

@media (max-width: 640px) {
  .header-right .provider-select {
    display: none;
  }

  .message-bubble {
    max-width: 90%;
  }
}
</style>
