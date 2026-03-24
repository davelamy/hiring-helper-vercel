const RESUME = `
Dave Lamy — Engineering Leader, Boulder CO
davelamy@gmail.com | +1 303-993-9634

SUMMARY
Award-winning software engineering leader with 25+ years of experience driving technical innovation and building high-performing teams. Led engineering organizations through acquisitions, rapid growth, and multiple platform generations — acting as both hands-on principal engineer and leader across multiple domains, especially fintech. Deeply invested in AI-driven development as a force multiplier for engineering teams, actively using Claude Code and Cursor. Looking to bring that mindset to a forward-thinking organization where great engineering and great culture reinforce each other.

KEY EXPERIENCE

AbodeMine (2025–2026) — VP of Engineering
SaaS real estate data intelligence: subscription data API + investment portfolio management platform for institutional firms.
- Established data pipeline integrating multiple third-party sources into BigQuery with DBT transformations
- Redefined primary SaaS API enabling highly customizable filters and selectable datasets
- Oversaw migration from Postgres to ClickHouse for dynamic filtering with sub-500ms response SLAs
- Promoted to VP after one month based on impact and leadership
- Led engineering team direction, scoping, prioritization, development cadence, ritual leadership, performance management
- Partnered with product to define features and feasible scope
- Drove code generation evolution from AI-assisted to predominantly AI-generated using Claude Code and Cursor

TIFIN AMP (2021–2025) — Staff Software Engineer
Unifies large financial datasets and builds ML models for asset management, delivering insights via custom Salesforce components.
- Designed and implemented current AMP software architecture, reducing data processing time by 80%+, tripling dev/test cycle efficiency
- Built microservice architecture for VPC-constrained tasks in ECS based on dynamic inputs, integrated with Airflow
- Owned internal GraphQL API and supported front-end development
- Developed DBT + DuckDB data transformation pipeline for dashboard metrics
- Actively mentored junior developers; extensive code review
- Led deep Salesforce integration work

Floify (2017–2021) — Director of Engineering / Lead Engineer
B2B2C mortgage loan point-of-sale SaaS.
- Drove modernization of legacy architecture; build vs. buy strategy contributions to exec planning
- Built and managed happy, empowered engineering team
- Designed, developed, and tested core features on Java backend
- Primary technical interface for all Tier 1 customers
- Led engineering through 10x transaction growth over 9 months during COVID
- Company acquired October 2021

Levels Beyond (2007–2015) — Co-founder / Director of Engineering
Boutique shop turned product company in professional video/media asset management, later acquired by Signiant.
- Invented and built core Java backend for Reach Engine (Media Asset Management platform, 100+ customers)
- Led large-scale implementations for UFC and ABC Disney
- Scaled engineering team from 5 to 35; developed multiple engineers into leadership roles
- Built deep trust with customers across transcoders, streaming platforms, LTO, cloud storage

OTHER: PDS (VP Eng, 2017), Latitude Media (Consultant, 2015–2017), ADTRAN (Sr Engineer, 2003–2007), Group Voyagers (Sr Engineer, 2001–2003), Oppenheimer Funds (Contract, 2000–2001), earlier roles going back to 1996.

KEY ACHIEVEMENTS
- Engineering leader for multiple acquired companies (Levels Beyond → Signiant, Floify)
- Led engineering through 10x transaction growth in 9 months during COVID
- Inventor on a registered patent
- Ran a successful independent consulting practice
- HousingWire 2019 Insider Award
- Denver Startup Week Award Winner
- TIFIN Value Award Winner

SKILLS
AI & Dev Velocity: Claude Code, Cursor, AI-driven development practices, agentic code generation
Languages: Java, Python, SQL, JavaScript
Data & Infrastructure: DBT, DuckDB, Apache Airflow, BigQuery, ClickHouse, PostgreSQL, MySQL
Cloud: AWS (ECS/Fargate, Lambda, Kinesis, S3, Redshift, Athena, Aurora), GCP
APIs: REST, GraphQL
Leadership: Team leadership & mentoring, roadmap and cycle planning, solution architecture, cross-functional collaboration, customer relationship management
Salesforce integration

EDUCATION
Miami University — BS in Business Administration, Information Systems + Marketing
`;

const SYSTEM_PROMPT = `You are a thoughtful, direct talent analyst helping a hiring manager evaluate a candidate named Dave Lamy. You will be given Dave's resume and a job description. Your job is to produce a clear-eyed, genuinely useful fit analysis — not a puff piece, but also not unfairly harsh. Be specific and cite actual evidence from both the JD and resume.

Respond ONLY with valid JSON, no markdown, no preamble. The structure must be exactly:

{
  "verdict": "One compelling sentence (20-40 words) summarizing the overall fit. Be direct and specific. Do not start with 'Dave'.",
  "reasons": [
    { "title": "Short reason title", "body": "2-3 sentences with specific evidence from both resume and JD. Be concrete." },
    ... (4-6 reasons total)
  ],
  "concerns": [
    { "title": "Gap or concern title", "body": "1-2 sentences. Be honest but fair." },
    ... (2-4 items, or empty array if genuinely no concerns)
  ],
  "questions": [
    "A specific interview question worth asking Dave based on this role",
    ... (3-5 questions)
  ]
}

Only return the JSON object. No other text.`;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const { mode, url, text } = req.body || {};

  try {
    let jdText = '';

    // Step 1: if URL mode, fetch the job description directly
    if (mode === 'url') {
      if (!url) return res.status(400).json({ error: 'URL is required' });

      const pageRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      });

      if (!pageRes.ok) throw new Error(`Could not fetch that URL (${pageRes.status}). Try pasting the text instead.`);

      const html = await pageRes.text();

      jdText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 8000);

      if (jdText) {
        console.log('JD text length:', jdText.length);
        console.log('JD text preview:', jdText.slice(0, 300));        
        
      }        

      if (!jdText || jdText.length < 100) {
        throw new Error('Could not extract content from that URL. Try pasting the text instead.');
      }

    } else if (mode === 'text') {
      if (!text || text.trim().length < 50) {
        return res.status(400).json({ error: 'Please paste the job description text.' });
      }
      jdText = text.trim();
    } else {
      return res.status(400).json({ error: 'Invalid mode. Use "url" or "text".' });
    }

    // Step 2: analyze fit
    const analysisRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: `RESUME:\n${RESUME}\n\nJOB DESCRIPTION:\n${jdText}`
        }]
      })
    });

    const analysisData = await analysisRes.json();
    if (analysisData.error) throw new Error(analysisData.error.message);

    const raw = analysisData.content.find(b => b.type === 'text')?.text || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({ error: err.message || 'Analysis failed' });
  }
}
