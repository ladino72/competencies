const { promisify } = require("util")
const jwt = require("jsonwebtoken")
const User = require("./../models/User")
const Grades = require("./../models/Grade")
const asyncHandler = require('express-async-handler')
const AppError = require("./../utils/appError")

exports.signup = async (req, res, next) => {
    try {

        const newUser = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            roles: req.body.roles,
            labSubject: req.body.labSubject,
            labGroupNumber: req.body.labGroupNumber,
            teoSubject: req.body.teoSubject,
            teoGroupNumber: req.body.teoGroupNumber,
            //passwordChangedAt: req.body.passwordChangedAt

        })


        if (newUser.roles[0] == "student") {
            // if you delete the user you should delete the grades!
            const createLabGrade = await Grades.create({
                user: newUser._id,
                groupNumber: req.body.labGroupNumber,
                subject: req.body.labSubject
            })
            if (!createLabGrade) {
                return res.status(400).json({ message: 'While registering user No labgrade was created' })
            }

            const createTeoGrade = await Grades.create({
                user: newUser._id,
                groupNumber: req.body.teoGroupNumber,
                subject: req.body.teoSubject
            })
            if (!createTeoGrade) {
                return res.status(400).json({ message: 'While registering user No teograde was created' })
            }
        }





        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        })

        const cookieOptions = {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000*30),  //Watch out with this date
            httpOnly: true
        }

        if (process.env.NODE_ENV === "production") cookieOptions.secure = true

        res.cookie("jwt", token, cookieOptions)
        //Remove password from the output.
        //newUser.password = undefined

        res.status(201).json({
            status: "sucsess",
            token,
            data: {
                user: newUser
            }
        })
        //if user can't be created, throw an error 
    } catch (err) {
        next(err);

    }
}

exports.protect = asyncHandler(async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1]
    } else if (rq.cookies.jwt) {
        token = req.cookies.jwt;
    }
    console.log("token:", token)
    if (!token) {
        return next(new AppError("You are not logged in! Please log in to get access", 401))

        //return res.status(401).json({ message: 'You are not logged in! Please log in to get access' })
    }


    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    //console.log(decoded)--->  { id: '64038973aa0645b7d6071c67', iat: 1677956028, exp: 1685732028 }
    // Watch Protecting Tour Routes -Part 2 to learn about Error Mongoose!!!!
    //This part is incomplete

    // 3) Check if user still exists

    const currentuser = await User.findById(decoded.id)
    if (!currentuser) {

        //return res.status(401).json({ message: 'The user belongin to this token no longer exists' })
        return next(new AppError("The user belongin to this token no longer exists", 401))

    }


    // 4) Check if user changed password after the token was issued
    if (currentuser.changedPasswordAfter(decoded.iat)) {
        //return res.status(401).json({ message: 'User recently changed password! Please log in again.' })
        return next(new AppError("User recently changed password! Please log in again.", 401))
    }
    //GRANT ACCESS TO PROTECTED ROUTES
    req.user = currentuser;
    next()
});

