const axios = require('axios');
const Loan = require('../models/loanModel');
const LoanApplication = require('../models/loanApplicationModel');

const handleChat = async (req, res) => {
    const { message, role, history } = req.body;
    const MODEL_NAME = "llama-3.3-70b-versatile";
    const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

    try {
        // 1. UPDATED SYSTEM PROMPT: 
        // We add a strict instruction to NOT use XML tags like <function>.
        const systemPrompt = {
            role: "system",
            content: `You are the Vehicle Loan Hub AI. User Role: ${role}. 
            DB Mapping for applications: 0=pending, 1=approved, 2=rejected.
            
            IMPORTANT: Use the provided tools for data. 
            DO NOT output tool calls as text or XML tags like <function=...>. 
            Only use the formal tool-calling response format.`
        };

        const formattedHistory = (history || [])
            .map(h => ({
                role: h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user',
                content: h.parts?.[0]?.text || h.content || ""
            }))
            .filter(msg => msg.content.trim() !== "");

        const messages = [systemPrompt, ...formattedHistory, { role: "user", content: message }];

        const tools = [
            {
                type: "function",
                function: {
                    name: "get_vehicle_loans",
                    description: "Get all available loans for a specific vehicle type (car, bike, or truck).",
                    parameters: {
                        type: "object",
                        properties: {
                            vehicleType: { type: "string", enum: ["car", "bike", "truck"] }
                        },
                        required: ["vehicleType"]
                    }
                }
            }
        ];

        if (role === 'admin') {
            tools.push({
                type: "function",
                function: {
                    name: "get_user_stats",
                    description: "Get counts of loan applications. Use status 'all' for a full summary.",
                    parameters: {
                        type: "object",
                        properties: {
                            status: { type: "string", enum: ["pending", "approved", "rejected", "all"] }
                        },
                        required: ["status"]
                    }
                }
            });
        }

        const headers = {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        };

        // 2. FIRST CALL
        const firstResponse = await axios.post(GROQ_URL, {
            model: MODEL_NAME,
            messages,
            tools,
            tool_choice: "auto",
            temperature: 0.1 // Keeping temperature low is critical for tool stability
        }, { headers });

        const responseMessage = firstResponse.data.choices[0].message;

        // 3. CHECK FOR RAW TAGS (Safety fallback)
        // If the model ignores instructions and sends text tags anyway
        if (responseMessage.content && responseMessage.content.includes('<function')) {
            return res.json({ text: "I tried to access the data but the format was incorrect. Please try asking again specifically." });
        }

        if (!responseMessage.tool_calls) {
            return res.json({ text: responseMessage.content });
        }

        // 4. EXECUTE TOOLS
        messages.push(responseMessage);

        for (const toolCall of responseMessage.tool_calls) {
            let dbResult = null;
            const args = JSON.parse(toolCall.function.arguments);
            const name = toolCall.function.name;

            if (name === "get_vehicle_loans") {
                dbResult = await Loan.find({ 
                    loanType: { $regex: args.vehicleType, $options: 'i' } 
                }).sort({ interestRate: 1 }).lean();
            } 
            else if (name === "get_user_stats" && role === 'admin') {
                const statusMap = { "pending": 0, "approved": 1, "rejected": 2 };
                if (args.status === 'all') {
                    const [pending, approved, rejected] = await Promise.all([
                        LoanApplication.countDocuments({ loanStatus: 0 }),
                        LoanApplication.countDocuments({ loanStatus: 1 }),
                        LoanApplication.countDocuments({ loanStatus: 2 })
                    ]);
                    dbResult = { pending, approved, rejected, total: pending + approved + rejected };
                } else {
                    const count = await LoanApplication.countDocuments({ 
                        loanStatus: statusMap[args.status.toLowerCase()] 
                    });
                    dbResult = { status: args.status, count };
                }
            }

            messages.push({
                tool_call_id: toolCall.id,
                role: "tool",
                name: name,
                content: JSON.stringify(dbResult || { error: "No records found" })
            });
        }

        // 5. FINAL INTERPRETATION
        const secondResponse = await axios.post(GROQ_URL, {
            model: MODEL_NAME,
            messages
        }, { headers });

        return res.json({ text: secondResponse.data.choices[0].message.content });

    } catch (error) {
        // Improved error logging to see exactly what failed
        console.error("❌ Chat Error Details:", error.response?.data || error.message);
        
        // Handle the specific 'tool_use_failed' case gracefully for the user
        if (error.response?.data?.error?.code === 'tool_use_failed') {
            return res.status(200).json({ 
                text: "I had a technical glitch while trying to look that up. Could you try asking 'List the car loans'?" 
            });
        }

        res.status(500).json({ 
            text: "I'm having trouble connecting to my database right now." 
        });
    }
};

module.exports = { handleChat };