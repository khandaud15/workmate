// OpenRouter API integration for Next.js Pages Router
// This is a fallback implementation using the Pages Router API routes

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    
    // Validate request body
    if (!body.messages || !Array.isArray(body.messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array is required' });
    }

    // OpenRouter API configuration
    const API_KEY = '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';
    const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

    // Prepare the request to OpenRouter
    const openRouterRequest = {
      model: body.model || 'openai/gpt-3.5-turbo', // Default model if not specified
      messages: body.messages,
      temperature: body.temperature || 0.7,
      max_tokens: body.max_tokens || 1000,
      stream: body.stream || false,
    };

    // Make the API call to OpenRouter
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_APP_URL || 'https://talexus.ai'),
        'X-Title': 'Talexus AI'
      },
      body: JSON.stringify(openRouterRequest),
    });

    // Handle errors
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return res.status(response.status).json({ error: 'Error from AI provider', details: errorData });
    }

    // Return the response
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in AI route:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
