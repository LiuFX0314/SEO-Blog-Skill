---
name: b2b_seo_blog_skill
description: "Dynamic B2B SEO blog system for keyword intelligence, SERP gap analysis, content strategy, writing, and SEO optimization."
version: 1.0.1
triggers:
  - "写SEO博客"
  - "生成SEO文章"
  - "B2B博客"
  - "关键词分析"
  - "SERP分析"
  - "博客优化"
required_tools:
  - openai_api
metadata:
  openclaw:
    requires:
      bins: ["node"]
user-invocable: true
---

# B2B SEO Blog Skill

## When to Use

Use this skill when the user wants one of the following:
- A complete B2B SEO blog article
- Keyword understanding and search intent analysis
- SERP gap analysis for a keyword
- Content strategy before writing
- SEO optimization for an existing article

This skill is a single system skill with internal modules.  
It is not meant to be split into separate user-facing skills.

## Core Principle

The skill should decide which modules to run based on user intent.

Typical module chain:
1. Keyword Intelligence
2. SERP Analysis
3. Content Strategy
4. Content Generation
5. SEO & Conversion Optimization

Not every request needs all modules.  
For example:
- Keyword analysis only → run modules 1 and 2
- Complete blog creation → run all modules
- Existing article optimization → run module 5 only

## Rules

- Do not skip strategy analysis when the user asks for a full blog.
- Do not generate vague, generic marketing copy.
- Do not stuff keywords unnaturally.
- Do not fabricate SERP data. If SERP input is missing, ask for it or use a configured search provider.
- Always prefer structured output.
- Always return readable errors when required input is missing.

## Execution Modes

### 1) Research Mode
Use when the user asks to analyze a keyword, search intent, or SERP gap.
Output:
- keyword intelligence
- SERP summary
- gap analysis
- content opportunity
- outline recommendation

### 2) Writing Mode
Use when the user asks to write a blog post.
Output:
- titles
- outline
- article
- FAQ
- CTA ideas

### 3) Optimization Mode
Use when the user asks to improve an existing article.
Output:
- meta title
- meta description
- URL slug
- internal link suggestions
- image ALT suggestions
- CTA optimization
- keyword placement suggestions

## Output Format

Return JSON whenever possible.

Minimum output fields for a complete blog:
- strategy_summary
- keyword_intelligence
- serp_analysis
- content_strategy
- article
- seo_optimization

## Error Handling

- If keyword is missing, ask for the keyword or topic.
- If target audience is missing and the user wants a full article, ask for the audience.
- If the word count is missing and the user wants a full article, ask for the target length.
- If SERP data is missing in analysis mode, return a structured error with a clear next step.

## Never Do

- Never claim to have checked Google if no SERP source is provided.
- Never combine unrelated responsibilities into a single hidden step.
- Never expose secrets or API keys.
- Never ignore missing required fields.
