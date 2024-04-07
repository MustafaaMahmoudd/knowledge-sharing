const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

//Database connection
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATA_BASE_PASSWORD
  );
mongoose.connect(DB).then(() => {
  console.log('DB connection successfully');
});
const port = 5000;
let server = app.listen(port, () => {
  console.log('app is running on port 5000');
});
