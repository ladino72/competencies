const jwt = require("jsonwebtoken")
const User = require("./../models/User")
const asyncHandler = require('express-async-handler')
const AppError = require("./../utils/appError")

exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    // 1) Check if email and paswword exist
    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password" })
        //return next(new AppError("Please provide email and password", 400))

    }
    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password")


    if (!user || !(await user.correctPassword(password, user.password))) {
        //return res.status(401).json({ message: "Invalid credentials" })
        const error = { password2: "password" }


        const field = ["password"];

        //return next(new AppError("Invalid credentials-->", 401))
        return res.status(401).json({ messages: "Invalid credentials", fields: field })


    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })


    // 3) If everything is correct, send token to client

    res.status(200).json({
        status: "succsess",
        token
    });
})
