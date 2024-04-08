const morgan = require('morgan');
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

app.use(cors());

app.options('*', cors());

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
