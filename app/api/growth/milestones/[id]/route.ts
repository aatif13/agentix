import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import Milestone from '@/models/Milestone'

// PATCH /api/growth/milestones/[id]
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params
    const body = await req.json()

    const milestone = await Milestone.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: body },
      { new: true }
    )

    if (!milestone) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ milestone })
  } catch (error) {
    console.error('Milestone PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/growth/milestones/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { id } = await params

    await Milestone.findOneAndDelete({ _id: id, userId: session.user.id })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Milestone DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
