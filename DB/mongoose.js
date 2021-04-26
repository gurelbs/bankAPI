const mongoose = require('mongoose')
require('dotenv').config();
const uri = process.env.ATLAS_URI
const connection = mongoose.connection 
mongoose.connect('mongodb+srv://gurel:DaBy18emmxKg6AkI@cluster0.qmznj.mongodb.net/BANKAPI?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })

connection.once('open', () => {
  console.log('Connected Database Successfully');
});