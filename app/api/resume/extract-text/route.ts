import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import fetch from 'node-fetch';
import * as pdfjs from 'pdfjs-dist';

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the URL parameter
    const url = request.nextUrl.searchParams.get('url');
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    console.log(`[EXTRACT-TEXT API] Extracting text from URL: ${url}`);

    // Fetch the content from the URL
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ 
        error: `Failed to fetch URL: ${response.status} ${response.statusText}` 
      }, { status: 500 });
    }

    const contentType = response.headers.get('content-type');
    let text = '';

    // Handle different content types
    if (contentType?.includes('application/pdf')) {
      // Handle PDF
      const arrayBuffer = await response.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);
      
      try {
        // Load the PDF document
        const loadingTask = pdfjs.getDocument({ data: typedArray });
        const pdf = await loadingTask.promise;
        
        // Extract text from each page
        let extractedText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(' ');
          extractedText += pageText + '\n';
        }
        
        text = extractedText;
      } catch (error) {
        console.error('[EXTRACT-TEXT API] Error extracting PDF text:', error);
        return NextResponse.json({ error: 'Failed to extract PDF text' }, { status: 500 });
      }
    } else if (contentType?.includes('text')) {
      // Handle plain text
      text = await response.text();
    } else {
      return NextResponse.json({ 
        error: `Unsupported content type: ${contentType}` 
      }, { status: 400 });
    }

    // Return the extracted text
    return NextResponse.json({ text, contentType });
  } catch (error) {
    console.error('[EXTRACT-TEXT API] Error:', error);
    return NextResponse.json({ error: 'Failed to extract text' }, { status: 500 });
  }
}
