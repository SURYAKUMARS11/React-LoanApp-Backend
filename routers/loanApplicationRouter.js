const express = require('express');
const router = express.Router();
const { 
    getAllLoanApplications, getLoanApplicationsByUserId, getLoanApplicationById, 
    addLoanApplication, updateLoanApplication, deleteLoanApplication 
} = require('../controllers/loanApplicationController');
const { validateToken } = require('../authUtils');
const upload = require('../middlewares/upload'); 

router.get('/getAllLoanApplications', validateToken, getAllLoanApplications);
router.get('/getLoanApplicationsByUserId/:userId', validateToken, getLoanApplicationsByUserId);
router.get('/getLoanApplicationById/:id', validateToken, getLoanApplicationById);
router.post('/addLoanApplication', validateToken,  upload.single('file'),addLoanApplication);
router.put('/updateLoanApplication/:id', validateToken, updateLoanApplication);
router.delete('/deleteLoanApplication/:id', validateToken, deleteLoanApplication);

module.exports = router;