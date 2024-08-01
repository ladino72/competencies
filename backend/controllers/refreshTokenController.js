const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET; // Replace with your secret key

const refreshToken = async (req, res) => {
    const expiredToken = req.headers.authorization?.split(' ')[1];

    if (!expiredToken) {
        return res.status(401).json({ message: 'Expired token is missing' });
    }

    try {
       
        //const decoded = jwt.verify(expiredToken, secretKey); This Line caused me more 3 hours of problems. Don't ever use it
        const decoded = jwt.decode(expiredToken); // Decode without verification
        if (!decoded || typeof decoded.exp === 'undefined') {
            throw new Error('Invalid token');
        }
        // Verify if the token is expired
        const expirationTime = decoded.exp; // Assuming the expiration time is in seconds
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        

        //if (expirationTime > currentTimeInSeconds) {
            if (expirationTime <= currentTimeInSeconds) {
            // Token is expired, generate a new token
            const { user: { id, name, roles } } = decoded; // Access user from decoded token
            const user = { id, name, roles };

            const expirationTimeHours = 1 // 1 hour
            const expirationTimeSeconds = expirationTimeHours*3600
            const newToken = jwt.sign({ user }, secretKey, { expiresIn: expirationTimeSeconds });
            
            return res.status(200).json({ newToken });
        } else {
            return res.status(200).json({ message: 'Token is still valid' });
        }
    } catch (error) {
        console.error('Error in token refresh:', error);
        return res.status(401).json({ message: 'Token refresh failed' });
    }
};

module.exports = { refreshToken };