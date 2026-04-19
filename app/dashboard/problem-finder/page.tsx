'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { Search, Copy, CheckCircle, Target } from 'lucide-react'

// --- CONSTANTS ---

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

const LOCATION_DATA: Record<string, {
  states: Record<string, {
    districts: string[]
    regions: string[]
  }>
}> = {
  'India': {
    states: {
      'Maharashtra': {
        districts: ['Mumbai','Pune','Nashik','Nagpur',
          'Aurangabad','Solapur','Kolhapur','Thane',
          'Raigad','Satara'],
        regions: ['Urban','Semi-Urban','Rural','Tribal'],
      },
      'Karnataka': {
        districts: ['Bengaluru','Mysuru','Hubli','Mangaluru',
          'Belagavi','Kalaburagi','Dharwad','Tumkur',
          'Shivamogga','Udupi'],
        regions: ['Urban','Semi-Urban','Rural','Tribal'],
      },
      'Tamil Nadu': {
        districts: ['Chennai','Coimbatore','Madurai','Tiruchirappalli',
          'Salem','Tirunelveli','Erode','Vellore',
          'Thoothukudi','Dindigul'],
        regions: ['Urban','Semi-Urban','Rural','Coastal'],
      },
      'Delhi': {
        districts: ['New Delhi','Central Delhi','North Delhi',
          'South Delhi','East Delhi','West Delhi',
          'North East Delhi','South West Delhi',
          'Shahdara','North West Delhi'],
        regions: ['Urban','Semi-Urban'],
      },
      'Gujarat': {
        districts: ['Ahmedabad','Surat','Vadodara','Rajkot',
          'Bhavnagar','Jamnagar','Gandhinagar','Anand',
          'Mehsana','Kutch'],
        regions: ['Urban','Semi-Urban','Rural','Coastal'],
      },
      'Rajasthan': {
        districts: ['Jaipur','Jodhpur','Udaipur','Kota',
          'Bikaner','Ajmer','Alwar','Bharatpur',
          'Sikar','Pali'],
        regions: ['Urban','Semi-Urban','Rural','Desert'],
      },
      'Uttar Pradesh': {
        districts: ['Lucknow','Kanpur','Agra','Varanasi',
          'Prayagraj','Meerut','Ghaziabad','Noida',
          'Mathura','Gorakhpur'],
        regions: ['Urban','Semi-Urban','Rural'],
      },
      'West Bengal': {
        districts: ['Kolkata','Howrah','Darjeeling','Siliguri',
          'Durgapur','Asansol','Bardhaman','Malda',
          'Murshidabad','Nadia'],
        regions: ['Urban','Semi-Urban','Rural','Coastal'],
      },
      'Kerala': {
        districts: ['Thiruvananthapuram','Kochi','Kozhikode',
          'Thrissur','Kollam','Kannur','Alappuzha',
          'Palakkad','Malappuram','Idukki'],
        regions: ['Urban','Semi-Urban','Rural','Coastal'],
      },
      'Telangana': {
        districts: ['Hyderabad','Warangal','Karimnagar',
          'Nizamabad','Khammam','Mahbubnagar','Nalgonda',
          'Adilabad','Rangareddy','Medak'],
        regions: ['Urban','Semi-Urban','Rural','Tribal'],
      },
      'Punjab': {
        districts: ['Ludhiana','Amritsar','Jalandhar','Patiala',
          'Bathinda','Mohali','Hoshiarpur','Gurdaspur',
          'Firozpur','Faridkot'],
        regions: ['Urban','Semi-Urban','Rural'],
      },
      'Bihar': {
        districts: ['Patna','Gaya','Bhagalpur','Muzaffarpur',
          'Darbhanga','Arrah','Begusarai','Katihar',
          'Munger','Chapra'],
        regions: ['Urban','Semi-Urban','Rural'],
      },
      'Madhya Pradesh': {
        districts: ['Bhopal','Indore','Gwalior','Jabalpur',
          'Ujjain','Sagar','Rewa','Satna',
          'Ratlam','Dewas'],
        regions: ['Urban','Semi-Urban','Rural','Tribal'],
      },
      'Andhra Pradesh': {
        districts: ['Visakhapatnam','Vijayawada','Guntur','Tirupati',
          'Kurnool','Kadapa','Nellore','Anantapur',
          'Kakinada','Eluru'],
        regions: ['Urban','Semi-Urban','Rural','Coastal'],
      },
      'Odisha': {
        districts: ['Bhubaneswar','Cuttack','Rourkela','Puri',
          'Sambalpur','Berhampur','Balasore','Baripada',
          'Koraput','Sundargarh'],
        regions: ['Urban','Semi-Urban','Rural','Tribal','Coastal'],
      },
    },
  },
  'United States': {
    states: {
      'California': {
        districts: ['Los Angeles','San Francisco','San Diego',
          'San Jose','Sacramento','Fresno',
          'Oakland','Bakersfield','Anaheim','Riverside'],
        regions: ['Urban','Suburban','Rural'],
      },
      'Texas': {
        districts: ['Houston','Dallas','Austin','San Antonio',
          'Fort Worth','El Paso','Arlington','Plano',
          'Corpus Christi','Laredo'],
        regions: ['Urban','Suburban','Rural'],
      },
      'New York': {
        districts: ['New York City','Buffalo','Rochester','Albany',
          'Syracuse','Yonkers','White Plains','Utica',
          'Schenectady','Binghamton'],
        regions: ['Urban','Suburban','Rural'],
      },
      'Florida': {
        districts: ['Miami','Orlando','Tampa','Jacksonville',
          'Fort Lauderdale','Tallahassee','St. Petersburg',
          'Hialeah','Gainesville','Cape Coral'],
        regions: ['Urban','Suburban','Rural','Coastal'],
      },
      'Illinois': {
        districts: ['Chicago','Aurora','Naperville','Joliet',
          'Rockford','Springfield','Peoria','Elgin',
          'Waukegan','Champaign'],
        regions: ['Urban','Suburban','Rural'],
      },
      'Washington': {
        districts: ['Seattle','Spokane','Tacoma','Vancouver',
          'Bellevue','Everett','Renton','Kirkland',
          'Bellingham','Kennewick'],
        regions: ['Urban','Suburban','Rural'],
      },
      'Georgia': {
        districts: ['Atlanta','Augusta','Columbus','Savannah',
          'Athens','Sandy Springs','Roswell','Macon',
          'Johns Creek','Albany'],
        regions: ['Urban','Suburban','Rural'],
      },
      'Massachusetts': {
        districts: ['Boston','Worcester','Springfield','Cambridge',
          'Lowell','Brockton','New Bedford','Quincy',
          'Lynn','Fall River'],
        regions: ['Urban','Suburban','Rural','Coastal'],
      },
      'Colorado': {
        districts: ['Denver','Colorado Springs','Aurora','Fort Collins',
          'Lakewood','Thornton','Arvada','Westminster',
          'Pueblo','Boulder'],
        regions: ['Urban','Suburban','Rural'],
      },
      'Arizona': {
        districts: ['Phoenix','Tucson','Mesa','Chandler',
          'Scottsdale','Glendale','Gilbert','Tempe',
          'Peoria','Surprise'],
        regions: ['Urban','Suburban','Rural'],
      },
    },
  },
  'United Kingdom': {
    states: {
      'England': {
        districts: ['London','Manchester','Birmingham','Leeds',
          'Liverpool','Bristol','Sheffield','Newcastle',
          'Nottingham','Leicester'],
        regions: ['Urban','Suburban','Rural','Coastal'],
      },
      'Scotland': {
        districts: ['Edinburgh','Glasgow','Aberdeen','Dundee',
          'Inverness','Stirling','Perth','Falkirk',
          'Livingston','Dunfermline'],
        regions: ['Urban','Rural','Coastal','Highland'],
      },
      'Wales': {
        districts: ['Cardiff','Swansea','Newport','Wrexham',
          'Barry','Neath','Merthyr Tydfil','Rhondda',
          'Bridgend','Llanelli'],
        regions: ['Urban','Rural','Coastal'],
      },
      'Northern Ireland': {
        districts: ['Belfast','Derry','Lisburn','Newry',
          'Armagh','Ballymena','Coleraine','Newtownabbey',
          'Carrickfergus','Omagh'],
        regions: ['Urban','Rural','Coastal'],
      },
    },
  },
  'Nigeria': {
    states: {
      'Lagos': {
        districts: ['Lagos Island','Lagos Mainland','Ikeja',
          'Lekki','Surulere','Apapa','Mushin',
          'Oshodi','Alimosho','Ikorodu'],
        regions: ['Urban','Semi-Urban','Coastal'],
      },
      'Abuja (FCT)': {
        districts: ['Central Area','Garki','Wuse','Maitama',
          'Asokoro','Gwarinpa','Kubwa','Nyanya',
          'Kuje','Gwagwalada'],
        regions: ['Urban','Semi-Urban','Rural'],
      },
      'Kano': {
        districts: ['Kano Municipal','Fagge','Dala','Gwale',
          'Tarauni','Nassarawa','Ungogo','Kumbotso',
          'Dawakin Tofa','Wudil'],
        regions: ['Urban','Semi-Urban','Rural'],
      },
      'Rivers': {
        districts: ['Port Harcourt','Obio-Akpor','Okrika',
          'Eleme','Tai','Gokana','Khana',
          'Oyigbo','Etche','Ogu-Bolo'],
        regions: ['Urban','Semi-Urban','Coastal'],
      },
      'Oyo': {
        districts: ['Ibadan','Ogbomoso','Oyo','Iseyin',
          'Saki','Lanlate','Igbo-Ora','Fiditi',
          'Eruwa','Okeho'],
        regions: ['Urban','Semi-Urban','Rural'],
      },
      'Kaduna': {
        districts: ['Kaduna','Zaria','Kafanchan','Saminaka',
          'Birnin Gwari','Kachia','Kauru','Lere',
          'Makarfi','Sabon Gari'],
        regions: ['Urban','Semi-Urban','Rural'],
      },
      'Enugu': {
        districts: ['Enugu','Nsukka','Agbani','Oji River',
          'Awgu','Udi','Igbo-Eze','Nkanu',
          'Isi-Uzo','Ezeagu'],
        regions: ['Urban','Semi-Urban','Rural'],
      },
      'Delta': {
        districts: ['Asaba','Warri','Sapele','Ughelli',
          'Agbor','Abraka','Kwale','Oleh',
          'Ozoro','Ogwashi-Uku'],
        regions: ['Urban','Semi-Urban','Rural','Coastal'],
      },
      'Anambra': {
        districts: ['Awka','Onitsha','Nnewi','Ekwulobia',
          'Aguata','Ogidi','Ihiala','Otuocha',
          'Agulu','Ukpo'],
        regions: ['Urban','Semi-Urban','Rural'],
      },
      'Imo': {
        districts: ['Owerri','Orlu','Okigwe','Mbaise',
          'Oguta','Ideato','Ikeduru','Mbano',
          'Ngor Okpala','Njaba'],
        regions: ['Urban','Semi-Urban','Rural'],
      },
    },
  },
  'Brazil': {
    states: {
      'São Paulo': {
        districts: ['São Paulo City','Campinas','Santos','Ribeirão Preto',
          'Sorocaba','São Bernardo','Guarulhos','Osasco',
          'Bauru','São José dos Campos'],
        regions: ['Urban','Rural','Coastal'],
      },
      'Rio de Janeiro': {
        districts: ['Rio de Janeiro City','Niterói','Nova Iguaçu',
          'Duque de Caxias','Petrópolis','Volta Redonda',
          'Campos','Macaé','Cabo Frio','Angra dos Reis'],
        regions: ['Urban','Rural','Coastal'],
      },
      'Minas Gerais': {
        districts: ['Belo Horizonte','Uberlândia','Contagem',
          'Juiz de Fora','Betim','Montes Claros',
          'Ribeirão das Neves','Uberaba','Governador Valadares','Ipatinga'],
        regions: ['Urban','Rural'],
      },
      'Bahia': {
        districts: ['Salvador','Feira de Santana','Vitória da Conquista',
          'Camaçari','Itabuna','Juazeiro',
          'Lauro de Freitas','Ilhéus','Jequié','Alagoinhas'],
        regions: ['Urban','Rural','Coastal'],
      },
      'Paraná': {
        districts: ['Curitiba','Londrina','Maringá','Ponta Grossa',
          'Cascavel','São José dos Pinhais','Foz do Iguaçu',
          'Colombo','Guarapuava','Paranaguá'],
        regions: ['Urban','Rural','Coastal'],
      },
      'Rio Grande do Sul': {
        districts: ['Porto Alegre','Caxias do Sul','Pelotas',
          'Canoas','Santa Maria','Gravataí',
          'Viamão','Novo Hamburgo','São Leopoldo','Rio Grande'],
        regions: ['Urban','Rural','Coastal'],
      },
      'Ceará': {
        districts: ['Fortaleza','Caucaia','Juazeiro do Norte',
          'Maracanaú','Sobral','Crato',
          'Itapipoca','Maranguape','Iguatu','Quixadá'],
        regions: ['Urban','Rural','Coastal'],
      },
      'Pernambuco': {
        districts: ['Recife','Caruaru','Petrolina','Olinda',
          'Paulista','Jaboatão','Garanhuns',
          'Cabo de Santo Agostinho','Santa Cruz do Capibaribe','Vitória de Santo Antão'],
        regions: ['Urban','Rural','Coastal'],
      },
      'Amazonas': {
        districts: ['Manaus','Parintins','Itacoatiara','Manacapuru',
          'Coari','Tefé','Maués','Humaitá',
          'São Gabriel da Cachoeira','Presidente Figueiredo'],
        regions: ['Urban','Rural','Amazon Region'],
      },
      'Goiás': {
        districts: ['Goiânia','Aparecida de Goiânia','Anápolis',
          'Rio Verde','Luziânia','Águas Lindas',
          'Valparaíso','Trindade','Formosa','Novo Gama'],
        regions: ['Urban','Rural'],
      },
    },
  },
  'Indonesia': {
    states: {
      'Java': {
        districts: ['Jakarta','Surabaya','Bandung','Semarang',
          'Yogyakarta','Malang','Solo','Depok',
          'Tangerang','Bekasi'],
        regions: ['Urban','Rural'],
      },
      'Bali': {
        districts: ['Denpasar','Kuta','Ubud','Singaraja',
          'Gianyar','Tabanan','Bangli','Klungkung',
          'Karangasem','Negara'],
        regions: ['Urban','Rural','Coastal'],
      },
      'Sumatra': {
        districts: ['Medan','Palembang','Pekanbaru','Padang',
          'Banda Aceh','Jambi','Bengkulu','Bandar Lampung',
          'Pangkal Pinang','Tanjung Pinang'],
        regions: ['Urban','Rural','Coastal'],
      },
      'Kalimantan': {
        districts: ['Balikpapan','Banjarmasin','Samarinda','Pontianak',
          'Palangka Raya','Tarakan','Bontang','Singkawang',
          'Kotabaru','Sampit'],
        regions: ['Urban','Rural','Remote'],
      },
      'Sulawesi': {
        districts: ['Makassar','Manado','Palu','Kendari',
          'Gorontalo','Parepare','Palopo','Bitung',
          'Tomohon','Kotamobagu'],
        regions: ['Urban','Rural','Coastal'],
      },
      'Papua': {
        districts: ['Jayapura','Sorong','Manokwari','Timika',
          'Merauke','Biak','Nabire','Fakfak',
          'Wamena','Serui'],
        regions: ['Urban','Rural','Remote'],
      },
      'Lombok': {
        districts: ['Mataram','Praya','Selong','Gerung',
          'Tanjung','Bayan','Aikmel','Kopang',
          'Pemenang','Lembar'],
        regions: ['Urban','Rural','Coastal'],
      },
      'Flores': {
        districts: ['Ende','Maumere','Ruteng','Labuan Bajo',
          'Bajawa','Reo','Mbay','Maurole',
          'Adonara','Riung'],
        regions: ['Rural','Coastal','Remote'],
      },
    },
  },
}

const LOADING_MESSAGES = [
  'Analyzing geographic context…',
  'Researching local challenges…',
  'Identifying domain-specific problems…',
  'Evaluating startup opportunities…',
  'Structuring 5 problem statements…',
]

// --- STYLES ---

const s: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex', minHeight: '100vh',
    background: '#060A0F',
    fontFamily: "'DM Sans', sans-serif",
    color: '#E8EDF5',
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    overflow: 'hidden', marginLeft: 'var(--sidebar-w)',
  },
  body: { flex: 1, overflowY: 'auto', padding: '32px' },
  card: {
    background: '#0C1018',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 4,
  },
  input: {
    width: '100%', background: '#060A0F',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 4, padding: '10px 14px',
    color: '#E8EDF5', fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  label: {
    display: 'block', fontSize: 12, color: '#6B7A91',
    fontFamily: "'Space Mono', monospace",
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em', marginBottom: 8,
  },
  btn: {
    padding: '10px 24px', borderRadius: 4, border: 'none',
    cursor: 'pointer', fontFamily: "'Space Mono', monospace",
    fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
    transition: 'all 0.2s',
  },
  btnGreen:   { background: '#00F5A0', color: '#060A0F' },
  btnOutline: {
    background: 'transparent', color: '#6B7A91',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  tag: {
    fontFamily: "'Space Mono', monospace", fontSize: 10,
    padding: '3px 10px', borderRadius: 2,
    letterSpacing: '0.08em', fontWeight: 700,
  },
}

// --- INTERFACES ---

interface Problem {
  title: string
  severity: 'High' | 'Medium' | 'Low'
  affectedGroup: string
  reason: string
  startupOpportunity: string
  monetization: string
}

interface HistoryItem {
  _id: string
  location: {
    country: string
    state: string
    district: string
    region?: string
  }
  domain: string
  subDomain: string
  problems: Problem[]
  generatedAt: string
}

// --- MAIN COMPONENT ---

export default function ProblemFinderPage() {
  const [step, setStep] = useState<'form' | 'results'>('form')
  const [loading, setLoading] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [error, setError] = useState('')
  const [problems, setProblems] = useState<Problem[] | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [selectedProblem, setSelectedProblem] = useState<{ id: string; index: number } | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Location
  const [country, setCountry] = useState('')
  const [stateVal, setStateVal] = useState('')
  const [district, setDistrict] = useState('')
  const [region, setRegion] = useState('')

  // Domain
  const [domain, setDomain] = useState('')
  const [subDomain, setSubDomain] = useState('')

  // Derived Values
  const countriesList = Object.keys(LOCATION_DATA)
  const statesList = country ? Object.keys(LOCATION_DATA[country]?.states || {}) : []
  const districtsList = stateVal ? LOCATION_DATA[country]?.states[stateVal]?.districts || [] : []
  const regionsList = district ? LOCATION_DATA[country]?.states[stateVal]?.regions || [] : []
  const subDomainsList = domain ? DOMAINS[domain] || [] : []

  // Effects
  useEffect(() => {
    if (regionsList.length === 1) setRegion(regionsList[0])
    else if (regionsList.length === 0) setRegion('')
  }, [district, stateVal, country])

  useEffect(() => {
    setStateVal(''); setDistrict(''); setRegion('')
  }, [country])

  useEffect(() => {
    setDistrict(''); setRegion('')
  }, [stateVal])

  useEffect(() => {
    setSubDomain('')
  }, [domain])

  useEffect(() => {
    fetch('/api/problem-finder/history')
      .then(r => r.json())
      .then(d => setHistory(d.history || []))
      .catch(() => {})

    fetch('/api/user/selected-problem')
      .then(r => r.json())
      .then(d => {
        if (d.problem) {
          setSelectedProblem({ id: d.problem.resultId, index: d.problem.index })
        }
      })
      .catch(() => {})
  }, [])

  // Handlers
  const handleGenerate = async () => {
    if (!country || !stateVal || !district || !domain || !subDomain) {
      setError('Please complete all required selections.')
      return
    }

    setLoading(true)
    setError('')
    
    let msgIndex = 0
    setLoadingMsg(LOADING_MESSAGES[0])
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length
      setLoadingMsg(LOADING_MESSAGES[msgIndex])
    }, 2000)

    try {
      const res = await fetch('/api/problem-finder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country, state: stateVal, district, region,
          domain, subDomain,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Generation failed. Try again.')
        return
      }

      setProblems(data.problems)
      setActiveHistoryId(data._id)
      setStep('results')

      setHistory(prev => [{
        _id: data._id,
        location: { country, state: stateVal, district, region },
        domain, subDomain,
        problems: data.problems,
        generatedAt: new Date().toISOString(),
      }, ...prev])

    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }

  const handleRegenerate = () => {
    setStep('form')
    setProblems(null)
    setError('')
  }

  const loadFromHistory = (item: HistoryItem) => {
    setProblems(item.problems)
    setActiveHistoryId(item._id)
    setCountry(item.location.country)
    setStateVal(item.location.state)
    setDistrict(item.location.district)
    setRegion(item.location.region || '')
    setDomain(item.domain)
    setSubDomain(item.subDomain)
    setStep('results')
  }

  const handleSelectProblem = async (problem: Problem, index: number) => {
    if (!activeHistoryId) return

    try {
      const res = await fetch('/api/user/selected-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: activeHistoryId, index }),
      })

      if (res.ok) {
        setSelectedProblem({ id: activeHistoryId, index })
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Failed to select problem:', err)
    }
  }

  const copyProblem = (problem: Problem, index: number) => {
    const text = 
      `PROBLEM ${index + 1}: ${problem.title}\n` +
      `Severity: ${problem.severity}\n` +
      `Affected Group: ${problem.affectedGroup}\n` +
      `Why it exists: ${problem.reason}\n` +
      `Startup Opportunity: ${problem.startupOpportunity}\n` +
      `Monetization: ${problem.monetization}`
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const getSeverityColor = (severity: string) => {
    if (severity === 'High') return '#FF6B35'
    if (severity === 'Medium') return '#FFB800'
    return '#00F5A0'
  }

  const getSeverityBg = (severity: string) => {
    if (severity === 'High') return 'rgba(255,107,53,0.12)'
    if (severity === 'Medium') return 'rgba(255,184,0,0.12)'
    return 'rgba(0,245,160,0.12)'
  }

  return (
    <div style={s.page}>
      <Sidebar />
      <div style={s.main}>
        <TopBar title="Problem Finder AI" subtitle="Discover location-specific startup opportunities" />
        
        <div style={s.body}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            
            {/* LEFT PANEL */}
            <div style={{ width: 260, flexShrink: 0 }}>
              <button 
                style={{ ...s.btn, ...s.btnGreen, width: '100%', marginBottom: 16 }}
                onClick={handleRegenerate}
              >
                + New Search
              </button>

              <div style={{ 
                fontFamily: "'Space Mono',monospace", fontSize: 10,
                color: '#6B7A91', textTransform: 'uppercase',
                letterSpacing: '0.1em', marginBottom: 12 
              }}>
                Recent Searches
              </div>

              {history.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', padding: '24px 12px',
                  color: '#6B7A91', fontSize: 11,
                  fontFamily: "'Space Mono',monospace" 
                }}>
                  No searches yet.<br />Start by selecting<br />a location and domain.
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item._id}
                    onClick={() => loadFromHistory(item)}
                    style={{ 
                      ...s.card, padding: '12px 16px', cursor: 'pointer',
                      marginBottom: 8, transition: 'all 0.15s',
                      border: activeHistoryId === item._id 
                        ? '1px solid rgba(0,245,160,0.4)'
                        : '1px solid rgba(255,255,255,0.07)',
                      background: activeHistoryId === item._id
                        ? 'rgba(0,245,160,0.04)' : '#0C1018',
                    }}
                  >
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 600, color: '#E8EDF5', marginBottom: 2 }}>
                      {item.domain}
                    </div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#6B7A91', marginBottom: 4 }}>
                      {item.subDomain}
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7A91' }}>
                      {item.location.district}, {item.location.state}
                    </div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#6B7A91', marginTop: 4 }}>
                      {new Date(item.generatedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* RIGHT PANEL */}
            <div style={{ flex: 1, minWidth: 0 }}>
              
              {step === 'form' && (
                <div style={{ ...s.card, padding: 36 }}>
                  <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#E8EDF5' }}>
                    Find Real Problems
                  </h2>
                  <p style={{ fontSize: 13, color: '#6B7A91', lineHeight: 1.7, marginBottom: 32 }}>
                    Select a location and domain to discover 5 high-impact, location-specific problems with startup opportunity potential.
                  </p>

                  {/* SECTION 1: LOCATION */}
                  <div style={{ 
                    fontFamily: "'Space Mono',monospace", fontSize: 11,
                    color: '#00F5A0', textTransform: 'uppercase',
                    letterSpacing: '0.1em', marginBottom: 16,
                    paddingBottom: 10,
                    borderBottom: '1px solid rgba(255,255,255,0.05)' 
                  }}>
                    📍 Location
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={s.label}>Country *</label>
                      <select 
                        style={s.input}
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      >
                        <option value="">Select Country</option>
                        {countriesList.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={s.label}>State / Province *</label>
                      <select 
                        style={{ ...s.input, opacity: !country ? 0.4 : 1 }}
                        disabled={!country}
                        value={stateVal}
                        onChange={(e) => setStateVal(e.target.value)}
                      >
                        <option value="">{country ? 'Select State' : 'Select country first'}</option>
                        {statesList.map(st => <option key={st} value={st}>{st}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={s.label}>District / City *</label>
                      <select 
                        style={{ ...s.input, opacity: !stateVal ? 0.4 : 1 }}
                        disabled={!stateVal}
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                      >
                        <option value="">{stateVal ? 'Select District' : 'Select state first'}</option>
                        {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div>
                      {district && regionsList.length > 1 ? (
                        <>
                          <label style={s.label}>Region Type</label>
                          <select 
                            style={s.input}
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                          >
                            <option value="">Select Region</option>
                            {regionsList.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </>
                      ) : (
                        district && regionsList.length === 1 && (
                          <div style={{ marginTop: 24 }}>
                            <div style={{ fontSize: 11, color: '#6B7A91', fontFamily: "'Space Mono',monospace" }}>
                              Region: {regionsList[0]} (auto-selected)
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* SECTION 2: DOMAIN */}
                  <div style={{ 
                    marginTop: 28, fontFamily: "'Space Mono',monospace", fontSize: 11,
                    color: '#00F5A0', textTransform: 'uppercase',
                    letterSpacing: '0.1em', marginBottom: 16,
                    paddingBottom: 10,
                    borderBottom: '1px solid rgba(255,255,255,0.05)' 
                  }}>
                    🧩 Domain & Sub-domain
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label style={s.label}>Domain *</label>
                      <select 
                        style={s.input}
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                      >
                        <option value="">Select Domain (19 available)</option>
                        {Object.keys(DOMAINS).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={s.label}>Sub-domain *</label>
                      <select 
                        style={{ ...s.input, opacity: !domain ? 0.4 : 1 }}
                        disabled={!domain}
                        value={subDomain}
                        onChange={(e) => setSubDomain(e.target.value)}
                      >
                        <option value="">{domain ? `Select Sub-domain (10 available)` : 'Select domain first'}</option>
                        {subDomainsList.map(sd => <option key={sd} value={sd}>{sd}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* SUMMARY CHIPS */}
                  {country && stateVal && district && domain && subDomain && (
                    <div style={{ 
                      background: 'rgba(0,245,160,0.04)',
                      border: '1px solid rgba(0,245,160,0.15)',
                      borderRadius: 4, padding: '14px 18px',
                      marginTop: 20, marginBottom: 4,
                      display: 'flex', flexWrap: 'wrap', gap: 8,
                      alignItems: 'center' 
                    }}>
                      <div style={{ ...s.tag, background: 'rgba(0,245,160,0.1)', color: '#00F5A0', border: '1px solid rgba(0,245,160,0.2)' }}>
                        📍 {district}, {stateVal}, {country}
                      </div>
                      {region && (
                        <div style={{ ...s.tag, background: 'rgba(0,245,160,0.1)', color: '#00F5A0', border: '1px solid rgba(0,245,160,0.2)' }}>
                          🏘️ {region}
                        </div>
                      )}
                      <div style={{ ...s.tag, background: 'rgba(0,245,160,0.1)', color: '#00F5A0', border: '1px solid rgba(0,245,160,0.2)' }}>
                        🧩 {domain}
                      </div>
                      <div style={{ ...s.tag, background: 'rgba(0,245,160,0.1)', color: '#00F5A0', border: '1px solid rgba(0,245,160,0.2)' }}>
                        ⚡ {subDomain}
                      </div>
                    </div>
                  )}

                  {showSuccess && (
                    <div style={{ 
                      background: 'rgba(0,245,160,0.08)',
                      border: '1px solid rgba(0,245,160,0.3)',
                      borderRadius: 4, padding: '12px 16px',
                      marginTop: 16, color: '#00F5A0',
                      fontSize: 13, display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center' 
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle size={16} /> Problem selected successfully! This context will now be used across your dashboard.
                      </span>
                      <button onClick={() => setShowSuccess(false)} style={{ background:'none', border:'none', color:'#00F5A0', cursor:'pointer', fontSize:18 }}>×</button>
                    </div>
                  )}

                  {/* ERROR DISPLAY */}
                  {error && (
                    <div style={{ 
                      background: 'rgba(255,107,53,0.08)',
                      border: '1px solid rgba(255,107,53,0.2)',
                      borderRadius: 4, padding: '12px 16px',
                      marginTop: 16, color: '#FF6B35',
                      fontSize: 13, display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center' 
                    }}>
                      <span>{error}</span>
                      <button onClick={() => setError('')} style={{ background:'none', border:'none', color:'#FF6B35', cursor:'pointer', fontSize:18 }}>×</button>
                    </div>
                  )}

                  {/* LOADING STATE */}
                  {loading && (
                    <div style={{ marginTop: 24, textAlign: 'center', padding: '20px 0' }}>
                      <div style={{ fontSize:13, color:'#00F5A0', fontFamily:"'Space Mono',monospace", marginBottom:16 }}>
                        {loadingMsg}
                      </div>
                      <div style={{ height:4, background:'rgba(255,255,255,0.07)', borderRadius:2, overflow:'hidden' }}>
                        <div style={{ height:'100%', background:'#00F5A0', borderRadius:2, animation:'progress 10s linear forwards' }} />
                      </div>
                    </div>
                  )}

                  <button 
                    style={{ 
                      ...s.btn, ...s.btnGreen, width: '100%', padding: '14px 24px',
                      fontSize: 13, marginTop: 24,
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer' 
                    }}
                    disabled={loading}
                    onClick={handleGenerate}
                  >
                    {loading ? loadingMsg : '🔍 Find 5 Problems'}
                  </button>
                </div>
              )}

              {step === 'results' && problems && (
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
                    <div>
                      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, marginBottom:8 }}>5 Problems Found</h2>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ ...s.tag, background: 'rgba(0,245,160,0.1)', color: '#00F5A0', border: '1px solid rgba(0,245,160,0.2)' }}>
                          📍 {district}, {stateVal}, {country}
                        </div>
                        {region && (
                        <div style={{ ...s.tag, background: 'rgba(0,245,160,0.1)', color: '#00F5A0', border: '1px solid rgba(0,245,160,0.2)' }}>
                          🏘️ {region}
                        </div>
                        )}
                        <div style={{ ...s.tag, background: 'rgba(0,245,160,0.1)', color: '#00F5A0', border: '1px solid rgba(0,245,160,0.2)' }}>
                          🧩 {domain}
                        </div>
                        <div style={{ ...s.tag, background: 'rgba(0,245,160,0.1)', color: '#00F5A0', border: '1px solid rgba(0,245,160,0.2)' }}>
                          ⚡ {subDomain}
                        </div>
                      </div>
                    </div>
                    <button style={{ ...s.btn, ...s.btnOutline }} onClick={handleRegenerate}>
                      🔄 Change & Regenerate
                    </button>
                  </div>

                  {problems.map((p, idx) => {
                    const sevColor = getSeverityColor(p.severity)
                    return (
                      <div 
                        key={idx}
                        style={{
                          ...s.card, padding:28, marginBottom:16,
                          borderLeft: `3px solid ${sevColor}`,
                          animation: `fadeIn 0.4s ease ${idx * 0.1}s both`,
                        }}
                      >
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'#6B7A91', marginBottom:6 }}>
                              PROBLEM 0{idx + 1}
                            </div>
                            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, lineHeight:1.4, color:'#E8EDF5', maxWidth:'90%' }}>
                              {p.title}
                            </h3>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <div style={{ 
                              ...s.tag, background: getSeverityBg(p.severity), color: sevColor, 
                              border: `1px solid ${sevColor}33`, marginBottom:8, minWidth: 100, textAlign: 'center' 
                            }}>
                              {p.severity} Severity
                            </div>
                            {selectedProblem?.id === activeHistoryId && selectedProblem?.index === idx ? (
                              <div style={{ 
                                ...s.tag, background: 'rgba(0,245,160,0.1)', color: '#00F5A0', 
                                border: '1px solid rgba(0,245,160,0.3)', marginBottom:8, minWidth: 120, 
                                textAlign: 'center', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center'
                              }}>
                                <CheckCircle size={10} /> Active Problem
                              </div>
                            ) : (
                              <button 
                                style={{ ...s.btn, ...s.btnGreen, fontSize:10, padding:'4px 12px', marginBottom:8, width: 120, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                                onClick={() => handleSelectProblem(p, idx)}
                              >
                                <Target size={10} /> Select This
                              </button>
                            )}
                            <button 
                              style={{ ...s.btn, ...s.btnOutline, fontSize:10, padding:'4px 12px', display:'flex', alignItems:'center', gap:4, width: 120, justifyContent: 'center' }}
                              onClick={() => copyProblem(p, idx)}
                            >
                              <Copy size={10} /> {copiedIndex === idx ? 'Copied!' : 'Copy Info'}
                            </button>
                          </div>
                        </div>

                        <div style={{ background:'#060A0F', borderRadius:4, padding:'10px 14px', marginBottom:10 }}>
                          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'#6B7A91', marginBottom:4 }}>👥 AFFECTED GROUP</div>
                          <div style={{ fontSize:13, color:'#E8EDF5', lineHeight:1.6 }}>{p.affectedGroup}</div>
                        </div>

                        <div style={{ background:'#060A0F', borderRadius:4, padding:'10px 14px', marginBottom:10 }}>
                          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'#6B7A91', marginBottom:4 }}>🔍 WHY IT EXISTS</div>
                          <div style={{ fontSize:13, color:'#6B7A91', lineHeight:1.7 }}>{p.reason}</div>
                        </div>

                        <div style={{ background:'rgba(0,245,160,0.04)', border:'1px solid rgba(0,245,160,0.12)', borderRadius:4, padding:'10px 14px', marginBottom:10 }}>
                          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'#00F5A0', marginBottom:4 }}>💡 STARTUP OPPORTUNITY</div>
                          <div style={{ fontSize:13, color:'#E8EDF5', lineHeight:1.7 }}>{p.startupOpportunity}</div>
                        </div>

                        <div style={{ background:'rgba(123,92,255,0.04)', border:'1px solid rgba(123,92,255,0.12)', borderRadius:4, padding:'10px 14px' }}>
                          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:'#7B5CFF', marginBottom:4 }}>💰 MONETIZATION</div>
                          <div style={{ fontSize:13, color:'#E8EDF5', lineHeight:1.7 }}>{p.monetization}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes progress { from { width: 0% } to { width: 100% } }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        select option { background: #0C1018; color: #E8EDF5; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #060A0F; }
        ::-webkit-scrollbar-thumb {
          background: rgba(0,245,160,0.3);
          border-radius: 2px;
        }
      `}</style>
    </div>
  )
}
