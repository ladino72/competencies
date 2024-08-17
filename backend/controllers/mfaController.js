
const asyncHandler = require('express-async-handler')

const mongoose = require('mongoose');
const { ObjectId } = mongoose;
const { validationResult } = require('express-validator');
const User = require('../models/User');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');



const enableMFAgenerateQR = async (req, res) => {
    // Handle validation errors
     
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.body;

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ errors: [{ msg: 'User not found' }] });
        }

        // Generate a secret key
        const secret = speakeasy.generateSecret({ length: 20 });

        // Save the secret to the user's record in the database
        user.mfaSecret = secret.base32;
        await user.save();

        // Generate a QR code for Google Authenticator
        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) {
                return res.status(500).json({ errors: [{ msg: 'Failed to generate QR code' }] });
            }

            // Send the QR code data_url to the frontend
            res.json({ qrCode: data_url });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
}

const veryfyMFAcode = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, authCode } = req.body;
    console.log("userId and authCode",userId,authCode)

    try {
        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ errors: [{ msg: 'User not found' }] });
        }

        // Verify the auth code using the stored MFA secret
        const isVerified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: authCode,
            window: 1  // Allows for a 30-second time window leeway
        });
        

        if (!isVerified) {
            return res.status(400).json({ errors: [{ msg: 'Invalid or expired authentication code' }] });
        }

        // If verification is successful
        res.json({ message: 'MFA verification successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: [{ msg: 'Server error' }] });
    }
}



  module.exports = {
    enableMFAgenerateQR,
    veryfyMFAcode
  }