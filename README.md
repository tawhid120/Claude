# Claude

Claude Code is an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows — all through natural language commands.

---

## সেটআপ নির্দেশিকা (বাংলা) | Setup Guide

### প্রয়োজনীয়তা | Requirements

- **Node.js** সংস্করণ ১৮ বা তার বেশি (Node.js version 18 or higher)
- একটি **Anthropic API key** (পাওয়া যাবে [console.anthropic.com](https://console.anthropic.com) থেকে)

---

### ধাপ ১: ইনস্টলেশন | Step 1: Installation

নিচের যেকোনো একটি পদ্ধতি ব্যবহার করুন:

**MacOS / Linux (প্রস্তাবিত | Recommended):**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Homebrew (MacOS / Linux):**
```bash
brew install --cask claude-code
```

**Windows (প্রস্তাবিত | Recommended):**
```powershell
irm https://claude.ai/install.ps1 | iex
```

**WinGet (Windows):**
```powershell
winget install Anthropic.ClaudeCode
```

**NPM (পুরনো পদ্ধতি | Deprecated):**
```bash
npm install -g @anthropic-ai/claude-code
```

---

### ধাপ ২: API Key সেট করুন | Step 2: Configure API Key

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

স্থায়ীভাবে সেট করতে, আপনার শেল কনফিগ ফাইলে (`.bashrc`, `.zshrc`, ইত্যাদি) যোগ করুন।  
To set it permanently, add the above line to your shell config file (`.bashrc`, `.zshrc`, etc.).

---

### ধাপ ৩: চালু করুন | Step 3: Run

আপনার প্রজেক্ট ডিরেক্টরিতে যান এবং চালান:

```bash
cd /path/to/your/project
claude
```

---

## Source থেকে সেটআপ | Setup from Source

এই রিপোজিটরি ক্লোন করার পরে:

### প্রয়োজনীয়তা | Requirements

- **Node.js** v18+
- **Bun** (রানটাইম হিসেবে ব্যবহৃত | used as runtime)

### ইনস্টল করুন | Install

```bash
# Bun ইনস্টল করুন (যদি না থাকে)
curl -fsSL https://bun.sh/install | bash

# ডিপেন্ডেন্সি ইনস্টল করুন
bun install

# চালু করুন
bun run main.tsx
```

---

## সাহায্য পান | Get Help

- অফিশিয়াল ডকুমেন্টেশন: [code.claude.com/docs/en/overview](https://code.claude.com/docs/en/overview)
- বাগ রিপোর্ট করতে Claude-এর মধ্যে `/bug` কমান্ড ব্যবহার করুন
- [Claude Developers Discord](https://anthropic.com/discord) এ যোগ দিন
