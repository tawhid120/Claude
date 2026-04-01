import 'dotenv/config'
import { Telegraf, Context } from 'telegraf'
import { message } from 'telegraf/filters'
import { chat, clearHistory, searchWeb } from './assistant.js'

// ── Validate required env vars ──────────────────────────────────────────────
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

if (!BOT_TOKEN) {
  console.error('❌  TELEGRAM_BOT_TOKEN is not set. Check your .env file.')
  process.exit(1)
}
if (!ANTHROPIC_KEY) {
  console.error('❌  ANTHROPIC_API_KEY is not set. Check your .env file.')
  process.exit(1)
}

// Telegram's max message length; we use a slightly smaller value to be safe
const TELEGRAM_MESSAGE_LIMIT = 4000
const bot = new Telegraf(BOT_TOKEN)

// ── Helper: show typing indicator then send reply ────────────────────────────
async function sendReply(ctx: Context, reply: string): Promise<void> {
  await ctx.sendChatAction('typing')
  // Telegram message limit is 4096 chars — split if needed
  const chunks = splitMessage(reply, TELEGRAM_MESSAGE_LIMIT)
  for (const chunk of chunks) {
    await ctx.reply(chunk, { parse_mode: 'Markdown' }).catch(() =>
      // Fallback without Markdown if parsing fails
      ctx.reply(chunk)
    )
  }
}

function splitMessage(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text]
  const parts: string[] = []
  let remaining = text
  while (remaining.length > 0) {
    parts.push(remaining.slice(0, maxLen))
    remaining = remaining.slice(maxLen)
  }
  return parts
}

// ── Commands ─────────────────────────────────────────────────────────────────

bot.start(async ctx => {
  const name = ctx.from?.first_name ?? 'বন্ধু'
  await ctx.reply(
    `👋 হ্যালো ${name}! আমি আপনার ব্যক্তিগত AI সহকারী।\n\n` +
    `আমি যা করতে পারি:\n` +
    `• যেকোনো প্রশ্নের উত্তর দিতে পারি\n` +
    `• ওয়েব সার্চ করে তথ্য দিতে পারি\n` +
    `• কোড লিখতে ও বুঝতে সাহায্য করতে পারি\n` +
    `• যেকোনো ভাষায় কথা বলতে পারি\n\n` +
    `📌 কমান্ড:\n` +
    `/search <query> — ওয়েব সার্চ করুন\n` +
    `/clear — কথোপকথনের ইতিহাস মুছুন\n` +
    `/help — সাহায্য\n\n` +
    `আপনার প্রশ্ন লিখুন! 🚀`
  )
})

bot.help(async ctx => {
  await ctx.reply(
    `🤖 *সাহায্য*\n\n` +
    `আমি Claude AI দ্বারা চালিত একটি ব্যক্তিগত সহকারী বট।\n\n` +
    `*কমান্ড:*\n` +
    `/start — স্বাগত বার্তা\n` +
    `/search <query> — ওয়েব সার্চ করুন\n` +
    `/clear — কথোপকথনের ইতিহাস মুছুন\n` +
    `/help — এই সাহায্য দেখুন\n\n` +
    `*ওয়েব সার্চ:*\nআপনি সরাসরি প্রশ্ন করলেও আমি প্রয়োজনে ওয়েব সার্চ করে উত্তর দেব।\n\n` +
    `আপনার বার্তা লিখুন শুরু করুন! 💬`,
    { parse_mode: 'Markdown' }
  )
})

bot.command('clear', async ctx => {
  clearHistory(ctx.chat.id)
  await ctx.reply('✅ কথোপকথনের ইতিহাস মুছে ফেলা হয়েছে।')
})

bot.command('search', async ctx => {
  const query = ctx.message.text.replace('/search', '').trim()
  if (!query) {
    await ctx.reply('❓ অনুসন্ধানের জন্য একটি বিষয় লিখুন।\nউদাহরণ: `/search আজকের আবহাওয়া`', {
      parse_mode: 'Markdown',
    })
    return
  }

  await ctx.sendChatAction('typing')
  try {
    const result = await searchWeb(ctx.chat.id, query)
    await sendReply(ctx, result)
  } catch (err) {
    console.error('Search error:', err)
    await ctx.reply('⚠️ ওয়েব সার্চ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
  }
})

// ── Text messages ─────────────────────────────────────────────────────────────
bot.on(message('text'), async ctx => {
  const text = ctx.message.text.trim()

  // Ignore empty or very short messages
  if (text.length < 2) return

  await ctx.sendChatAction('typing')

  try {
    const reply = await chat(ctx.chat.id, text)
    await sendReply(ctx, reply)
  } catch (err: unknown) {
    console.error('Chat error:', err)
    const errMsg = err instanceof Error ? err.message : String(err)

    if (errMsg.includes('overloaded') || errMsg.includes('529')) {
      await ctx.reply('⚠️ Claude এখন ব্যস্ত আছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।')
    } else if (errMsg.includes('credit') || errMsg.includes('quota')) {
      await ctx.reply('⚠️ API কোটা শেষ হয়ে গেছে। পরে আবার চেষ্টা করুন।')
    } else {
      await ctx.reply('⚠️ একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
    }
  }
})

// ── Photo / document messages ─────────────────────────────────────────────────
bot.on(message('photo'), async ctx => {
  await ctx.reply('🖼️ দুঃখিত, আমি এখনো ছবি বিশ্লেষণ করতে পারি না। টেক্সট বার্তা পাঠান।')
})

bot.on(message('document'), async ctx => {
  await ctx.reply('📄 দুঃখিত, আমি এখনো ফাইল পড়তে পারি না। টেক্সট বার্তা পাঠান।')
})

// ── Error handling ────────────────────────────────────────────────────────────
bot.catch((err, ctx) => {
  console.error(`Bot error for update ${ctx.update.update_id}:`, err)
})

// ── Launch ────────────────────────────────────────────────────────────────────
bot.launch({
  allowedUpdates: ['message', 'callback_query'],
}).then(() => {
  console.log('🤖 Claude Telegram Bot চালু হয়েছে!')
  console.log('Ctrl+C চাপুন বন্ধ করতে।')
})

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
