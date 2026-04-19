import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import ProblemFinderResult from '@/models/ProblemFinderResult'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const DOMAINS: Record<string, string[]> = {
  'Agriculture & Food': [
    'Agronomy (Crop Science)',
    'Horticulture (Fruits, Vegetables)',
    'Floriculture (Flower Farming)',
    'Animal Husbandry (Livestock)',
    'Aquaculture (Fish Farming)',
    'Sericulture (Silk Farming)',
    'Forestry & Agroforestry',
    'Soil Science & Agricultural Chemistry',
    'Food Processing & Technology',
    'Agricultural Economics & Agribusiness',
  ],
  'Technology & Innovation': [
    'Computer Science & Software Engineering',
    'Artificial Intelligence & Machine Learning',
    'Data Science & Analytics',
    'Cybersecurity & Information Security',
    'Network Engineering & Communications',
    'Semiconductor & Electronics Engineering',
    'Robotics & Automation',
    'Cloud Computing & Infrastructure',
    'Biotechnology',
    'Nanotechnology',
  ],
  'Finance': [
    'Retail & Commercial Banking',
    'Investment Banking',
    'Asset & Wealth Management',
    'Insurance (Life, General, Reinsurance)',
    'Accounting & Auditing',
    'Capital Markets (Stocks, Bonds)',
    'Corporate Finance',
    'Financial Planning & Analysis (FP&A)',
    'Risk Management & Compliance',
    'Financial Technology (FinTech)',
  ],
  'Healthcare & Life Sciences': [
    'Pharmaceuticals',
    'Biotechnology',
    'Medical Devices',
    'Clinical Care (Hospitals, Clinics)',
    'Diagnostics & Laboratories',
    'Medical Research & Clinical Trials',
    'Public Health',
    'Genomics & Personalized Medicine',
    'Healthcare Administration & Management',
    'Mental & Behavioral Health',
  ],
  'Education': [
    'Early Childhood Education (Pre-K)',
    'K-12 Education (Primary & Secondary)',
    'Higher Education (Colleges, Universities)',
    'Vocational & Technical Training',
    'Adult Education & Lifelong Learning',
    'Special Education',
    'Curriculum & Instruction Development',
    'Educational Administration & Policy',
    'Educational Psychology',
    'Educational Technology (EdTech)',
  ],
  'Energy & Environment': [
    'Oil & Gas (Exploration & Production)',
    'Renewable Energy (Solar, Wind, Hydro)',
    'Nuclear Energy',
    'Power Generation & Utilities',
    'Energy Trading & Marketing',
    'Energy Efficiency & Conservation',
    'Environmental Science',
    'Waste Management & Recycling',
    'Water Resource Management',
    'Environmental Policy & Regulation',
  ],
  'Logistics & Mobility': [
    'Supply Chain Management (SCM)',
    'Freight & Road Haulage',
    'Maritime Shipping & Ports',
    'Aviation Logistics & Air Cargo',
    'Rail Transport',
    'Warehousing & Inventory Management',
    'Urban Mobility (Public Transit, Ride-Hailing)',
    'Last-Mile Delivery',
    'Customs & Freight Forwarding',
    'Automotive & Vehicle Manufacturing',
  ],
  'Retail & E-Commerce': [
    'Grocery & Supermarkets',
    'Fashion & Apparel',
    'Consumer Electronics',
    'Home Goods & Furniture',
    'Health & Beauty',
    'E-Commerce Platforms & Marketplaces',
    'Brick-and-Mortar Store Operations',
    'Merchandising & Category Management',
    'Direct-to-Consumer (D2C)',
    'Quick Commerce (Q-Commerce)',
  ],
  'Real Estate & Construction': [
    'Residential Real Estate',
    'Commercial Real Estate',
    'Industrial Real Estate',
    'Property Management',
    'Architecture & Design',
    'Civil Engineering',
    'General Contracting & Construction Management',
    'Urban Planning',
    'Real Estate Finance & Investment',
    'Building Materials & Supply',
  ],
  'Media & Entertainment': [
    'Film & Television Production',
    'Broadcasting (TV & Radio)',
    'Publishing (Books, Magazines, Newspapers)',
    'Music Industry',
    'Gaming & Interactive Entertainment',
    'Social Media',
    'Advertising & Public Relations',
    'Animation & Visual Effects (VFX)',
    'Podcasting & Digital Audio',
    'Live Events & Performing Arts',
  ],
  'Travel & Hospitality': [
    'Airlines & Aviation',
    'Hotels & Lodging',
    'Food & Beverage Services (Restaurants, Catering)',
    'Tour Operators & Travel Agencies',
    'Cruise Lines',
    'Online Travel Agencies (OTAs)',
    'Corporate Travel Management',
    'Events & MICE (Meetings, Incentives, Conferences, Exhibitions)',
    'Tourism Boards & Destination Marketing',
    'Ground Transportation (Rental Cars, Coaches)',
  ],
  'Manufacturing & Industry': [
    'Automotive Manufacturing',
    'Aerospace Manufacturing',
    'Chemical Manufacturing',
    'Electronics & Semiconductor Manufacturing',
    'Pharmaceutical Manufacturing',
    'Textile & Garment Manufacturing',
    'Heavy Machinery & Industrial Equipment',
    'Steel & Metals Production',
    'FMCG (Fast-Moving Consumer Goods) Manufacturing',
    'Industrial Design & Prototyping',
  ],
  'Human Resources & Workforce': [
    'Talent Acquisition & Recruitment',
    'Compensation & Benefits',
    'Training & Development',
    'Employee Relations & Labor Law',
    'Organizational Development',
    'HR Operations & Information Systems (HRIS)',
    'Performance Management',
    'Diversity, Equity & Inclusion (DEI)',
    'Workforce Planning & Analytics',
    'Occupational Health & Safety',
  ],
  'Legal & Governance': [
    'Corporate & Commercial Law',
    'Litigation & Dispute Resolution',
    'Intellectual Property (IP) Law',
    'Criminal Law',
    'Family Law',
    'Public Policy & Administration',
    'Government Affairs & Lobbying',
    'Regulatory Compliance',
    'Tax Law',
    'International Law & Diplomacy',
  ],
  'Space & Aerospace': [
    'Aeronautics (Aircraft Design)',
    'Astronautics (Spacecraft & Launch Systems)',
    'Satellite Communications',
    'Earth Observation & Remote Sensing',
    'Space Exploration & Astronomy',
    'Avionics & Control Systems',
    'Aerospace Manufacturing & Maintenance',
    'Space Policy & Law',
    'Propulsion Systems',
    'Ground Operations & Mission Control',
  ],
  'Defense & Security': [
    'Military Operations (Army, Navy, Air Force)',
    'Homeland Security',
    'Intelligence & Counter-Intelligence',
    'Cyberdefense',
    'Defense Contracting & Procurement',
    'Ordnance & Armaments',
    'Military Logistics & Support',
    'Border Control & Immigration',
    'Physical Security & Private Security Services',
    'Counter-Terrorism',
  ],
  'Fashion & Lifestyle': [
    'Apparel & Garment Design',
    'Textile Science & Production',
    'Fashion Merchandising & Buying',
    'Fashion Marketing & Branding',
    'Luxury Goods',
    'Cosmetics & Beauty Products',
    'Fragrances',
    'Jewelry & Accessories',
    'Footwear',
    'Wellness & Fitness (Spas, Gyms)',
  ],
  'Social Impact & Development': [
    'Non-Profit & NGO Management',
    'International Development',
    'Humanitarian Aid & Disaster Relief',
    'Poverty Alleviation & Economic Empowerment',
    'Human Rights Advocacy',
    'Community Development',
    'Microfinance',
    'Corporate Social Responsibility (CSR)',
    'Impact Investing',
    'Philanthropy & Grantmaking',
  ],
  'Climate & Sustainability': [
    'Climate Science & Modeling',
    'Environmental Policy & Law',
    'Conservation Biology',
    'Sustainable Business Practices (ESG)',
    'Circular Economy',
    'Carbon Management & Offsetting',
    'Sustainable Urban Planning',
    'Biodiversity & Ecosystem Management',
    'Green Finance & Investment',
    'Sustainability Reporting & Auditing',
  ],
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { country, state, district, region, domain, subDomain } = await req.json()

    // 1. Validate required fields
    if (!country || !state || !district || !domain || !subDomain) {
      return NextResponse.json(
        { error: 'Please provide all required location and domain details.' },
        { status: 400 }
      )
    }

    // 2. Validate domain and sub-domain against constant
    if (!DOMAINS[domain] || !DOMAINS[domain].includes(subDomain)) {
      return NextResponse.json(
        { error: 'Invalid domain or sub-domain selected' },
        { status: 400 }
      )
    }

    await connectDB()

    // 5. Fetch Real-World Context (Wikipedia & Nominatim) in Parallel
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      `${district}, ${state}, ${country}`
    )}&format=json&limit=1&addressdetails=1&extratags=1`
    
    const wikipediaUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      district
    )}`

    const [nominatimResult, wikipediaResult] = await Promise.allSettled([
      fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'AgentixApp/1.0',
          'Accept-Language': 'en',
        },
      }).then((r) => r.json()),
      fetch(wikipediaUrl, {
        headers: { Accept: 'application/json' },
      }).then((r) => r.json()),
    ])

    let nominatimContext = ''
    let wikipediaContext = ''

    if (nominatimResult.status === 'fulfilled') {
      const place = nominatimResult.value?.[0]
      if (place) {
        nominatimContext = `Place Type: ${place.type || 'N/A'}`
        if (place.extratags?.population) {
          nominatimContext += ` | Population: ${place.extratags.population}`
        }
        if (place.lat && place.lon) {
          nominatimContext += ` | Coordinates: ${place.lat}, ${place.lon}`
        }
      }
    }

    if (wikipediaResult.status === 'fulfilled') {
      const wikiData = wikipediaResult.value
      if (wikiData?.extract && !wikiData?.title?.includes('Not found')) {
        wikipediaContext = wikiData.extract.slice(0, 600)
      }
    }

    // Fallback Wikipedia (District + State) if initial search fails
    if (!wikipediaContext) {
      try {
        const fallbackUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          `${district}, ${state}`
        )}`
        const fallbackRes = await fetch(fallbackUrl, {
          headers: { Accept: 'application/json' },
        })
        const fallbackData = await fallbackRes.json()
        if (fallbackData?.extract) {
          wikipediaContext = fallbackData.extract.slice(0, 600)
        }
      } catch {
        // Silent fail
      }
    }

    // 6. Build locationContext string
    let locationContext = ''
    if (nominatimContext || wikipediaContext) {
      locationContext = `
REAL-WORLD LOCATION CONTEXT (use this to ground your problems):
${nominatimContext ? `Geographic Data: ${nominatimContext}` : ''}
${wikipediaContext ? `About This Location: ${wikipediaContext}` : ''}
`
    } else {
      locationContext = `
LOCATION CONTEXT: No additional data available. Use your training knowledge about ${district}, ${state}, ${country} to generate location-specific problems.
`
    }

    console.log('Nominatim context:', nominatimContext || 'empty')
    console.log('Wikipedia context:', wikipediaContext || 'empty')

    const systemPrompt = `You are an expert startup researcher and problem analyst with deep knowledge of real-world challenges across every industry and geography. Your specialty is identifying genuine, high-impact problems in specific locations that represent real startup or business opportunities. You generate structured, location-specific problem statements — never generic or globally applicable ones. You must return ONLY a valid JSON object. No markdown. No backticks. No explanation. No text before or after the JSON. Begin your response with { and end with }.`

    const userPrompt = `Analyze the following location and industry combination and generate exactly 5 real-world problem statements.

LOCATION:
- Country: ${country}
- State/Province: ${state}
- District/City: ${district}
- Region Type: ${region || 'Not specified'}

DOMAIN: ${domain}
SUB-DOMAIN: ${subDomain}

${locationContext}

STRICT REQUIREMENTS:
1. Each problem must be SPECIFIC to ${district} in ${state}, ${country} — use the real-world context provided above
2. If the context mentions specific communities, industries, infrastructure gaps, or local characteristics — reference them directly in your problems
3. Each problem must be directly related to ${subDomain} within ${domain}
4. Do NOT generate generic problems that could apply to any other location
5. Do NOT ignore the real-world context provided — it exists to make your output accurate
6. Generate EXACTLY 5 problems — no more, no less
7. Severity must be exactly one of: High, Medium, or Low
8. If context mentions population size, infrastructure quality, or economic conditions — reflect these in problem severity and affected group descriptions

Return this exact JSON structure with no deviations:
{
  "problems": [
    {
      "title": "Specific problem title referencing local context",
      "severity": "High",
      "affectedGroup": "Specific community or group in this location",
      "reason": "Why this exists based on real local conditions",
      "startupOpportunity": "Specific startup idea for this location",
      "monetization": "How the startup generates revenue here"
    },
    {
      "title": "...",
      "severity": "Medium",
      "affectedGroup": "...",
      "reason": "...",
      "startupOpportunity": "...",
      "monetization": "..."
    },
    {
      "title": "...",
      "severity": "Low",
      "affectedGroup": "...",
      "reason": "...",
      "startupOpportunity": "...",
      "monetization": "..."
    },
    {
      "title": "...",
      "severity": "High",
      "affectedGroup": "...",
      "reason": "...",
      "startupOpportunity": "...",
      "monetization": "..."
    },
    {
      "title": "...",
      "severity": "Medium",
      "affectedGroup": "...",
      "reason": "...",
      "startupOpportunity": "...",
      "monetization": "..."
    }
  ]
}`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
    })

    const raw = completion.choices[0]?.message?.content || ''
    let clean = raw
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()
    const firstBrace = clean.indexOf('{')
    const lastBrace = clean.lastIndexOf('}')
    if (firstBrace !== -1 && lastBrace !== -1) {
      clean = clean.slice(firstBrace, lastBrace + 1)
    }

    let result
    try {
      result = JSON.parse(clean)
    } catch {
      return NextResponse.json(
        { error: 'AI response could not be parsed. Please try again.' },
        { status: 422 }
      )
    }

    // 3. Post-parse validation
    if (!result.problems || !Array.isArray(result.problems) || result.problems.length !== 5) {
      return NextResponse.json(
        { error: 'AI did not return exactly 5 problems. Please try again.' },
        { status: 422 }
      )
    }

    const requiredFields = ['title', 'severity', 'affectedGroup', 'reason', 'startupOpportunity', 'monetization']
    for (const problem of result.problems) {
      for (const field of requiredFields) {
        if (!problem[field]) {
          return NextResponse.json(
            { error: 'AI returned incomplete problem data. Please try again.' },
            { status: 422 }
          )
        }
      }
    }

    // 4. Save to MongoDB
    const savedDoc = await ProblemFinderResult.create({
      userId: session.user.id,
      location: { country, state, district, region },
      domain,
      subDomain,
      problems: result.problems,
      generatedAt: new Date(),
    })

    return NextResponse.json({
      problems: result.problems,
      _id: savedDoc._id,
    })
  } catch (error) {
    console.error('Problem Finder Generate Error:', error)
    return NextResponse.json(
      { error: 'Internal server error during generation' },
      { status: 500 }
    )
  }
}
