// Get Requirements
const express = require('express');
const app = express();
var router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const shortUrl = require('../models/shortUrl.js');
const GoogleImages = require('google-images');
const client = new GoogleImages('010314164505178810779:kakhwalzbqy', 'AIzaSyBjWmEZbUKsH7uRPSz-9QNjuu6BUmwfgJE');
const searchTerm = require('../models/searchTerm.js');
const multer = require('multer');
var upload = multer({dest:'uploads/'});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// Connect to database
mongoose.connect('mongodb://tungdt:123456@ds147681.mlab.com:47681/tungdt');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Free Code Camp Microservice' });
});

/* =========== TimeStamp Service =========== */
router.get('/api/timestamp/:time',function(req,res){

function unixToNatural(unix){
  var date = new Date(unix * 1000);
  var months = ['January','February','March','Apirl','May','June','July','August','September','October','November','December'];
  var month = months[date.getMonth()];
  var day = date.getDate();
  var year = date.getFullYear();
  var result = month + ' ' +day +', '+year;
  return result;
}

if(!isNaN(req.params.time)){
  var result = unixToNatural(req.params.time);
  var data ={unix : req.params.time, natural: result};
  res.json(data);
}else {
  var natural = new Date(req.params.time);
  if(!isNaN(natural)){
    var unix = natural / 1000;
    var data = {unix: unix, natural: req.params.time};
    res.json(data);
  }else {
    res.json({unix: null, natural : null});
  }
}
});

/* =========== Request Header Parser Microservice =========== */
router.get('/api/whoami',function(req, res){
var ipAddress = req.ip;
var language =  req.headers["accept-language"];
var softWare = req.get('User-Agent');
res.json({
  'ipaddress':ipAddress, 
  'language':language[0],
  'software' :softWare});
});

/* =========== URL Shortener Microservice =========== */
router.get('/api/shorturl/new/:urlToShorten(*)',(req, res, next)=>{
    var urlToShorten = req.params.urlToShorten;
    var regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    if(regex.test(urlToShorten)){
        console.log("It's an url");
        var short = Math.floor(Math.random() * 100000).toString();
        console.log('Shorter url: '+short);
        var data = new shortUrl({
            originalUrl : urlToShorten,
            shorterUrl : short
        });
        data.save(err =>{
            if(err) return res.send('Error saving to database');
        });
    }else {
        var data = new shortUrl({
            originalUrl : urlToShorten,
            shorterUrl : 'Invalid URL'
        });
        data.save(err =>{
            if(err) return res.send('Error saving to database');
        });
    }
    res.json(data);
});

// Query database forward to original URL
router.get('/api/shorturl/:urlToForward',(req, res, next)=>{
    var shorterUrl = req.params.urlToForward;
    console.log(shorterUrl);
    shortUrl.findOne({'shorterUrl' : shorterUrl}, (err,data)=>{
        if(err) return res.send('Error query from datbase');
        if(data === null) return res.send('No data on database');
        var regex = new RegExp("^(http|https)://","i");
        var strToCheck = data.originalUrl;
        if(regex.test(strToCheck)){
            res.redirect(301,data.originalUrl);
        }else {
            res.redirect(301,'http://'+data.originalUrl);
        }
    });
});

/* =========== Image Search Abstraction Layer Incomplete =========== */
router.get('/api/imagesearch/:searchVal*',(req, res)=>{
    var searchVal = req.params.searchVal;
    var offset = req.query.offset;
    var data = new searchTerm({
        searchVal,
        searchDate: new Date()
    });

    data.save(err => {
        if(err){
            res.send('Error saving to database');
        }
    });

    client.search(searchVal, {page : offset}).then((images,err) => {
        if(err) throw err;
        res.json(images);
    });
});

router.get('/api/imagesearch/latest/',(req, res, next)=>{
    searchTerm.find({},function(err,searchTerm){
        var searchTermMap = {};
        searchTerm.forEach((result)=>{
            searchTermMap[result._id] = result;
        });
        res.send(searchTermMap);
    });
});

/* =========== Image Search Abstraction Layer Incomplete =========== */
router.post('/api/fileupload',upload.single('file'),(req, res, next)=>{
  console.log("listen file");
  return res.json(req.file);
});

module.exports = router;
