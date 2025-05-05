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
          prompt: "select_account"
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
    signOut: '/',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Get the current port
      const currentPort = getCurrentPort();
      // Replace any localhost URL with the correct port
      if (url.startsWith('http://localhost:')) {
        const path = url.split('/', 4).slice(3).join('/');
        return `http://localhost:${currentPort}/${path}`;
      }
      return `${baseUrl}/dashboard`;
    },
    async session({ session }) {
      return session;
    },
  },
});

export { handler as GET, handler as POST };
