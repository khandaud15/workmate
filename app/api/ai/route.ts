import { NextResponse } from 'next/server';

// OpenRouter API configuration
const API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Check if API key is configured
if (!API_KEY) {
  console.error('OPENROUTER_API_KEY is not defined in environment variables');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json({ error: 'Invalid request: messages array is required' }, { status: 400 });
    }

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
      return NextResponse.json({ error: 'Error from AI provider', details: errorData }, { status: response.status });
    }

    // Return the response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in AI route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
