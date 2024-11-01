require('dotenv').config();
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { START, END, MessagesAnnotation, StateGraph, MemorySaver, } from "@langchain/langgraph";
import { ChatMistralAI } from "@langchain/mistralai";

const systemTemplate = [
    `You are an assistant for question-answering tasks. `,
    `Use the following pieces of retrieved context to answer `,
    `the question. If you don't know the answer, say that you `,
    `don't know. Use three sentences maximum and keep the `,
    `answer concise.`,
    `\n\n`,
    `{context}`,
].join("");

const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", "{input}"],
]);

const llm = new ChatMistralAI({
    model: "mistral-large-latest",
    temperature: 0
});

// Define the function that calls the model
const callModel = async (state: typeof MessagesAnnotation.State) => {
    const chain = prompt.pipe(llm);
    const response = await chain.invoke(state);
    return { messages: response };
};

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
    // Define the node and edge
    .addNode("model", callModel)
    .addEdge(START, "model")
    .addEdge("model", END);

// Add memory
const memory = new MemorySaver();
export const langChain = workflow.compile({ checkpointer: memory });
