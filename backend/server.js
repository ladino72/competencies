require('dotenv').config()
const express = require('express')

const jwt = require('jsonwebtoken');
const app = express()


const requireAuth = require("./middleware/requireAuth")

const AppError = require("./utils/appError")
const path = require('path')
const { logger, logEvents } = require('./middleware/logger')

const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)   //Watch out: this command was put it when I started using concurrently.
const PORT = process.env.PORT || 3500

console.log(process.env.NODE_ENV)

connectDB()

app.use(logger)

app.use(cors(corsOptions))
//app.use(cors())

//Init middleware
app.use(express.json())  //Important to be able to read info form req.body

app.use(cookieParser())


// Middleware to log decoded token payload  //
//logDecodedToken middleware is placed before the routes or middleware where the token is verified or processed. 
//Placing it early in the middleware chain is crucial for intercepting the request.
const logDecodedToken = (req, res, next) => {
    console.log("Here I am!")
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from header
  if (token) {
    const decoded = jwt.decode(token);
    console.log("Decoded token from server.js:", decoded); // Log decoded token payload
  }
  next();
};

// Apply the logDecodedToken middleware before errorHandler
app.use(logDecodedToken);

app.use('/', express.static(path.join(__dirname, 'public')))


app.use('/', require('./routes/root'))                     //This route is Not protected. 


app.use('/signupN', require('./routes/signupRoutes'))       //This route is not protected 
app.use('/loginN', require('./routes/loginRoutes'))         //This route is not protected 
app.use('/userRef', require('./routes/userRefRoutes'))         //This route is not protected 



app.use('/signUpBasic', require('./routes/signUpBasicRoutes'))       //This route is not protected signUpAdditionalInfo


app.use('/refreshToken', require('./routes/refreshTokenRoutes'))         //This route is not protected. AND IT SHOULD NOT!
//***Important*** When you use app.use(requireAuth), (from the express-jwt) it means that all subsequent routes 
//***registered after this middleware will go through this authentication process.
app.use(requireAuth);

app.get('/api/protected', (req, res) => {                 //This route is protected. It was create to test protection
     // Access the user information from req.user
     const { user: { id, name, roles } } = req.user;
     res.json({ id, name, roles, message: 'Access granted to protected route' });

  });


app.use('/activities', require('./routes/activityRoutes'))  //This route is protected. 
app.use('/grades', require('./routes/gradeRoutes'))         //This route is protected. 
app.use('/statistics', require('./routes/statisticRoutes')) //This route is protected. 
app.use('/dates', require('./routes/dateRoutes'))           //This route is protected. 
app.use('/signup', require('./routes/authRoutes'))          //This route is protected. 
app.use('/admin', require('./routes/adminRoutes'))          //This route is protected. 
app.use('/signUpGroups', require('./routes/signUpGroupsRoutes'))        

app.use('/courses', require('./routes/courseRoutes'))       //This route is protected. 
app.use('/users', require('./routes/userRoutes'))           //This route is  protected. 
app.use('/groups', require('./routes/groupRoutes'))         //This route is protected. 
app.use('/teacher', require('./routes/teacherRoutes'))         //This route is protected. 

app.use('/workshop', require('./routes/workshopRoutes'))         //This route is protected. 
app.use('/mfa', require('./routes/mfaRoutes'))         //This route is protected. 


app.use((req, res, next) => {
    console.log(req.cookies)

})


app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})





app.use(errorHandler)


mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})
