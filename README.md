# Claude — Personal Assistant Telegram Bot

একটি শক্তিশালী Telegram বট যা Claude AI দ্বারা চালিত এবং ওয়েব সার্চ সুবিধাসহ ব্যক্তিগত সহকারী হিসেবে কাজ করে।

---

## ✨ বৈশিষ্ট্য (Features)

- 🤖 **Claude AI** — Anthropic-এর Claude মডেল ব্যবহার করে বুদ্ধিমান উত্তর দেয়
- 🔍 **ওয়েব সার্চ** — DuckDuckGo স্ক্র্যাপিং ব্যবহার করে রিয়েল-টাইম তথ্য সংগ্রহ করে (কোনো পেইড API দরকার নেই)
- 💬 **কথোপকথনের ইতিহাস** — প্রতিটি চ্যাটের জন্য আলাদা ইতিহাস রাখে
- 🌐 **বহুভাষিক** — বাংলা ও ইংরেজিসহ যেকোনো ভাষায় উত্তর দেয়
- ⚡ **দ্রুত ও নির্ভরযোগ্য** — Telegraf ফ্রেমওয়ার্ক ব্যবহার করে

---

## 📋 প্রয়োজনীয়তা (Requirements)

- [Node.js](https://nodejs.org/) v18 বা উপরে
- [npm](https://www.npmjs.com/) v9 বা উপরে
- Telegram Bot Token ([BotFather](https://t.me/BotFather) থেকে বিনামূল্যে নিন)
- Anthropic API Key ([console.anthropic.com](https://console.anthropic.com) থেকে নিন)

---

## 🚀 সেটআপ গাইড (Setup Guide)

### ধাপ ১ — Telegram Bot Token তৈরি করুন

1. Telegram-এ `@BotFather` খুঁজুন এবং `/start` পাঠান
2. `/newbot` কমান্ড দিন
3. বটের নাম দিন (যেমন: `My Assistant`)
4. বটের username দিন (যেমন: `my_assistant_bot`)
5. BotFather আপনাকে একটি **Token** দেবে — এটি সংরক্ষণ করুন

### ধাপ ২ — Anthropic API Key নিন

1. [console.anthropic.com](https://console.anthropic.com) এ অ্যাকাউন্ট তৈরি করুন
2. **API Keys** সেকশনে যান এবং নতুন key তৈরি করুন
3. Key-টি সংরক্ষণ করুন

### ধাপ ৩ — প্রজেক্ট ডাউনলোড ও ইনস্টল করুন

```bash
# রিপোজিটরি ক্লোন করুন
git clone https://github.com/tawhid120/Claude.git
cd Claude/telegram-bot

# নির্ভরতা ইনস্টল করুন
npm install
```

### ধাপ ৪ — Environment Variables সেট করুন

```bash
# .env.example থেকে .env তৈরি করুন
cp .env.example .env
```

এখন `.env` ফাইলটি খুলে আপনার তথ্য দিন:

```env
TELEGRAM_BOT_TOKEN=আপনার_telegram_bot_token_এখানে
ANTHROPIC_API_KEY=আপনার_anthropic_api_key_এখানে
```

### ধাপ ৫ — বট চালু করুন

**Development মোডে (সরাসরি চালান):**
```bash
npm run dev
```

**Production মোডে (Build করে চালান):**
```bash
npm run build
npm start
```

বট সফলভাবে চালু হলে টার্মিনালে দেখবেন:
```
🤖 Claude Telegram Bot চালু হয়েছে!
```

### ধাপ ৬ — Telegram-এ বট ব্যবহার করুন

Telegram-এ আপনার বটটি খুঁজুন এবং `/start` পাঠান।

---

## 📱 বট কমান্ড (Commands)

| কমান্ড | বিবরণ |
|--------|-------|
| `/start` | বটের সাথে পরিচয় ও স্বাগত বার্তা |
| `/help` | সাহায্য ও কমান্ড তালিকা |
| `/search <query>` | ওয়েব সার্চ করুন (যেমন: `/search আজকের আবহাওয়া`) |
| `/clear` | কথোপকথনের ইতিহাস মুছুন |

**সাধারণ বার্তা:** যেকোনো টেক্সট পাঠালে বট AI দিয়ে উত্তর দেবে। প্রয়োজনে স্বয়ংক্রিয়ভাবে ওয়েব সার্চ করবে।

---

## 🏗️ প্রজেক্ট কাঠামো (Project Structure)

```
telegram-bot/
├── src/
│   ├── bot.ts          # মূল বট ফাইল — Telegram হ্যান্ডলার
│   ├── assistant.ts    # Claude AI ইন্টিগ্রেশন ও কথোপকথন ব্যবস্থাপনা
│   └── webSearch.ts    # DuckDuckGo স্ক্র্যাপিং — ওয়েব সার্চ
├── .env.example        # Environment variable template
├── package.json        # প্রজেক্ট নির্ভরতা
└── tsconfig.json       # TypeScript কনফিগারেশন
```

---

## ⚙️ কীভাবে কাজ করে (How It Works)

1. **Telegram Message** → ব্যবহারকারী বার্তা পাঠায়
2. **Web Search Check** → বার্তাটি ওয়েব তথ্যের দরকার হয় কিনা যাচাই করা হয়
3. **DuckDuckGo Scrape** → প্রয়োজনে DuckDuckGo থেকে ফলাফল সংগ্রহ করা হয়
4. **Claude AI** → সমস্ত তথ্য Claude-কে পাঠানো হয় এবং বুদ্ধিমান উত্তর তৈরি করা হয়
5. **Telegram Reply** → উত্তর ব্যবহারকারীকে পাঠানো হয়

```
ব্যবহারকারী → Telegram → bot.ts → assistant.ts → Claude API
                                         ↕
                                   webSearch.ts → DuckDuckGo
```

---

## 🔧 Systemd দিয়ে Background-এ চালান (Linux Server)

`/etc/systemd/system/claude-bot.service` ফাইল তৈরি করুন:

```ini
[Unit]
Description=Claude Telegram Bot
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/Claude/telegram-bot
ExecStart=/usr/bin/node dist/bot.js
Restart=always
RestartSec=10
EnvironmentFile=/path/to/Claude/telegram-bot/.env

[Install]
WantedBy=multi-user.target
```

তারপর:
```bash
sudo systemctl daemon-reload
sudo systemctl enable claude-bot
sudo systemctl start claude-bot
sudo systemctl status claude-bot
```

---

## 🐳 Docker দিয়ে চালান

```dockerfile
# telegram-bot/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build
CMD ["node", "dist/bot.js"]
```

```bash
docker build -t claude-bot .
docker run -d --env-file .env --name claude-bot claude-bot
```

---

## 🛠️ সমস্যা সমাধান (Troubleshooting)

| সমস্যা | সমাধান |
|--------|---------|
| `TELEGRAM_BOT_TOKEN is not set` | `.env` ফাইলে সঠিক token দিন |
| `ANTHROPIC_API_KEY is not set` | `.env` ফাইলে সঠিক API key দিন |
| বট সাড়া দিচ্ছে না | টার্মিনালে বট চলছে কিনা দেখুন |
| Web search কাজ করছে না | ইন্টারনেট সংযোগ চেক করুন |
| `Cannot find module` | `npm install` আবার চালান |

---

## 📜 লাইসেন্স

MIT License
