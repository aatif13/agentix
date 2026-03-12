import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IAgentTask extends Document {
  userId: Types.ObjectId
  taskName: string
  description: string
  agent: 'Research' | 'Code' | 'Marketing' | 'Legal' | 'Finance' | 'Analytics'
  agentEmoji: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  result?: string
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const AgentTaskSchema = new Schema<IAgentTask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    taskName: { type: String, required: true },
    description: { type: String, required: true },
    agent: {
      type: String,
      enum: ['Research', 'Code', 'Marketing', 'Legal', 'Finance', 'Analytics'],
      required: true,
    },
    agentEmoji: { type: String, required: true },
    status: { type: String, enum: ['queued', 'running', 'completed', 'failed'], default: 'queued' },
    result: { type: String },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
)

const AgentTask: Model<IAgentTask> =
  mongoose.models.AgentTask || mongoose.model<IAgentTask>('AgentTask', AgentTaskSchema)
export default AgentTask
