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
          // Here you would typically:
          // 1. Check if user exists
          // 2. Verify password
          // 3. Return user data or null
          
          // For now, we'll create a simple user object
          // In a real app, you'd want to check against your database
          return {
            id: credentials.email,
            email: credentials.email,
            name: credentials.email.split('@')[0]
          };
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
    async redirect({ url, baseUrl }) {
      // Redirect to onboarding after successful authentication
      if (url.startsWith(baseUrl + '/api/auth/callback')) {
        return '/onboarding'
      }
      // Handle direct onboarding redirect
      if (url === '/onboarding') {
        return '/onboarding'
      }
      // Allow relative URLs
      if (url.startsWith("/")) {
        return url
      }
      // Allow same-origin URLs
      if (new URL(url).origin === baseUrl) {
        return url
      }
      return baseUrl
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session?.user,
          id: token.sub || ''
        }
      };
    },
    async jwt({ token }) {
      // Use the token.sub as the user ID
      if (token?.sub) {
        token.id = token.sub;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
