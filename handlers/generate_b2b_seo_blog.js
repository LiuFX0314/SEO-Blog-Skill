import OpenAI from "openai";
import yargs from "yargs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const argv = yargs(process.argv.slice(2)).argv;

const {
  keyword,
  audience,
  length,
  goal = "traffic",
  region = "global",
  tone = "professional"
} = argv;

// 🧠 动态策略构建（核心升级点）
function buildStrategyPrompt() {
  return `
You are an advanced B2B SEO strategist.

Analyze the following:

Keyword: ${keyword}
Audience: ${audience}
Goal: ${goal}
Region: ${region}

Determine:
1. Search intent (informational / commercial / transactional)
2. Best content angle
3. Suggested article structure
4. Conversion strategy (if applicable)

Return in structured format.
`;
}

// 🧱 内容生成Prompt（重点优化）
function buildContentPrompt(strategy) {
  return `
You are a professional B2B SEO content writer.

Write a ${length}-word article based on:

Keyword: ${keyword}
Audience: ${audience}
Region: ${region}
Tone: ${tone}

Strategy:
${strategy}

Requirements:

- SEO optimized (natural keyword usage)
- Clear structure (H1, H2, H3)
- Include:
  - Use cases
  - Technical explanations
  - Comparisons
  - FAQ section
- Include conversion elements if goal = lead_generation
- Avoid fluff and generic AI writing

Also generate:
- 3 SEO titles
- Meta title
- Meta description
- URL slug
- CTA suggestions

Return in JSON format:
{
  "titles": [],
  "meta_title": "",
  "meta_description": "",
  "url_slug": "",
  "article": "",
  "cta": "",
  "faq": []
}
`;
}

(async () => {
  try {
    // Step 1: 策略生成
    const strategyRes = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: buildStrategyPrompt() }]
    });

    const strategy = strategyRes.choices[0].message.content;

    // Step 2: 内容生成
    const contentRes = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: "You generate high-quality SEO blog content." },
        { role: "user", content: buildContentPrompt(strategy) }
      ]
    });

    const output = contentRes.choices[0].message.content;

    console.log(output);

  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
