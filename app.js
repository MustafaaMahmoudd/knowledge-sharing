const morgan = require('morgan');
const cron=require('node-cron')
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitization = require('express-mongo-sanitize');
const xss = require('xss-clean');
const userRouter = require('./Routes/userRoute');
const trackRouter = require('./Routes/trackRoute');
const articleRouter = require('./Routes/articleRoute');
const postRouter=require('./Routes/postRoute')
const errorHandling = require('./Controllers/errorController');
const AppError = require('./utilities/AppErrors');
const newslettersRouter = require('./Routes/newslettersRoute');
const commentRoute=require('./Routes/commentRoute')
const app = express();
const https = require('https');
// const agent = new https.Agent({
//   rejectUnauthorized: false,
// });
const axios = require('axios');


// Function to make the API call
const makeApiCall = async () => {
  try {
    const response = await axios.delete('https://knowledge-sharing-1.onrender.com/api/v1/users');
    console.log(response.data);
    // Handle the response data here (e.g., save to database)
  } catch (error) {
    console.error('Error making API call:', error);
  }
};

// Schedule the task to run every 1 days
cron.schedule('0 0 */1 * *', () => {
  console.log('Running API call task...');
  makeApiCall();
});


const ApiCall = async () => {
  try {
    const response = await axios.get('https://knowledge-sharing-1.onrender.com/api/v1/tracks/sendArticle');
    console.log(response.data);
    // Handle the response data here (e.g., save to database)
  } catch (error) {
    console.error('Error making API call:', error);
  }
};

// Schedule the task to run every week
cron.schedule('0 0 * * 0', () => {
  console.log('Running API call task...');
  ApiCall();
});




app.use(cors());
// app.use()

app.options('*', cors());

console.log(process.env.NODE_ENV)

// app.use(helmet());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // to read data and populate req.body with these data

app.use(mongoSanitization()); // protect against NosQl query injection
app.use(xss());

app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tracks', trackRouter);
app.use('/api/v1/articles', articleRouter);
app.use('/api/v1/newsletters', newslettersRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/comments', commentRoute);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandling);
module.exports = app;
