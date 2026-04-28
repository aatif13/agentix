# Agentix: AI-Powered Startup Acceleration Platform

Agentix is a sophisticated, AI-driven platform designed to empower founders and investors. It streamlines the entire startup lifecycle—from ideation and problem research to growth scaling and investor relations—using a suite of specialized AI agents.

## 🚀 Overview

Agentix provides a dual-dashboard experience tailored for:
- **Founders**: A comprehensive workspace to build, validate, and scale their startups with AI guidance.
- **Investors**: A deal-flow management system to discover high-potential startups and engage with founders.

---

## 🛠️ Key Features

### 🤖 Specialized AI Agents
Agentix leverages advanced LLMs (via Groq and OpenAI) to provide domain-specific intelligence:
- **Problem Researcher**: Analyzes market gaps and validates problem-solution fit.
- **Build Advisor**: Provides technical guidance and product strategy.
- **Growth Advisor**: Generates tactical growth experiments, channel strategies, and retention plans.
- **Pitch Coach**: Critiques and refines pitch decks and founder stories for maximum investor impact.

### 🏢 Founder Modules
- **Idea Lab**: Validate and iterate on startup concepts.
- **Build Studio**: Track development progress and technical milestones.
- **Growth Engine**: Manage experiments, weekly reports, and scaling metrics.
- **Pitch Room**: A professional interface for hosting pitches and managing investor interest.

### 📊 Investor Ecosystem
- **Deal Flow**: Discover and track promising startups based on specific criteria.
- **Market Insights**: AI-generated reports on sector trends and startup performance.
- **Direct Engagement**: Secure, real-time messaging with founders.

---

## 💻 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Runtime**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (with [Mongoose](https://mongoosejs.com/))
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **AI Integration**: [Groq SDK](https://groq.com/) & [OpenAI SDK](https://openai.com/)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Email**: [Nodemailer](https://nodemailer.com/)

---

## 📂 Project Structure

```text
├── app/                  # Next.js App Router (Pages, Layouts, API)
│   ├── api/              # Backend API routes (Agents, Auth, DB operations)
│   ├── dashboard/        # Founder dashboard interface
│   ├── investor/         # Investor dashboard interface
│   └── (auth)/           # Login and Signup flows
├── components/           # Reusable UI components
│   ├── ui/               # Base UI elements
│   ├── agents/           # AI Agent interfaces (Drawer panels)
│   └── dashboards/       # Feature-specific dashboard components
├── lib/                  # Shared utilities and custom hooks
├── models/               # Mongoose schemas (User, Idea, Growth, etc.)
├── public/               # Static assets
└── types/                # TypeScript definitions
```

---

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/aatif13/agentix.git
   cd agentix
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   GROQ_API_KEY=your_groq_key
   OPENAI_API_KEY=your_openai_key
   
   EMAIL_SERVER_HOST=smtp.example.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=user@example.com
   EMAIL_SERVER_PASSWORD=password
   EMAIL_FROM=noreply@example.com
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

---

## 📜 License

This project is private and proprietary.
