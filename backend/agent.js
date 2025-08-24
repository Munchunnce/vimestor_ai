// import readline from 'node:readline/promises';
// import Groq from "groq-sdk";

// const expenseDB = [];
// const incomeDB = [];

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// async function callAgent() {
//     const rl = readline.createInterface({input: process.stdin, output: process.stdout});
//   const messages = [
//     {
    //   role: "system",
    //   content: `you are shikha, a personal finnace assistant. Your task is to assist user with their expenses, balance and finacial planning.
    //       You have access to following tools:
    //         1. getTotalExpense({from, to}): string // Get total expense for a time period.
    //         2. addExpense({name, amount}): string // Add new expense to the expense database.
    //         3. addIncome({name, amount}): string // Add new income to income database.
    //         4. getMoneyBalance(): string // Get remaining money balance from database.
    //         current datetime: ${new Date().toUTCString()}`,
    // },
//   ];

  

//   // This is for user prompt loop
//   while(true) {
//     // User
//     const question = await rl.question('User: ');

//     if(question === 'buy'){
//         break;
//     };

//     messages.push({
//         role: "user",
//         content: question,
//     });
//     // This is for agent loop
//     while (true) {
//     const completion = await groq.chat.completions.create({
//       messages: messages,
//       model: "llama-3.3-70b-versatile",
//       tools: [
//         {
//           type: "function",
//           function: {
//             name: "getTotalExpense",
//             description: "Get total expense from date to date",
//             parameters: {
//               type: "object",
//               properties: {
//                 from: {
//                   type: "string",
//                   description: "From date to get the expense",
//                 },
//                 to: {
//                   type: "string",
//                   description: "To date to get the expense",
//                 },
//               },
//             },
//           },
//         },
//         {
//           type: "function",
//           function: {
//             name: "addExpense",
//             description: "Add new expense entry to the database.",
//             parameters: {
//               type: "object",
//               properties: {
//                 name: {
//                   type: "string",
//                   description: "Name of the expense. e.g., Bought an iphone.",
//                 },
//                 amount: {
//                   type: "string",
//                   description: "Amount of the expense",
//                 },
//               },
//             },
//           },
//         },
//         {
//           type: "function",
//           function: {
//             name: "addIncome",
//             description: "Add new income entry to the database.",
//             parameters: {
//               type: "object",
//               properties: {
//                 name: {
//                   type: "string",
//                   description: "Name of the income. e.g., got salary",
//                 },
//                 amount: {
//                   type: "string",
//                   description: "Amount of the income",
//                 },
//               },
//             },
//           },
//         },
//         {
//           type: "function",
//           function: {
//             name: "getMoneyBalance",
//             description: 'Get remaining money balance from database.',
//           },
//         },
//       ],
//     });

//     // console.log(JSON.stringify(completion.choices[0], null, 2));
//     messages.push(completion.choices[0].message);

//     const toolCalls = completion.choices[0].message.tool_calls;
//     if (!toolCalls) {
//       console.log(`Assistant: ${completion.choices[0].message.content}`);
//       break;
//     }

//     for (const tool of toolCalls) {
//       const functionName = tool.function.name;
//       const functionArgs = tool.function.arguments;

//       let result = "";
//       if (functionName === "getTotalExpense") {
//         result = getTotalExpense(JSON.parse(functionArgs));
//       } else if(functionName === "addExpense"){
//         result = addExpense(JSON.parse(functionArgs));
//       } else if (functionName === 'addIncome') {
//         result = addIncome(JSON.parse(functionArgs));
//       } else if (functionName === 'getMoneyBalance') {
//         result = getMoneyBalance(JSON.parse(functionArgs));
//       }

//       messages.push({
//         role: "tool",
//         content: result,
//         tool_call_id: tool.id,
//       });


//     //   console.log(JSON.stringify(completion2.choices[0], null, 2));
//     }

//     // console.log("=================");
//     // console.log("Message:", messages);
//     // console.log("=================");
//     // console.log("DB: ", expenseDB);
//     }
//   }
// }

// callAgent();

// /**
//  * Get Total expense
//  */

// function getTotalExpense({ from, to }) {
// //   console.log("Calling getTotalExpense tool");

//   // In reality -> we call db here...
//   const expense = expenseDB.reduce((acc, item) => {
//     return acc + item.amount;
//   }, 0);
//   return `${expense} INR`;
// };

// function addExpense({name, amount}) {
//     // console.log(`Adding ${amount} to expense db for ${name}`);
//     expenseDB.push({name, amount});
//     return 'Added to the database.';
// };

// // add Income
// function addIncome({ name, amount }) {
//     incomeDB.push({ name, amount });
//     return 'Added to the income database.';
// };

// // get money balance
// function getMoneyBalance() {
//     const totalIncome = incomeDB.reduce((acc, item) => acc + item.amount, 0);
//     const totalExpense = expenseDB.reduce((acc, item) => acc + item.amount, 0);

//     return `${totalIncome - totalExpense} INR`;
// }



// backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
// ✅ CORS allow frontend domain
app.use(
  cors({
    origin: ["https://vimestor-ai.vercel.app", "http://localhost:3000"], // frontend ka live domain
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const DATA_FILE = path.resolve("./data.json");

// ---------- Utility Functions ----------
function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = { incomes: [], expenses: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE);
    return JSON.parse(raw);
  } catch (err) {
    console.error(" JSON Parse Error:", err.message);
    return { incomes: [], expenses: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(" File Write Error:", err.message);
  }
}

// ---------- Safe JSON Parse ----------
function safeJsonParse(str) {
  try {
    if (!str) return {};
    str = str.trim();
    if (str.startsWith("(") && str.endsWith(")")) str = str.slice(1, -1);
    str = str.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
    return JSON.parse(str);
  } catch (err) {
    console.error(" JSON Parse Failed:", str, err.message);
    return {};
  }
}

// ---------- Finance Functions ----------
function getTotalExpense({ from, to }) {
  const data = readData();
  const fromDate = from ? new Date(from) : new Date("2000-01-01");
  const toDate = to ? new Date(to) : new Date();
  const expense = data.expenses.reduce((acc, item) => {
    const date = new Date(item.date || new Date());
    if (date >= fromDate && date <= toDate) return acc + item.amount;
    return acc;
  }, 0);
  return `${expense} INR`;
}

function addExpense({ name, amount }) {
  const data = readData();
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) return " Invalid expense amount.";
  data.expenses.push({ name, amount: numAmount, date: new Date().toISOString() });
  writeData(data);
  return " Expense added successfully.";
}

function addIncome({ name, amount }) {
  const data = readData();
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) return " Invalid income amount.";
  data.incomes.push({ name, amount: numAmount, date: new Date().toISOString() });
  writeData(data);
  return " Income added successfully.";
}

function getMoneyBalance() {
  const data = readData();
  const totalIncome = data.incomes.reduce((acc, item) => acc + item.amount, 0);
  const totalExpense = data.expenses.reduce((acc, item) => acc + item.amount, 0);
  return `${totalIncome - totalExpense} INR`;
}

// ---------- API Endpoint ----------
app.post("/ai", async (req, res) => {
  try {
    const userMessages = req.body.messages || [];

    const messages = [
      {
        role: "system",
        content: `You are Cortana, a personal finance assistant.
Tools available:
1. getTotalExpense({from, to})
2. addExpense({name, amount})
3. addIncome({name, amount})
4. getMoneyBalance()
Current datetime: ${new Date().toUTCString()}`,
      },
      ...userMessages,
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.3-70b-versatile",
      tools: [
        {
          type: "function",
          function: {
            name: "getTotalExpense",
            description: "Get total expense from date to date",
            parameters: { type: "object", properties: { from: { type: "string" }, to: { type: "string" } } },
          },
        },
        {
          type: "function",
          function: {
            name: "addExpense",
            description: "Add new expense entry",
            parameters: { type: "object", properties: { name: { type: "string" }, amount: { type: "string" } } },
          },
        },
        {
          type: "function",
          function: {
            name: "addIncome",
            description: "Add new income entry",
            parameters: { type: "object", properties: { name: { type: "string" }, amount: { type: "string" } } },
          },
        },
        {
          type: "function",
          function: {
            name: "getMoneyBalance",
            description: "Get remaining money balance",
          },
        },
      ],
    });

    const msg = completion.choices[0].message;

    // ----------------------
    // Permanent fix for <function=...>
    // ----------------------
    let toolCalls = msg.tool_calls || [];

    const regex = /<function=(\w+)(.*?)<\/function>/gs;
    let match;
    while ((match = regex.exec(msg.content || "")) !== null) {
      const fnName = match[1];
      const rawArgs = match[2].trim() || "{}";
      toolCalls.push({ id: `manual-${Date.now()}`, function: { name: fnName, arguments: rawArgs } });
    }

    // Execute all tool calls
    if (toolCalls.length > 0) {
      const toolResults = toolCalls.map(tool => {
        const fnArgs = safeJsonParse(tool.function.arguments);
        let result = "";
        switch (tool.function.name) {
          case "addIncome":
            result = addIncome(fnArgs);
            break;
          case "addExpense":
            result = addExpense(fnArgs);
            break;
          case "getTotalExpense":
            result = getTotalExpense(fnArgs);
            break;
          case "getMoneyBalance":
            result = getMoneyBalance();
            break;
          default:
            result = " Unknown function.";
        }
        return result;
      });

      // Return combined results without any <function> tags
      return res.json({ role: "assistant", content: toolResults.join("\n") });
    }

    // If no tool calls, just return AI message content
    const finalContent = (msg.content || "").replace(/<function=.*?>.*?<\/function>/gi, "").trim();
    res.json({ role: "assistant", content: finalContent });
  } catch (err) {
    console.error(" API Error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------- Start Server ----------
app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
