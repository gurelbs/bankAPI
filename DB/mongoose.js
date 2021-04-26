const mongoose = require('mongoose')
require('dotenv').config();
const uri = process.env.ATLAS_URI
const connection = mongoose.connection 
mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })

connection.once('open', () => {
  console.log('Connected Database Successfully');
});