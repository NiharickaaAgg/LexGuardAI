const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token =
            req.cookies?.lexguard_token ||
            (req.headers.authorization?.startsWith('Bearer ')
                ? req.headers.authorization.split(' ')[1]
                : null);

        if (!token) return res.status(401).json({ success: false, message: 'Not authenticated.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ success: false, message: 'User no longer exists.' });

        req.user = user;
        next();
    } catch (err) {
        const msg = err.name === 'TokenExpiredError' ? 'Session expired.' : 'Invalid token.';
        res.status(401).json({ success: false, message: msg });
    }
};

module.exports = { protect };