import Anthropic from '@anthropic-ai/sdk'
import type {
  BetaContentBlockParam,
  BetaMessageParam,
  BetaWebSearchTool20250305,
} from '@anthropic-ai/sdk/resources/beta/messages/messages.mjs'

// Web-search beta header — same constant used by the project's WebSearchTool
const WEB_SEARCH_BETA = 'web-search-2025-03-05'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MODEL = 'claude-opus-4-5'
const MAX_TOKENS = 2048

// Per-chat conversation history (kept in memory)
const histories = new Map<number, BetaMessageParam[]>()

const MAX_HISTORY_MESSAGES = 40 // 20 exchanges (user + assistant pairs)

const SYSTEM_PROMPT = `You are a helpful personal assistant integrated into Telegram.
You can answer questions, help with tasks, write code, and search the web for up-to-date information.
When you use web search, incorporate the results into your answer and cite sources with markdown links.
Keep responses concise and well-formatted for Telegram (use plain text or basic Markdown).
Respond in the same language the user writes in.`

// Anthropic native web search tool — no external API key required
const WEB_SEARCH_TOOL: BetaWebSearchTool20250305 = {
  type: 'web_search_20250305',
  name: 'web_search',
  max_uses: 5,
}

/**
 * Extract plain text from a beta response content array.
 * Handles text blocks and citation blocks; ignores tool-use/search blocks.
 */
function extractText(
  content: Anthropic.Beta.Messages.BetaContentBlock[],
): string {
  return content
    .filter(b => b.type === 'text')
    .map(b => (b as Anthropic.Beta.Messages.BetaTextBlock).text)
    .join('\n')
    .trim()
}

/**
 * Send a message to Claude and get a reply, maintaining conversation history.
 * Claude automatically uses the web_search_20250305 tool when needed.
 */
export async function chat(chatId: number, userMessage: string): Promise<string> {
  // Initialise history for new chats
  if (!histories.has(chatId)) {
    histories.set(chatId, [])
  }
  const history = histories.get(chatId)!

  history.push({ role: 'user', content: userMessage })

  // Keep history manageable (last MAX_HISTORY_MESSAGES messages)
  if (history.length > MAX_HISTORY_MESSAGES) {
    history.splice(0, history.length - MAX_HISTORY_MESSAGES)
  }

  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: history,
    tools: [WEB_SEARCH_TOOL],
    betas: [WEB_SEARCH_BETA],
  })

  const assistantMessage = extractText(response.content)

  // Store only the text portion of the assistant turn so the history stays
  // compatible with subsequent requests (tool-use blocks are ephemeral).
  const assistantContent: BetaContentBlockParam[] = assistantMessage
    ? [{ type: 'text', text: assistantMessage }]
    : [{ type: 'text', text: '…' }]

  history.push({ role: 'assistant', content: assistantContent })

  return assistantMessage || '(কোনো উত্তর পাওয়া যায়নি।)'
}

/**
 * Clear the conversation history for a chat.
 */
export function clearHistory(chatId: number): void {
  histories.delete(chatId)
}

/**
 * Perform a standalone web search via Claude's native web_search tool
 * and return a formatted answer — no external search API required.
 */
export async function searchWeb(chatId: number, query: string): Promise<string> {
  return chat(chatId, `অনুগ্রহ করে "${query}" সম্পর্কে ওয়েব সার্চ করে বিস্তারিত তথ্য দিন।`)
}
