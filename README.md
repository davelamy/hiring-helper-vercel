# Dave Lamy — Hiring Manager Fit Analyzer

A one-page tool for hiring managers to evaluate Dave's fit against any job description. Paste a URL or drop in the JD text and get an AI-powered analysis in seconds.

## Stack

- **Frontend**: Vanilla HTML/CSS/JS (`public/index.html`)
- **Backend**: Vercel serverless function (`api/analyze.js`)
- **AI**: Anthropic Claude (claude-sonnet-4) with optional web search for URL fetching

## Deploy to Vercel

### 1. Push this repo to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (free account is fine)
2. Click **Add New → Project**
3. Import your GitHub repo
4. Leave all build settings as defaults — Vercel will auto-detect the structure
5. Click **Deploy**

### 3. Add your API key

1. In your Vercel project, go to **Settings → Environment Variables**
2. Add a new variable:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: your Anthropic API key (from [console.anthropic.com](https://console.anthropic.com))
   - **Environment**: Production (and optionally Preview)
3. Click **Save**
4. Go to **Deployments** and click **Redeploy** to pick up the new env var

Your app will be live at `https://your-project-name.vercel.app`.

## Local development

```bash
npm install -g vercel
vercel dev
```

Then set your API key in a `.env.local` file:

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Project structure

```
├── api/
│   └── analyze.js       # Serverless function — calls Anthropic API
├── public/
│   └── index.html       # Frontend
├── vercel.json          # Routing config
└── package.json
```

## How it works

1. Hiring manager pastes a job URL or the JD text
2. If URL: a Claude call with web_search fetches and extracts the posting text
3. A second Claude call cross-references the JD against Dave's baked-in resume
4. Returns structured JSON: verdict, fit reasons, gaps, interview questions
5. Frontend renders the analysis
