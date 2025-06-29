import { useState } from 'react';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type AIRequestOptions = {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
};

type UseAIReturn = {
  generateResponse: (messages: Message[], options?: AIRequestOptions) => Promise<string>;
  isLoading: boolean;
  error: string | null;
};

export function useAI(): UseAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = async (messages: Message[], options: AIRequestOptions = {}): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model: options.model || 'openai/gpt-3.5-turbo',
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 1000,
          stream: options.stream || false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate AI response');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateResponse,
    isLoading,
    error,
  };
}
