const express = require('express');
const router = express.Router();
const { getAllLoans, getLoanById, addLoan, updateLoan, deleteLoan } = require('../controllers/loanController');
const { validateToken } = require('../authUtils');

router.get('/getAllLoans', getAllLoans);
router.get('/getLoanById/:id', getLoanById);
router.post('/addLoan', validateToken, addLoan);
router.put('/updateLoan/:id', validateToken, updateLoan);
router.delete('/deleteLoan/:id', validateToken, deleteLoan);

module.exports = router;