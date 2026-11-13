export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  textEn: string;
  textOr: string;
  timestamp: number;
  pestContext?: string;
  audioVoiceKey?: string;
  suggestedActionPills?: string[];
  suggestedActionPillsOr?: string[];
}
