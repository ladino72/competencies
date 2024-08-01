const AppError = require("./../utils/appError")

const { logEvents } = require('./logger')

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}:${err.value}`
    return new AppError(message, 400)
}

//handle email or usename duplicates
const handleDuplicateKeyError = (err, res) => {
    const field = Object.keys(err.keyValue);
    const code = 409;
    const error = `An account with that ${field} already exists.`;
    res.status(code).send({ messages: error, fields: field });
}

//handle field formatting, empty fields, and mismatched passwords 
const handleValidationError = (err, res) => {
    let errors = Object.values(err.errors).map(el => el.message);
    let fields = Object.values(err.errors).map(el => el.path);
    let code = 400;

    if (errors.length > 1) {
        const formattedErrors = errors.join(' ');
        res.status(code).send({ messages: formattedErrors, fields: fields });
    } else {
        res.status(code).send({ messages: errors, fields: fields })
    }
}

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    })
}

const sendErrorProd = (err, res) => {
    //Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
        //Programming or other unknown error: don't leak error details
    } else {
        // 1) Log error
        console.error("ERROR 🔥", err);

        // 2) Send general message
        res.status(500).json({
            status: "error",
            message: "Something went very wrong"
        })
    }
};

const errorHandler = (err, req, res, next) => {

  

    
    logEvents(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    console.log(err.stack)

    try {
        console.log('Congrats you hit the error middleware');
        if (err.name === 'UnauthorizedError') {
            // JWT verification failed
            res.status(401).json({ message: 'Invalid token or authentication failure.' });
        }
        if (err.name === 'ValidationError') return err = handleValidationError(err, res);
        if (err.code && err.code == 11000) return err = handleDuplicateKeyError(err, res);
    } catch (err) {
        res.status(500).send('An unknown error occured.');
    }


}

module.exports = errorHandler