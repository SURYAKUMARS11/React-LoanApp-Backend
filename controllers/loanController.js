const Loan = require('../models/loanModel');

const getAllLoans = async (req, res) => {
    try {
        const loans = await Loan.find({});
        res.status(200).json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLoanById = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id);
        if (!loan) return res.status(404).json({ message: "Loan not found" });
        res.status(200).json(loan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addLoan = async (req, res) => {
    try {
        await Loan.create(req.body);
        res.status(200).json({ message: "Loan added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateLoan = async (req, res) => {
    try {
        const updatedLoan = await Loan.findByIdAndUpdate(req.params.id, req.body);
        if (!updatedLoan) return res.status(404).json({ message: "Loan not found" });
        res.status(200).json({ message: "Loan updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteLoan = async (req, res) => {
    try {
        const deletedLoan = await Loan.findByIdAndDelete(req.params.id);
        if (!deletedLoan) return res.status(404).json({ message: "Cannot find any loan" });
        res.status(200).json({ message: "Loan deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllLoans, getLoanById, addLoan, updateLoan, deleteLoan };