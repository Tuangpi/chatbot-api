require('dotenv').config();
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { START, END, MessagesAnnotation, StateGraph, MemorySaver, } from "@langchain/langgraph";
import { ChatMistralAI } from "@langchain/mistralai";

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        "Answer all questions to the best of your ability.",
    ],
    new MessagesPlaceholder("messages"),
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
