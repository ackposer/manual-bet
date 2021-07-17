const express = require('express');
const app = express();
const ejs = require('ejs');
const port = 3000;
const dbURI = 'mongodb+srv://admin:dTOmUQO1KF2xqqoP@cluster0.svwf0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const mongoose = require('mongoose');
const mongoOpts = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}
const Meeting = require('./schema/Meeting.js');
console.log(Meeting);

mongoose.connect(dbURI, mongoOpts)
.then(result => {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })
});

app.use(express.static('./'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  Meeting.find({})
  .then(data => {
    res.render('index', {data});
  })
  .catch(err => console.error(err));
});