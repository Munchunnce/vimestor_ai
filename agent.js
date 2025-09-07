import readline from 'node:readline/promises';
import Groq from "groq-sdk";

const expenseDB = [];
const incomeDB = [];

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callAgent() {
    const rl = readline.createInterface({input: process.stdin, output: process.stdout});
  const messages = [
    {
      role: "system",
      content: `you are Cortana, a personal finnace assistant. Your task is to assist user with their expenses, balance and finacial planning.
          You have access to following tools:
            1. getTotalExpense({from, to}): string // Get total expense for a time period.
            2. addExpense({name, amount}): string // Add new expense to the expense database.
            3. addIncome({name, amount}): string // Add new income to income database.
            4. getMoneyBalance(): string // Get remaining money balance from database.
            current datetime: ${new Date().toUTCString()}`,
    },
  ];

  

  // This is for user prompt loop
  while(true) {
    // User
    const question = await rl.question('User: ');

    if(question === 'buy'){
        break;
    };

    messages.push({
        role: "user",
        content: question,
    });
    // This is for agent loop
    while (true) {
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      tools: [
        {
          type: "function",
          function: {
            name: "getTotalExpense",
            description: "Get total expense from date to date",
            parameters: {
              type: "object",
              properties: {
                from: {
                  type: "string",
                  description: "From date to get the expense",
                },
                to: {
                  type: "string",
                  description: "To date to get the expense",
                },
              },
            },
          },
        },
        {
          type: "function",
          function: {
            name: "addExpense",
            description: "Add new expense entry to the database.",
            parameters: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Name of the expense. e.g., Bought an iphone.",
                },
                amount: {
                  type: "string",
                  description: "Amount of the expense",
                },
              },
            },
          },
        },
        {
          type: "function",
          function: {
            name: "addIncome",
            description: "Add new income entry to the database.",
            parameters: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Name of the income. e.g., got salary",
                },
                amount: {
                  type: "string",
                  description: "Amount of the income",
                },
              },
            },
          },
        },
        {
          type: "function",
          function: {
            name: "getMoneyBalance",
            description: 'Get remaining money balance from database.',
          },
        },
      ],
    });

    // console.log(JSON.stringify(completion.choices[0], null, 2));
    messages.push(completion.choices[0].message);

    const toolCalls = completion.choices[0].message.tool_calls;
    if (!toolCalls) {
      console.log(`Assistant: ${completion.choices[0].message.content}`);
      break;
    };

    for (const tool of toolCalls) {
      const functionName = tool.function.name;
      const functionArgs = tool.function.arguments;

      let result = "";
      if (functionName === "getTotalExpense") {
        result = getTotalExpense(JSON.parse(functionArgs));
      } else if(functionName === "addExpense"){
        result = addExpense(JSON.parse(functionArgs));
      } else if (functionName === 'addIncome') {
        result = addIncome(JSON.parse(functionArgs));
      } else if (functionName === 'getMoneyBalance') {
        result = getMoneyBalance(JSON.parse(functionArgs));
      }

      messages.push({
        role: "tool",
        content: result,
        tool_call_id: tool.id,
      });


    //   console.log(JSON.stringify(completion2.choices[0], null, 2));
    }

    // console.log("=================");
    // console.log("Message:", messages);
    // console.log("=================");
    // console.log("DB: ", expenseDB);
    }
  }
};

callAgent();

/**
 * Get Total expense
 */

function getTotalExpense({ from, to }) {
//   console.log("Calling getTotalExpense tool");

  // In reality -> we call db here...
  const expense = expenseDB.reduce((acc, item) => {
    return acc + item.amount;
  }, 0);
  return `${expense} INR`;
};

function addExpense({name, amount}) {
    // console.log(`Adding ${amount} to expense db for ${name}`);
    expenseDB.push({name, amount});
    return 'Added to the database.';
};

// add Income
function addIncome({ name, amount }) {
    incomeDB.push({ name, amount });
    return 'Added to the income database.';
};

// get money balance
function getMoneyBalance() {
    const totalIncome = incomeDB.reduce((acc, item) => acc + item.amount, 0);
    const totalExpense = expenseDB.reduce((acc, item) => acc + item.amount, 0);

    return `${totalIncome - totalExpense} INR`;
};
