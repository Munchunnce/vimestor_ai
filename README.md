

---

## ✅ `README.md` (Bun Version)

```markdown
# 💸 Personal Finance Assistant (CLI) — Powered by Groq SDK

A conversational CLI-based personal finance assistant built with **Node.js + Bun + Groq SDK**.  
The assistant (**Shikha**) helps you track expenses, get monthly summaries, and plan your finances using function-calling via Groq.

---

## ✨ Features

- 🧾 Add expenses by natural language (e.g., "I spent 500 on groceries")
- 📅 Get total expenses for a specific month or date range
- 🧠 Powered by Groq LLaMA-3.3-70B with function calling
- ⚡ Fast, lightweight CLI tool using Bun runtime
- 💬 Conversational flow using terminal

---

## 🔧 Available Tools (Function Calling)

| Function Name      | Description                               |
|--------------------|-------------------------------------------|
| `addExpense`       | Add a new expense to the in-memory DB     |
| `getTotalExpense`  | Fetch total expense in a date range       |

---

## 📁 Folder Structure

```

.
├── agent.js         # Main CLI program
├── .env             # Contains GROQ\_API\_KEY
├── bun.lockb        # Bun lock file
├── package.json     # Package config
└── README.md        # You're reading this

````

---

## 🚀 Getting Started with Bun

### 1. Install Bun (if not already)

```bash
curl -fsSL https://bun.sh/install | bash
````

Restart your terminal.

### 2. Clone the repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

### 3. Install dependencies

```bash
bun install
```

### 4. Add your Groq API key

Create a `.env` file in the root:

```
GROQ_API_KEY=your_groq_api_key_here
```

### 5. Run the Assistant

```bash
bun agent.js
```

---

## 💬 Example Usage

```bash
User: I spent 250 on coffee
Assistant: Added to the database.

User: How much did I spend this month?
Assistant: You have spent 250 INR this month.
```

---

## 📌 Notes

* This app uses **in-memory arrays**, so data resets when the app closes.
* You can add persistence via a file system or database (e.g., SQLite, MongoDB).
* Expand it with income tracking, balance report, or charts.

---

## 👨‍💻 Author

**Vimal Kumar Chaudhary**
Software Developer | India 🇮🇳
Tech Stack: React.js, Node.js, Groq SDK, Bun

---

```

```
