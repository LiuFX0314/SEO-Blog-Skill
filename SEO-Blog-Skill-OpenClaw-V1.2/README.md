# B2B SEO Blog Skill for OpenClaw

A single OpenClaw Skill for B2B SEO blog production.

## What it does

- Keyword intelligence
- SERP gap analysis
- Content strategy
- Blog generation
- SEO and conversion optimization

## Repository layout

```text
SKILL.md
skill.json
tools.json
handlers/
  generate_b2b_seo_blog.js
prompts/
  keyword_intelligence.txt
  serp_analysis.txt
  content_strategy.txt
  content_generation.txt
  seo_optimization.txt
examples/
  serp_sample.json
```

## Setup

```bash
npm install
export OPENAI_API_KEY="your_key_here"
```

## Run a full blog generation

```bash
node handlers/generate_b2b_seo_blog.js   --mode full   --keyword "hydraulic hose"   --audience "industrial buyers"   --length 1500   --goal traffic   --region global   --tone professional   --serp-file examples/serp_sample.json
```

## Run SERP analysis only

```bash
node handlers/generate_b2b_seo_blog.js   --mode analyze-serp   --keyword "hydraulic hose"   --serp-file examples/serp_sample.json
```

## Notes

- The skill is designed as one system skill with internal modules.
- SERP analysis consumes structured page data.
- To connect live search data, plug in your preferred search provider and pass the top 5 results into the handler.
- The handler returns structured JSON so it is easy to store, inspect, or post-process.

## GitHub upload

```bash
git init
git add .
git commit -m "Initial OpenClaw SEO blog skill"
git branch -M main
git remote add origin https://github.com/<your-username>/SEO-Blog-Skill.git
git push -u origin main
```
