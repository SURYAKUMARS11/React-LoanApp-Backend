// server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// 1. MongoDB Models
const LoanSchema = new mongoose.Schema({
    name: String,
    type: String, // 'car', 'bike', 'truck'
    interestRate: Number,
    minAmount: Number
});

const UserSchema = new mongoose.Schema({
    name: String,
    role: String, // 'admin' or 'user'
    appliedLoans: [String]
});

const Loan = mongoose.model('Loan', LoanSchema);
const User = mongoose.model('User', UserSchema);

// 2. Gemini Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 3. Database Tool Functions (The logic Gemini will call)
const tools = {
    get_best_loan: async ({ vehicleType }) => {
        const loan = await Loan.findOne({ type: vehicleType }).sort({ interestRate: 1 });
        return loan ? loan : "No loans found for this type.";
    },
    get_user_stats: async ({ loanType }) => {
        const count = await User.countDocuments({ appliedLoans: loanType });
        return { loanType, totalApplications: count };
    }
};

// 4. Chat Endpoint
app.post('/api/chat', async (req, res) => {
    const { message, role } = req.body; // In production, get 'role' from JWT token

    try {
        // Define tool declarations based on role
        const toolDeclarations = [];
        toolDeclarations.push({
            name: "get_best_loan",
            description: "Find the lowest interest rate loan for a specific vehicle type (car, bike, truck).",
            parameters: {
                type: "OBJECT",
                properties: { vehicleType: { type: "string" } }
            }
        });

        if (role === 'admin') {
            toolDeclarations.push({
                name: "get_user_stats",
                description: "Admin only: Returns total number of users who applied for a specific loan type.",
                parameters: {
                    type: "OBJECT",
                    properties: { loanType: { type: "string" } }
                }
            });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            tools: [{ functionDeclarations: toolDeclarations }],
            systemInstruction: `You are the EasyDrive Loan Assistant. You are talking to a ${role}. 
            If they ask about the app, say we offer fast vehicle financing. 
            If a user asks for admin data, tell them they don't have permission.`
        });

        const chat = model.startChat();
        let result = await chat.sendMessage(message);
        let response = result.response;

        // Check if Gemini wants to call a function
        const call = response.functionCalls()?.[0];
        if (call) {
            const data = await tools[call.name](call.args);
            // Send the DB data back to Gemini for a natural response
            const secondResult = await chat.sendMessage([{
                functionResponse: { name: call.name, response: data }
            }]);
            res.json({ text: secondResult.response.text() });
        } else {
            res.json({ text: response.text() });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

mongoose.connect(process.env.MONGO_URI).then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"));
});