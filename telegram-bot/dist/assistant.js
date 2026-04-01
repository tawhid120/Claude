import Anthropic from '@anthropic-ai/sdk';
import { fetchPageContent, webSearch } from './webSearch.js';
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-opus-4-5';
const MAX_TOKENS = 2048;
// Per-chat conversation history (kept in memory)
const histories = new Map();
const SYSTEM_PROMPT = `You are a helpful personal assistant integrated into Telegram.
You can answer questions, help with tasks, write code, and search the web for up-to-date information.
When web search results are provided, use them to give accurate, current answers and cite sources.
Keep responses concise and well-formatted for Telegram (use plain text or basic Markdown).
Respond in the same language the user writes in.`;
/**
 * Build the search context block to prepend to a user message
 * when the query looks like it needs fresh web data.
 */
async function buildSearchContext(userMessage) {
    try {
        const results = await webSearch(userMessage, 5);
        if (!results.length)
            return '';
        let context = '--- Web Search Results ---\n';
        for (const r of results) {
            context += `\n**${r.title}**\n${r.url}\n${r.snippet}\n`;
        }
        // Optionally fetch the first result for deeper context
        try {
            const pageText = await fetchPageContent(results[0].url, 2000);
            if (pageText) {
                context += `\n--- Top Result Content ---\n${pageText}\n`;
            }
        }
        catch {
            // ignore page fetch errors
        }
        context += '\n--- End of Search Results ---\n\n';
        return context;
    }
    catch {
        return '';
    }
}
/**
 * Decide whether this message likely needs a web search.
 * Simple heuristic: questions about current events, prices, news, etc.
 */
function needsWebSearch(message) {
    const triggers = [
        /সংবাদ|খবর|আজকের|বর্তমান|এখন|লেটেস্ট/i, // Bangla
        /news|today|current|latest|price|weather|stock|score|update|২০২/i,
        /\?(.*)?$/, // ends with question
        /who is|what is|when did|where is|how to|কে|কোথায়|কখন|কীভাবে/i,
    ];
    return triggers.some(r => r.test(message));
}
/**
 * Send a message to Claude and get a reply, maintaining conversation history.
 */
export async function chat(chatId, userMessage) {
    // Initialise history for new chats
    if (!histories.has(chatId)) {
        histories.set(chatId, []);
    }
    const history = histories.get(chatId);
    // Optionally enrich with web search context
    let content = userMessage;
    if (needsWebSearch(userMessage)) {
        const searchContext = await buildSearchContext(userMessage);
        if (searchContext) {
            content = searchContext + userMessage;
        }
    }
    history.push({ role: 'user', content });
    // Keep history manageable (last 20 exchanges = 40 messages)
    if (history.length > 40) {
        history.splice(0, history.length - 40);
    }
    const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: history,
    });
    const assistantMessage = response.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n');
    history.push({ role: 'assistant', content: assistantMessage });
    return assistantMessage;
}
/**
 * Clear the conversation history for a chat.
 */
export function clearHistory(chatId) {
    histories.delete(chatId);
}
/**
 * Perform a standalone web search and return a formatted summary.
 */
export async function searchWeb(chatId, query) {
    const results = await webSearch(query, 5);
    if (!results.length) {
        return 'কোনো ফলাফল পাওয়া যায়নি। (No results found.)';
    }
    let summary = `🔍 *${query}* সম্পর্কিত ফলাফল:\n\n`;
    for (const r of results) {
        summary += `• [${r.title}](${r.url})\n  ${r.snippet}\n\n`;
    }
    // Let Claude summarise the results
    const aiSummary = await chat(chatId, `Please summarise these search results for: "${query}"\n\n${summary}`);
    return aiSummary;
}
