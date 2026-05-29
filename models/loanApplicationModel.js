const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    loanType: {
        type: String,
        required: true
    },
    submissionDate: {
        type: Date,
        required: true
    },
    income: {
        type: Number,
        required: true
    },
    model: {
        type: Date,
        required: true
    },
    purchasePrice: {
        type: Number,
        required: true
    },
    loanStatus: {
        type: Number, 
        required: true,
        enum: [0, 1, 2],
        default: 0 
    },
    address: {
        type: String,
        required: true
    },
    file: {
        type: String, 
        required: true,
    }
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);