import mongoose, { Schema, Document } from 'mongoose'

export interface IBuildProject extends Document {
  userId: mongoose.Types.ObjectId
  projectName: string
  description: string
  appType: string
  targetUsers: string
  features: string[]
  blueprint: any
  createdAt: Date
}

const buildProjectSchema = new Schema<IBuildProject>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  appType: {
    type: String,
    required: true,
  },
  targetUsers: {
    type: String,
    required: true,
  },
  features: [{
    type: String,
  }],
  blueprint: {
    type: Schema.Types.Mixed,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const BuildProject = mongoose.models.BuildProject || mongoose.model<IBuildProject>('BuildProject', buildProjectSchema)

export default BuildProject
