require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Routers
const userRouter = require('./routers/userRouter');
const loanRouter = require('./routers/loanRouter');
const loanApplicationRouter = require('./routers/loanApplicationRouter');
const chatRoutes = require('./routers/chatRoutes');

const app = express();

// Middleware
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:8081',
    'https://react-loan-9z8st0tu4-suryas-projects-bc06efa8.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB Atlas");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => console.log("DB Connection Error: ", err));

// Routes
app.use('/uploads', express.static('uploads'));
app.use('/api/user', userRouter);
app.use('/api/loan', loanRouter);
app.use('/api/loanApplication', loanApplicationRouter);
app.use('/api/chat', chatRoutes);