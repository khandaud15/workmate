import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

// Function to get the actual running port, regardless of NEXTAUTH_URL setting
const getCurrentPort = () => {
  // First try to get the port from the request headers (most accurate)
  if (typeof window !== 'undefined') {
    const port = window.location.port;
    if (port) return port;
  }

  // Then try getting it from NEXTAUTH_URL
  const url = process.env.NEXTAUTH_URL;
  if (url) {
    try {
      const port = new URL(url).port;
      if (port) return port;
    } catch {}
  }

  // Finally, check if we're running on a non-standard port
  const port = process.env.PORT || process.env.NODE_ENV === 'development' ? '3000' : '';
  return port;
};

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // For demo purposes, we're using a simplified authentication
          // In a real app, you would validate against a database
          
          // Simple validation - in production, replace with actual auth
          if (credentials.email && credentials.password) {
            // Return a mock user for demonstration
            return {
              id: '1',
              email: credentials.email,
              name: credentials.email.split('@')[0] || 'User',
              emailVerified: true
            };
          }
          
          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/signup',
    signOut: '/',
    error: '/error'
  },
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Debug logging
      console.log('Redirect URL:', url);
      console.log('Base URL:', baseUrl);
      
      // Force production domain for all redirects
      const productionDomain = 'https://www.telaxus.ai';
      
      // Handle the callback URL after successful authentication
      if (url.includes('/api/auth/callback') || 
          url.includes('/signin?callbackUrl=') ||
          url === baseUrl || 
          url === productionDomain ||
          url.includes('talexus.ai')) {  // Handle any talexus.ai URLs
        return `${productionDomain}/onboarding`;
      }

      // List of allowed domains
      const allowedDomains = [
        'http://localhost:3000',
        'https://telaxus.ai',
        'https://www.telaxus.ai',
        'https://your-vercel-app.vercel.app' // Replace with your Vercel URL
      ];

      // Handle relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // Handle absolute URLs
      try {
        const redirectUrl = new URL(url);
        
        // Check if the URL is from an allowed domain
        const isAllowed = allowedDomains.some(domain => 
          redirectUrl.origin === new URL(domain).origin
        );
        
        if (isAllowed) {
          return url;
        }

        // Default to base URL if not allowed
        return baseUrl;
      } catch (e) {
        // If URL parsing fails, return base URL
        return baseUrl;
      }
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session?.user) {
        session.user.id = token.sub || '';
      }
      return session;
    },
    async jwt({ token }: { token: any }) {
      if (!token.sub) return token;
      return token;
    },
  },
});

export { handler as GET, handler as POST };
