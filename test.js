require('dotenv').config()
require('express-async-errors')

//Security Packages
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const rateLimiter = require('express-rate-limit')
const https = require('https')

const connectDB =require('./db/connect')
const express = require('express');
const path = require('path')
const {readFile, writeFile, fstat, readFileSync} = require('fs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/user')
const authRouter = require('./routes/auth')
const casinoRouter = require('./routes/casino')
const Table = require('./db/models/table')
const Bet = require('./db/models/bet')

const app = express();
const {checkCookie} = require('./middleware/checkCookie');
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const { exitCode } = require('process');

const port = process.env.PORT || 5000

//clear dbs
async function deleteOldDB(){
  await Table.collection.drop()
  await Bet.collection.drop()
}

//Middleware
app.use(rateLimiter({  windowMs: 15 * 60 * 1000,  max: 10000 }))

app.use(helmet({
  contentSecurityPolicy: {directives: {'script-src':["'self'", "cdnjs.cloudflare.com","code.jquery.com"]}},
  crossOriginEmbedderPolicy: {policy: "require-corp"},
  crossOriginOpenerPolicy:true,
  crossOriginResourcePolicy: {policy: "same-origin"},
  dnsPrefetchControl:true,
  expectCt: true,
  frameguard:true,
  hidePoweredBy: true,
  hsts:true,
  ieNoOpen: true,
  noSniff:true,
  originAgentCluster: true,
  permittedCrossDomainPolicies:true,
  referrerPolicy:true,
  xssFilter:true,  
}) 
);

app.use(express.json())
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());
app.use(mongoSanitize());

 
//Routes
app.use(express.static('./public',{ methods: ['GET', 'POST'] }));
app.use('/api/v1/users',userRouter);
app.use('/api/v1/auth',authRouter)
app.use(express.static('./public',{ methods: ['GET', 'POST'] })); 
app.use(checkCookie,express.static('./private',{ methods: ['GET', 'POST'] }));
app.use('/api/v1/casino',casinoRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

async function start_HTTP_Server(){
    let cert = readFileSync(path.join(__dirname,'ssl','snqtechnology.crt'));
    let key =  readFileSync(path.join(__dirname,'ssl','snqtechnology.key'));
      
    const httpOptions = {
      cert:cert,
      key:key
    }
    try{
      await connectDB(process.env.connectionString);
      
      https.createServer(httpOptions,app).listen(port,() =>{
        console.log('Server is listening on port 5000....')
        console.log('Test 1 completed!')
        process.exit(0)
      })
        
    }catch (error){
      console.log(error);
    }
  }
  
  start_HTTP_Server()
