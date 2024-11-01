require('dotenv').config();

import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import { langChain } from './langChain';
import { config } from './config';
import { Output } from './type';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const chatbotHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { message } = req.body;

        if (!message) {
            res.status(400).json({ error: 'Message is required' });
            return;
        }

        const input = [
            {
                role: "user",
                content: message,
            },
        ];

        const output: Output = await langChain.invoke({ messages: input }, config);

        if (output.messages.length > 0) {
            const botResponse = output.messages[output.messages.length - 1];
            res.json({ response: botResponse.content })
        } else {
            console.log("No messages in output.");
        }


    } catch (error) {
        next(error);
    }
};

app.get("/", (req: Request, res: Response) => {
    res.json({ response: "Hello" })
});

app.post('/api/chat', chatbotHandler);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(error.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// const express = require("express");
// const app = express();

// app.get("/", (req: any, res: any) => res.send("Express on Vercel"));

// app.listen(3000, () => console.log("Server ready on port 3000."));

// module.exports = app;
