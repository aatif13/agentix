import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    plan?: string
  }
  interface Session {
    user: {
      id: string
      name: string
      email: string
      plan?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    plan?: string
  }
}
