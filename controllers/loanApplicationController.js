const LoanApplication = require('../models/loanApplicationModel');

const getAllLoanApplications = async (req, res) => {
    try {
        // PDF mentions optional pagination, search, and sorting
        const { searchValue, sortBy } = req.query;
        let query = {};
        if (searchValue) {
            query = { userName: { $regex: searchValue, $options: 'i' } };
        }
        
        const applications = await LoanApplication.find(query).sort(sortBy || 'submissionDate');
        res.status(200).json({ data: applications });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLoanApplicationsByUserId = async (req, res) => {
    try {
        const applications = await LoanApplication.find({ userId: req.params.userId });
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLoanApplicationById = async (req, res) => {
    try {
        const application = await LoanApplication.findById(req.params.id);
        if (!application) return res.status(404).json({ message: "Cannot find any loan" });
        res.status(200).json(application);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addLoanApplication = async (req, res) => {
    try {
        const applicationData = {
            ...req.body,
            file: req.file ? req.file.filename : null // Store only the filename
        };
        await LoanApplication.create(applicationData);
        res.status(200).json({ message: "Added Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateLoanApplication = async (req, res) => {
    try {
        const updated = await LoanApplication.findByIdAndUpdate(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: "Loan application not found" });
        res.status(200).json({ message: "Updated loan application successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteLoanApplication = async (req, res) => {
    try {
        const deleted = await LoanApplication.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Cannot find any loan" });
        res.status(200).json({ message: "Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getAllLoanApplications, 
    getLoanApplicationsByUserId, 
    getLoanApplicationById, 
    addLoanApplication, 
    updateLoanApplication, 
    deleteLoanApplication 
};