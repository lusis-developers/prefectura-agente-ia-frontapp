import APIBase from './httpBase';

interface ChatResponse {
  message: string;
  provider: string;
  answer: string;
}

class ChatService extends APIBase {
  async sendMessage(message: string, history: any[] = [], provider?: string): Promise<ChatResponse> {
    try {
      const response = await this.post<ChatResponse>('chat', {
        message,
        history,
        provider
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
