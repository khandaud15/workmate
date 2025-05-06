import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after successful sign in
      if (url === '/login') {
        return `${baseUrl}/dashboard`
      }
      // Allow relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // Allow same-origin URLs
      if (new URL(url).origin === baseUrl) {
        return url
      }
      return baseUrl
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
});

export { handler as GET, handler as POST };
