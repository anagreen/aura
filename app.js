'use strict';

var conf = require("./config");
var restify = require('restify');
var request = require('request');
var url = require("url");
var path = require("path");
var Aura = require("./aura");
var aura = new Aura();
var Messenger = require("./messenger");
var messenger = new Messenger();
var Storage = require("./storage");
var storage = new Storage();
var Recognizer = require("./recognizer");
var recognizer = new Recognizer();
var extend = require('extend');

var server = restify.createServer();
server.server.setTimeout(60000 * 10);
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());


server.get('status', function (req, res, next) {
  res.send(200, 'Works !!!');
  next();
});

server.get('checkDbConnection', function (req, res, next) {
  storage.connectToDB((err, result) => {
    if (err) {
      res.send(200, err);
      next();
    } else {
      res.send(200, result);
      next();
    }
  });
});

server.get('beyondVerbal', function (req, res, next) {
  var audioFile = req.query.audio;
  console.log(`audio: ${audioFile}`);
  recognizer.recognizeEmotions(audioFile, (err, result) => {
    if (err) {
      console.log(`BEYONDVERBAL ERROR: ${err}`);
      res.send(400, `BEYONDVERBAL ERROR: ${err}`);
      next();
    } else {
      console.log(`BEYONDVERBAL: ${JSON.stringify(result)}`);
      res.send(200, JSON.stringify(result));
      next();
    }
  })
});

server.get('storeAndRecognize', function (req, res, next) {
  var audioURL = req.query.audio;
  var serviceResult = {};
  aura.storeAndRecognize(audioURL,
    (name) => { 
      serviceResult.fileName = `${name}.flac`;
      serviceResult._id = serviceResult.fileName
      return serviceResult.fileName;
    },
    (err, result) => {
      if (err) {
        extend(serviceResult, err);
        console.log(`ERROR storeAndRecognize: ${err}`);
        if (serviceResult.emotions && serviceResult.text) {
          res.send(400, err);
          next();
        }
      } else {
        extend(serviceResult, result);
        if (serviceResult.emotions && serviceResult.text) {
          storage.insertToDb(serviceResult, (err, r) => {
            if(err) {
              res.send(400, err);
              next();
            } else {
              console.log(`Success storeAndRecognize: ${r}`);
              res.send(200, JSON.stringify(serviceResult));
              next();
            }
          });
        }
      }
    }
  );
});

server.get('recognize', function (req, res, next) {
  var audioFileName = req.query.audio;
  recognizer.recognizeText(storage.getFileUrl(audioFileName),
    (err, result) => {
      if (err) {
        console.log(`ERROR recognize: ${err}`);
        res.send(400, err);
        next();
      } else {
        console.log(`Success recognize`);
        res.send(200, result);
        next();
      }
    });
});


// Facebook Messenger

server.get('/webhook', function (req, res, next) {
  console.log(`REQUEST: ${JSON.stringify(req.query)}`);
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === conf.facebook_verify_token) {
    console.log("Validating webhook");
    res.sendRaw(200, req.query['hub.challenge']);
    next();
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.send(403);
  }
});

server.post('/webhook', function (req, res, next) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function (entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function (event) {
        if (event.message) {
          messenger.receivedMessage(event);
        } else {
          //console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.send(200);
  }
});


server.listen(conf.web_port, function () {
  console.log('%s listening at %s', server.name, server.url);
});