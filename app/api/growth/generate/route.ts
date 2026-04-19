import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Groq from 'groq-sdk'
import { connectDB } from '@/lib/mongodb'
import GrowthPlan from '@/models/GrowthPlan'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const FALLBACK_PLAN = {
  contentCalendar: [
    {
      week: 1,
      theme: 'Awareness & Introduction',
      posts: [
        { day: 'Monday', platform: 'Twitter', topic: 'Introducing your product to the world', hook: 'Most founders ship and pray. We shipped and listened.', cta: 'Reply with your biggest pain point 👇' },
        { day: 'Wednesday', platform: 'LinkedIn', topic: 'The problem we are solving', hook: "I spent 3 years struggling with this exact problem before building the solution.", cta: 'Follow for weekly growth insights' },
        { day: 'Friday', platform: 'Reddit', topic: 'Show HN / Show r/startups — what we built', hook: 'We built this tool after failing at our first startup. Here is what we learned.', cta: 'Check out the beta link in comments' },
      ],
    },
    {
      week: 2,
      theme: 'Social Proof & Traction',
      posts: [
        { day: 'Tuesday', platform: 'Twitter', topic: 'Early user testimonial thread', hook: '10 people used our product for a week. Here is what happened:', cta: 'DM me for early access' },
        { day: 'Thursday', platform: 'LinkedIn', topic: 'Behind the scenes: how we got our first 10 users', hook: 'Zero ad spend. Zero cold emails. Here is exactly what we did.', cta: 'Save this post for when you need it' },
      ],
    },
    {
      week: 3,
      theme: 'Education & Value',
      posts: [
        { day: 'Monday', platform: 'Twitter', topic: '5 growth tactics that actually worked for us', hook: 'I tested 20 growth tactics last month. Only 5 moved the needle. Here they are:', cta: 'RT if you found this useful' },
        { day: 'Wednesday', platform: 'LinkedIn', topic: 'Framework: how to find your first 100 users', hook: 'Most founders skip this step and wonder why they have no users.', cta: 'Comment "USERS" and I will DM you the template' },
      ],
    },
    {
      week: 4,
      theme: 'Launch & Momentum',
      posts: [
        { day: 'Monday', platform: 'Twitter', topic: 'ProductHunt launch announcement', hook: 'We are launching on ProductHunt TODAY. Been building this for 6 months.', cta: 'Support us → link in bio' },
        { day: 'Wednesday', platform: 'LinkedIn', topic: 'Launch day results + lessons learned', hook: 'We launched publicly. Here are the honest results (good and bad):', cta: 'Follow for the full breakdown next week' },
        { day: 'Friday', platform: 'Reddit', topic: 'Post-launch AMA', hook: 'We just launched our product. Happy to answer anything about the journey.', cta: 'Ask me anything in the comments' },
      ],
    },
  ],
  seoStrategy: {
    primaryKeywords: [
      { keyword: 'best tool for founders', difficulty: 'Medium', intent: 'Commercial', suggestedTitle: '10 Best Tools for Founders in 2025 (Free & Paid)' },
      { keyword: 'startup growth strategies', difficulty: 'High', intent: 'Informational', suggestedTitle: 'Startup Growth Strategies That Actually Work in 2025' },
      { keyword: 'how to get first 100 users', difficulty: 'Low', intent: 'Informational', suggestedTitle: 'How to Get Your First 100 Users — A Founder\'s Complete Guide' },
      { keyword: 'product market fit checklist', difficulty: 'Low', intent: 'Informational', suggestedTitle: 'Product-Market Fit Checklist: 12 Signs You Have It' },
    ],
    contentIdeas: [
      { title: 'How We Got Our First 100 Users Without Paid Ads', outline: 'Intro → Problem → Strategy 1: Communities → Strategy 2: Direct Outreach → Strategy 3: Content → Results', targetKeyword: 'how to get first 100 users' },
      { title: 'The Founder\'s Guide to Organic Growth in 2025', outline: 'What is organic growth → Why it beats paid → 5 channels → Measuring success → Templates', targetKeyword: 'startup growth strategies' },
      { title: 'Why Most Startups Fail at Distribution (And How to Fix It)', outline: 'The build trap → Distribution first mindset → Finding your early adopters → Building feedback loops', targetKeyword: 'best tool for founders' },
    ],
    quickWins: [
      'Submit to 10 startup directories in the first week (Product Hunt, Betalist, Launching Next)',
      'Answer 3 relevant questions on Quora and Reddit daily with a subtle mention of your product',
      'Create a free tool or resource that solves a problem related to your main product',
      'Reach out to 5 micro-influencers in your niche for honest reviews',
      'Publish your founder story on Medium and LinkedIn as a long-form post',
      'Create a /uses page showing your tech stack to attract developer interest',
    ],
  },
  emailSequence: [
    { emailNumber: 1, subject: 'Welcome — here\'s how to get started 🚀', preview: 'You made a great decision. Let me show you around.', goal: 'Onboard & activate new user', body: "Hey {{first_name}},\n\nWelcome aboard! I'm the founder and I personally wanted to reach out.\n\nYou signed up because you want to [solve their pain point]. And we're going to help you do exactly that.\n\nHere's what to do first:\n\n1. Complete your profile (2 min)\n2. Try the core feature\n3. Join our community\n\nIf you run into anything, just reply to this email. I read every message.\n\nLet's build something great,\n[Founder Name]", cta: 'Complete your setup →' },
    { emailNumber: 2, subject: 'Did you try [core feature] yet?', preview: 'Most users who try this see results in 24 hours.', goal: 'Drive feature activation', body: "Hey {{first_name}},\n\nI noticed you haven't tried [core feature] yet.\n\nI get it — getting started with something new takes effort. But here's the thing: 80% of our active users say [core feature] is the single biggest reason they stick around.\n\nTake 5 minutes and try it now. I promise it's worth it.\n\nHere's a quick video showing exactly how it works: [link]\n\nStill have questions? Reply to this email.\n\n[Founder Name]", cta: 'Try core feature now →' },
    { emailNumber: 3, subject: 'A quick win you can get today', preview: 'This takes 10 minutes and most users see results immediately.', goal: 'Deliver value & build habit', body: "Hey {{first_name}},\n\nHere's a quick tip that's helped hundreds of our users:\n\n[Actionable tip related to their use case]\n\nTry it today and let me know how it goes. Seriously — reply to this email with your results.\n\nAlso, I'd love to hear: what's the #1 thing you're trying to achieve right now?\n\nYour answer helps us build better features.\n\n[Founder Name]", cta: 'Try this tip →' },
    { emailNumber: 4, subject: 'You\'re {{X}} days in — here\'s your progress', preview: 'Here\'s what you\'ve accomplished and what\'s next.', goal: 'Show progress & reduce churn', body: "Hey {{first_name}},\n\nYou've been with us for a week now. Here's a quick look at your progress:\n\n✅ [Achievement 1]\n✅ [Achievement 2]\n🔜 Next milestone: [next goal]\n\nUsers who reach this milestone typically see [key result]. You're on track.\n\nWant to accelerate? Here's the fastest path to [desired outcome]:\n\n1. [Action 1]\n2. [Action 2]\n3. [Action 3]\n\n[Founder Name]", cta: 'View your dashboard →' },
    { emailNumber: 5, subject: 'Can I ask you something personal?', preview: 'This will take 2 minutes and it means a lot.', goal: 'Collect feedback & testimonials', body: "Hey {{first_name}},\n\nYou've been using [Product] for a couple of weeks now.\n\nI have one simple question: has it been worth it?\n\nIf yes — would you be willing to share a quick testimonial? Even 2 sentences helps us grow and helps other founders find us.\n\nIf no — please tell me why. I personally read every response and use it to make the product better.\n\nEither way, your feedback shapes what we build next.\n\n[Founder Name]\n\nP.S. Bonus: everyone who shares feedback gets 1 month free.", cta: 'Share your feedback →' },
  ],
  launchPlan: {
    productHunt: {
      tagline: 'AI-powered growth engine for early-stage startups',
      description: 'Stop guessing your growth strategy. Get a personalized, AI-generated growth plan with content calendar, SEO strategy, email sequences, and launch playbook — all tailored to your product and audience. Built by founders, for founders.',
      topics: ['Artificial Intelligence', 'Startups', 'Marketing', 'Productivity', 'SaaS'],
      launchDayChecklist: [
        'Schedule the launch at 12:01 AM PST for maximum exposure',
        'Notify your email list at launch time with a personal message',
        'Post in all your Slack/Discord communities',
        'DM 50 supporters personally asking for an upvote',
        'Tweet every 2 hours with updates, milestones, and behind-the-scenes',
        'Reply to every single comment on ProductHunt within minutes',
        'Update your LinkedIn status to "We\'re live on ProductHunt!"',
        'Post in relevant subreddits (r/startups, r/SideProject)',
        'Send WhatsApp/iMessage to friends and family',
        'Monitor and respond to all social mentions',
      ],
    },
    week1Actions: [
      'Post daily on Twitter/LinkedIn about the launch journey',
      'Reach out personally to 20 potential early adopters',
      'Submit to 5 startup directories (Betalist, Launching Next, etc)',
      'Host a live AMA or demo session on Twitter Spaces',
      'Create a referral incentive for existing users',
    ],
    week2Actions: [
      'Publish your founder story on Medium / Substack',
      'Partner with 2-3 complementary tool makers for cross-promotion',
      'Start a weekly newsletter documenting your journey',
      'Reach out to 10 relevant podcasts for guest spots',
      'Create a free template or resource to drive email signups',
    ],
    week3Actions: [
      'Analyze Week 1-2 acquisition data and double down on what\'s working',
      'Launch a referral program with real incentives',
      'Write 3 SEO-optimized blog posts targeting low-difficulty keywords',
      'Set up automated onboarding email sequence',
      'Reach out to 5 relevant newsletters for sponsorship or features',
    ],
    week4Actions: [
      'Review cohort retention data and identify drop-off points',
      'Implement changes based on user feedback received',
      'Create a case study from your most successful early user',
      'Set monthly growth targets and metrics dashboard',
      'Plan Month 2 strategy based on Month 1 learnings',
    ],
  },
  growthMetrics: [
    { metric: 'Weekly Active Users (WAU)', target: '+20% week-over-week', howToTrack: 'Mixpanel or PostHog event tracking', frequency: 'Weekly' },
    { metric: 'Activation Rate', target: '40%+ complete core action', howToTrack: 'Funnel analysis in analytics tool', frequency: 'Weekly' },
    { metric: 'Day 7 Retention', target: '25%+ return on Day 7', howToTrack: 'Cohort analysis in PostHog', frequency: 'Weekly' },
    { metric: 'Email Open Rate', target: '35%+ open rate', howToTrack: 'Email platform dashboard (Resend / Mailchimp)', frequency: 'Per campaign' },
    { metric: 'Organic Traffic', target: '+50% month-over-month', howToTrack: 'Google Search Console + Analytics', frequency: 'Monthly' },
    { metric: 'Net Promoter Score (NPS)', target: '40+ NPS score', howToTrack: 'Typeform or Delighted survey', frequency: 'Monthly' },
  ],
}

export async function POST(req: Request) {
  try {
    const { problemStatement } = await req.json()
    
    if (!problemStatement) {
      return Response.json({ error: 'No problem statement provided' }, { status: 400 })
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert startup growth strategist."
        },
        {
          role: "user", 
          content: `Generate a comprehensive growth strategy for a startup solving: ${problemStatement}. Include: 90-Day Growth Plan, Key Growth Channels, Week 1-4 Action Items, Success Metrics, and Budget Allocation recommendation.`
        }
      ],
      max_tokens: 1500
    })

    return Response.json({ 
      strategy: completion.choices[0].message.content 
    })

  } catch (error) {
    console.error('Growth generate error:', error)
    return Response.json({ error: 'Failed to generate strategy' }, { status: 500 })
  }
}
