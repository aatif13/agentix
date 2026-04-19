import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import GrowthPlan from '@/models/GrowthPlan'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const plans = await GrowthPlan.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Growth Plans API Error:', error)
    return NextResponse.json({ plans: [] })
  }
}
