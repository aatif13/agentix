import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import GrowthExperiment from '@/models/GrowthExperiment'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Await params carefully per new Next.js 15+ patterns, though standard destructuring works mostly.
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const body = await req.json()
    const { status, result } = body

    const experiment = await GrowthExperiment.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: { status, result } },
      { new: true }
    )

    if (!experiment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ experiment })
  } catch (error) {
    console.error('Experiment PATCH Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const experiment = await GrowthExperiment.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    })

    if (!experiment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Experiment DELETE Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
