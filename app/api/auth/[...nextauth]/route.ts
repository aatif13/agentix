console.log('GOOGLE ID:', process.env.GOOGLE_CLIENT_ID)
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        await connectDB()
        const user = await User.findOne({ email: credentials.email.toLowerCase().trim() })

        if (!user) {
          throw new Error('No account found with this email')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('Incorrect password')
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          plan: user.plan,
          role: user.role || 'founder',
        }
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB()

          if (!user.email) return false

          const existing = await User.findOne({
            email: user.email.toLowerCase()
          })

          if (!existing) {
            await User.create({
              name: user.name || 'User',
              email: user.email.toLowerCase(),
              avatar: user.image || '',
              plan: 'starter',
              role: 'founder',
              startupName: '',
              startupIdea: ''
            })
          }

          return true
        } catch (error) {
          console.error('Google signIn error:', error)
          return true
        }
      }
      return true
    },
    async jwt({ token, account }) {
      if (account?.provider === 'google' || !token.id) {
        try {
          await connectDB()
          const dbUser = await User.findOne({
            email: token.email?.toLowerCase()
          })
          if (dbUser) {
            token.id = dbUser._id.toString()
            token.plan = dbUser.plan
            token.role = dbUser.role || 'founder'
          }
        } catch (error) {
          console.error('JWT callback error:', error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.plan = token.plan as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }