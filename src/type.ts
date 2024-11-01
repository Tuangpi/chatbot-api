export interface Message {
    role: string;
    content: string;
}

// Define the output structure (adjust as needed based on app's return type)
export interface Output {
    messages: Message[];
}
