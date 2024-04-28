const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Track = require('../Models/trackModel');
const subTrack = require('../Models/subTrackModel');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATA_BASE_PASSWORD
);
mongoose.connect(DB).then(() => {
  console.log('DB connection successfully');
});

const jsonFile = fs.readFileSync(`${__dirname}/fields.json`, 'utf-8');
const documents = JSON.parse(jsonFile);

const subTracks = JSON.parse(
  fs.readFileSync(`${__dirname}/subTrack.json`, 'utf-8')
);

const importData = async () => {
  try {
    // await Track.create(documents);
    // await subTrack.create(subTracks);
    console.log('data loaded successfully');
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  // await subTrack.deleteMany();
  // await Track.deleteMany();
  console.log('data deleted successfully');
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
