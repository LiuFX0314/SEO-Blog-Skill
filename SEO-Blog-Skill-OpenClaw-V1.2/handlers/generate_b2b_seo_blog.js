\
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import OpenAI from 'openai';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const args = yargs(hideBin(process.argv))
  .option('mode', {
    type: 'string',
    choices: ['full', 'analyze-serp', 'strategy-only', 'write-only', 'optimize-only'],
    default: 'full'
  })
  .option('keyword', { type: 'string', demandOption: false })
  .option('audience', { type: 'string', demandOption: false })
  .option('length', { type: 'number', demandOption: false })
  .option('goal', {
    type: 'string',
    choices: ['traffic', 'lead_generation', 'authority'],
    default: 'traffic'
  })
  .option('region', { type: 'string', default: 'global' })
  .option('tone', { type: 'string', default: 'professional' })
  .option('serp-file', { type: 'string' })
  .option('output', { type: 'string' })
  .option('top-n', { type: 'number', default: 5 })
  .strict()
  .parseSync();

function assertRequired(value, name) {
  if (!value || String(value).trim() === '') {
    throw new Error(`Missing required field: ${name}`);
  }
}

function loadText(filePath) {
  return fs.readFile(filePath, 'utf8');
}

async function loadJsonIfExists(filePath) {
  if (!filePath) return null;
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function extractJson(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return JSON.parse(trimmed);
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }
  throw new Error('Model did not return valid JSON.');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callJsonModel({ systemPrompt, userPrompt, model = 'gpt-4.1', maxRetries = 2 }) {
  let lastError = null;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const res = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4
      });
      const content = res.choices?.[0]?.message?.content ?? '';
      return extractJson(content);
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = 800 * (attempt + 1);
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

function summarizeSerpPages(pages = [], topN = 5) {
  return pages.slice(0, topN).map((page) => ({
    rank: page.rank,
    url: page.url,
    title: page.title,
    content: page.content ?? page.snippet ?? '',
    headings: page.headings ?? [],
    images_count: page.images_count ?? page.imagesCount ?? 0,
    internal_links: page.internal_links ?? page.internalLinks ?? [],
    cta_present: page.cta_present ?? page.ctaPresent ?? false
  }));
}

async function runKeywordIntelligence() {
  assertRequired(args.keyword, 'keyword');
  const prompt = await loadText(path.join('prompts', 'keyword_intelligence.txt'));
  return callJsonModel({
    systemPrompt: prompt.replace('{{keyword}}', args.keyword).replace('{{region}}', args.region).replace('{{goal}}', args.goal),
    userPrompt: `Analyze the keyword "${args.keyword}" for a B2B blog strategy.`
  });
}

async function runSerpAnalysis(keyword, serpPages, topN) {
  assertRequired(keyword, 'keyword');
  if (!Array.isArray(serpPages) || serpPages.length === 0) {
    return {
      keyword,
      error: 'Missing SERP page data.',
      next_step: 'Provide a JSON file containing the top search results or plug in a search provider before running SERP analysis.'
    };
  }

  const prompt = await loadText(path.join('prompts', 'serp_analysis.txt'));
  return callJsonModel({
    systemPrompt: prompt,
    userPrompt: `keyword: ${keyword}\nserp_pages:\n${JSON.stringify(summarizeSerpPages(serpPages, topN), null, 2)}`
  });
}

async function runContentStrategy(bundle) {
  const prompt = await loadText(path.join('prompts', 'content_strategy.txt'));
  return callJsonModel({
    systemPrompt: prompt,
    userPrompt: JSON.stringify(bundle, null, 2)
  });
}

async function runContentGeneration(bundle) {
  const prompt = await loadText(path.join('prompts', 'content_generation.txt'));
  return callJsonModel({
    systemPrompt: prompt,
    userPrompt: JSON.stringify(bundle, null, 2)
  });
}

async function runSeoOptimization(bundle) {
  const prompt = await loadText(path.join('prompts', 'seo_optimization.txt'));
  return callJsonModel({
    systemPrompt: prompt,
    userPrompt: JSON.stringify(bundle, null, 2)
  });
}

async function main() {
  try {
    if (args.mode === 'analyze-serp') {
      assertRequired(args.keyword, 'keyword');
      const serpPages = await loadJsonIfExists(args['serp-file']);
      const serpAnalysis = await runSerpAnalysis(args.keyword, serpPages, args['top-n']);
      const output = JSON.stringify(serpAnalysis, null, 2);
      if (args.output) {
        await fs.writeFile(args.output, output, 'utf8');
      } else {
        process.stdout.write(output + '\n');
      }
      return;
    }

    assertRequired(args.keyword, 'keyword');

    const keyword_intelligence = await runKeywordIntelligence();

    let serp_analysis = null;
    const serpPages = await loadJsonIfExists(args['serp-file']);
    if (serpPages) {
      serp_analysis = await runSerpAnalysis(args.keyword, serpPages, args['top-n']);
    }

    const analysis_bundle = {
      keyword_intelligence,
      serp_analysis
    };

    if (args.mode === 'strategy-only') {
      const content_strategy = await runContentStrategy(analysis_bundle);
      const output = {
        strategy_summary: {
          keyword: args.keyword,
          goal: args.goal,
          region: args.region,
          tone: args.tone
        },
        keyword_intelligence,
        serp_analysis,
        content_strategy
      };
      const text = JSON.stringify(output, null, 2);
      if (args.output) await fs.writeFile(args.output, text, 'utf8');
      else process.stdout.write(text + '\n');
      return;
    }

    if (args.mode === 'write-only') {
      assertRequired(args.audience, 'audience');
      assertRequired(args.length, 'length');
      const content_generation = await runContentGeneration({
        keyword: args.keyword,
        audience: args.audience,
        length: args.length,
        goal: args.goal,
        region: args.region,
        tone: args.tone
      });

      const seo_optimization = await runSeoOptimization({
        keyword: args.keyword,
        audience: args.audience,
        length: args.length,
        content_generation
      });

      const output = {
        keyword_intelligence,
        serp_analysis,
        content_generation,
        seo_optimization
      };
      const text = JSON.stringify(output, null, 2);
      if (args.output) await fs.writeFile(args.output, text, 'utf8');
      else process.stdout.write(text + '\n');
      return;
    }

    if (args.mode === 'optimize-only') {
      const seo_optimization = await runSeoOptimization({
        keyword: args.keyword,
        audience: args.audience ?? '',
        length: args.length ?? null,
        note: 'Optimize existing article when draft content is supplied through the model prompt or prompt pipeline.'
      });
      const text = JSON.stringify({ seo_optimization }, null, 2);
      if (args.output) await fs.writeFile(args.output, text, 'utf8');
      else process.stdout.write(text + '\n');
      return;
    }

    assertRequired(args.audience, 'audience');
    assertRequired(args.length, 'length');

    const content_strategy = await runContentStrategy({
      keyword_intelligence,
      serp_analysis,
      keyword: args.keyword,
      audience: args.audience,
      length: args.length,
      goal: args.goal,
      region: args.region,
      tone: args.tone
    });

    const content_generation = await runContentGeneration({
      keyword: args.keyword,
      audience: args.audience,
      length: args.length,
      goal: args.goal,
      region: args.region,
      tone: args.tone,
      content_strategy
    });

    const seo_optimization = await runSeoOptimization({
      keyword: args.keyword,
      audience: args.audience,
      length: args.length,
      goal: args.goal,
      region: args.region,
      tone: args.tone,
      content_generation
    });

    const output = {
      strategy_summary: {
        keyword: args.keyword,
        audience: args.audience,
        length: args.length,
        goal: args.goal,
        region: args.region,
        tone: args.tone
      },
      keyword_intelligence,
      serp_analysis,
      content_strategy,
      content_generation,
      seo_optimization
    };

    const text = JSON.stringify(output, null, 2);
    if (args.output) {
      await fs.writeFile(args.output, text, 'utf8');
    } else {
      process.stdout.write(text + '\n');
    }
  } catch (error) {
    const structured = {
      error: true,
      message: error?.message ?? 'Unknown error',
      mode: args.mode,
      hint: 'Check required inputs, ensure OPENAI_API_KEY is set, and provide SERP data for analysis mode.'
    };
    process.stderr.write(JSON.stringify(structured, null, 2) + '\n');
    process.exitCode = 1;
  }
}

await main();
