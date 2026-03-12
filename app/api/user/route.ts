import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, startupName, startupIdea, openaiKey, serperKey } = await req.json()

    await connectDB()

    const updateData: Record<string, string> = {}
    if (name) updateData.name = name
    if (startupName !== undefined) updateData.startupName = startupName
    if (startupIdea !== undefined) updateData.startupIdea = startupIdea
    if (openaiKey !== undefined) updateData.openaiKey = openaiKey
    if (serperKey !== undefined) updateData.serperKey = serperKey

    const user = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true, select: '-password' }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user, message: 'Profile updated successfully' })
  } catch (error) {
    console.error('PUT user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const user = await User.findById(session.user.id).select('-password')

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('GET user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
