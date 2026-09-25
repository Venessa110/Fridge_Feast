// Node.js / Vercel Serverless Function Proxy
// File path: api/gemini.js

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check all possible environment variable names set in Vercel
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ 
            error: 'Server environment variable GEMINI_API_KEY is missing. Please add GEMINI_API_KEY under Vercel Project Settings -> Environment Variables and redeploy.' 
        });
    }

    const { payload, systemInstruction, model } = req.body || {};
    const selectedModel = model || 'gemini-3.8-flash';

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${GEMINI_API_KEY}`;
        
        const bodyData = { ...payload };
        if (systemInstruction) {
            bodyData.systemInstruction = { parts: [{ text: systemInstruction }] };
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error('Server Proxy Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}