import axios from 'axios';

// Mock setup for standalone test (since we might not have a running DB with correct IDs yet)
console.log('--- Testing AI Menu Generation (Standalone) ---');

// We need a valid Mess ID for the real API, but for testing the AI generation logic directly, 
// we might want to skip the DB look up if possible, or just mock it.
// However, since the controller checks DB, we'll try to hit the endpoint and see if it fails on DB or Auth.

// Ideally, we should unit test the Groq logic, but let's try a direct API call if server is running.

const GROQ_TEST = async () => {
    try {
        // This is a dummy test to see if Groq SDK works in isolation first
        // to verify key is valid before hitting the full route

        const { Groq } = await import('groq-sdk');
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        console.log('Sending request to Groq...');
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Say hello" }],
            model: "llama-3.3-70b-versatile",
        });

        console.log('Groq Response:', completion.choices[0]?.message?.content);
        console.log('✅ AI Connection Success');

    } catch (e) {
        console.error('❌ AI Test Failed:', e.message);
    }
};

// Start the test
import dotenv from 'dotenv';
dotenv.config();

GROQ_TEST();
