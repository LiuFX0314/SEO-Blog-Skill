---
name: b2b_seo_blog_system
description: "Dynamic SEO blog generation system for B2B websites, including keyword research, content planning, writing, and conversion optimization."
version: 1.0.0
triggers:
  - 写SEO博客
  - 生成B2B博客
  - SEO文章写作
  - 博客优化
  - 关键词生成文章
required_tools:
  - openai_api
---

# B2B SEO Blog System

## When to Use

Use this skill when:
- The user wants to create SEO blog content
- The user needs keyword-based article generation
- The user wants to optimize blog content for Google ranking
- The user needs blog content for traffic, lead generation, or authority building

---

## Core Principle

This is NOT a simple writing tool.

This skill acts as a **dynamic SEO decision engine**, which:
1. Analyzes search intent
2. Determines blog strategy
3. Builds SEO structure
4. Generates optimized content
5. Enhances conversion potential

---

## Step 1: Context & Strategy Detection

Before generating content, ALWAYS determine:

1. Market:
   - If user specifies region → localize SEO style
   - If not → use global SEO best practices

2. Website Stage (infer or ask):
   - New site → focus on traffic acquisition
   - Growing site → balance traffic + leads
   - Authority site → focus on depth & authority

3. Blog Goal:
   - Traffic
   - Lead generation
   - Authority building

4. Keyword Intent:
   - Informational
   - Commercial
   - Transactional

If any key information is missing → ASK the user.

---

## Step 2: SERP Simulation

Simulate Google Page 1 results:

- Identify common article structures
- Detect content patterns (guides, lists, comparisons)
- Identify if FAQ / snippets exist
- Estimate content depth

Output:
- Recommended content angle
- Content gap opportunities

---

## Step 3: Content Architecture Design

Generate:

- H1 Title (SEO optimized)
- 5–8 H2 sections
- Optional H3 subsections
- Each section must have a clear purpose:
  - Explanation
  - Comparison
  - Application
  - Conversion

Also define:
- Internal linking opportunities
- CTA placement positions

---

## Step 4: Content Generation

Generate full blog content:

Requirements:
- Natural keyword integration (NO keyword stuffing)
- Clear structure and readability
- B2B professional tone
- Include:
  - Use cases
  - Technical explanations
  - Comparisons
  - FAQs

---

## Step 5: SEO Optimization Layer

Generate:

- Meta Title (CTR optimized)
- Meta Description
- URL slug
- LSI keywords
- Featured snippet paragraph (40–60 words)

---

## Step 6: Conversion Optimization

IMPORTANT for B2B:

- Add soft CTA (consultation / inquiry)
- Suggest product integration points
- Recommend internal linking strategy:
  Blog → Category → Product

---

## Output Format

Return in structured format:

1. Strategy Summary
2. Titles (3–5 options)
3. Outline (H1–H3)
4. Full Article
5. SEO Metadata
6. Internal Linking Plan
7. CTA Suggestions

---

## Rules

- DO NOT generate generic content
- DO NOT skip strategy analysis
- DO NOT overuse keywords
- ALWAYS adapt tone for B2B audience
- ALWAYS include SEO + conversion elements

---

## Error Handling

- If keyword is unclear → ask for clarification
- If topic is too broad → suggest narrowing
- If user intent is unclear → ask before proceeding
