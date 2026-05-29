const jwt = require('jsonwebtoken');
const SECRET_KEY = 'asdfgewlnclnlhjkl';

const generateToken = (userId) => {
    // Generates a token that expires in 1 hour
    return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '1h' });
};

const validateToken = (req, res, next) => {
    // const token = req.header('authorization')?.split(' ')[1]; // Expected "Bearer <token>"

    const token = req.cookies && req.cookies.token; 
    console.log("token",token);

    if (!token) {
        return res.status(400).json({ message: "Authentication failed" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(400).json({ message: "Authentication failed" });
        }
        req.user = user;
        next();
    });
};

module.exports = { generateToken, validateToken };