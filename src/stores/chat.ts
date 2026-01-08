import { defineStore } from 'pinia';
import { ref } from 'vue';
import { chatService } from '@/services/chatService';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  provider?: string;
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([]);
  const isTyping = ref(false);
  const isBlocked = ref(false);
  const blockTimer = ref(0);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isBlocked.value) return;

    // Add user message
    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: Date.now()
    };
    messages.value.push(userMsg);

    isTyping.value = true;

    try {
      // Map history for backend: { role: 'user' | 'assistant', content: string }
      const history = messages.value.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await chatService.sendMessage(text, history);

      const assistantMsg: Message = {
        role: 'assistant',
        content: response.answer,
        timestamp: Date.now(),
        provider: response.provider
      };
      messages.value.push(assistantMsg);
    } catch (error) {
      // Activar bloqueo si hay error
      isBlocked.value = true;
      blockTimer.value = 60;

      const interval = setInterval(() => {
        blockTimer.value--;
        if (blockTimer.value <= 0) {
          isBlocked.value = false;
          clearInterval(interval);
        }
      }, 1000);

      const errorMsg: Message = {
        role: 'assistant',
        content: `### ⚠️ Se ha alcanzado un límite temporal.
Por favor, espera a que el contador finalice para continuar con tu consulta.`,
        timestamp: Date.now()
      };
      messages.value.push(errorMsg);
    } finally {
      isTyping.value = false;
    }
  };

  const clearChat = () => {
    messages.value = [];
    isBlocked.value = false;
    blockTimer.value = 0;
  };

  return {
    messages,
    isTyping,
    isBlocked,
    blockTimer,
    sendMessage,
    clearChat
  };
});
