import 'dotenv/config';
import express from 'express';
import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNodeExpressEndpoint } from '@copilotkit/runtime';
import OpenAI from 'openai';

// Basic Express + CopilotKit runtime to serve AI answers grounded in custom actions.

const app = express();
const port = process.env.PORT || 8787;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const serviceAdapter = new OpenAIAdapter({ openai });

const runtime = new CopilotRuntime({
  // actions: [] // We will register data-aware actions below.
});

// Example action: summarize revenue trend.
runtime.registerAction({
  name: 'summarizeRevenueTrend',
  description: 'Summarize the recent revenue trend based on provided monthly numbers.',
  parameters: {
    type: 'object',
    properties: {
      series: { type: 'array', description: 'Array of {month:string,revenue:number}' }
    },
    required: ['series']
  },
  handler: async ({ series }) => {
    if (!Array.isArray(series) || series.length < 2) return 'Not enough data to summarize.';
    const last = series.slice(-2);
    const delta = ((last[1].revenue - last[0].revenue)/last[0].revenue)*100;
    return `Revenue moved from ${last[0].revenue.toFixed(0)} to ${last[1].revenue.toFixed(0)} (${delta.toFixed(2)}%).`;
  }
});

app.use('/api/copilotkit', copilotRuntimeNodeExpressEndpoint({ runtime, serviceAdapter, endpoint: '/api/copilotkit' }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(port, () => {
  console.log(`CopilotKit server running on http://localhost:${port}`);
});
