const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
    loanType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    interestRate: {
        type: Number,
        required: true
    },
    maximumAmount: {
        type: Number,
        required: true
    }
});


loanSchema.index({ loanType: 'text' });//need to verify

module.exports = mongoose.model('Loan', loanSchema);