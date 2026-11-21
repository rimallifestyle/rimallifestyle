import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        
        try {
          const connectToDatabase = (await import("@/lib/mongodb")).default;
          const User = (await import("@/models/User")).default;
          const bcrypt = (await import("bcryptjs")).default;

          await connectToDatabase();

          const cleanEmail = credentials.email.trim();

          // Check if user exists (case-insensitive)
          const escapedEmail = cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
          const user = await User.findOne({
            email: { $regex: new RegExp(`^${escapedEmail}$`, "i") },
          });

          if (!user || !user.password) {
            throw new Error("Invalid credentials");
          }

          // Check if password matches
          const isMatch = await bcrypt.compare(credentials.password, user.password);

          if (!isMatch) {
            throw new Error("Invalid credentials");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role?.toLowerCase() || "user",
          };
        } catch (error: any) {
          throw new Error(error.message || "Something went wrong!");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "mock-google-id",
      clientSecret: process.env.GOOGLE_SECRET || "mock-google-secret",
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID || "mock-facebook-id",
      clientSecret: process.env.FACEBOOK_SECRET || "mock-facebook-secret",
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign in
        token.apiToken = (user as any).apiToken;
        token.avatar = (user as any).avatar;
        token.role = (user as any).role;
      }
      if (trigger === "update" && session) {
        if (session.avatar !== undefined) token.avatar = session.avatar;
        if (session.name !== undefined) token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      (session as any).apiToken = token.apiToken;
      if (session.user) {
        (session.user as any).avatar = token.avatar;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // We handle sign in via modals on the frontend, so redirect to home on error
  },
};
