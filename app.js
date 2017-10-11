'use strict';

var restify = require('restify');
var request = require('request');
var url = require("url");
var path = require("path");
var tmp = require('tmp');
var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
var AWS = require('aws-sdk');
AWS.config.update({accessKeyId: 'ACCESS_KEY_ID', secretAccessKey: 'SECRET_ACCESS_KEY'}); //credentials should be changed
var s3Stream = require('s3-upload-stream')(new AWS.S3());




var speech = require('@google-cloud/speech')({
  projectId: 'aura-bot',
  keyFilename: 'KEY_FILE_NAME_PATH' // need to provide path to google speech API service credentials (json file)
});

var server = restify.createServer();
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.get('speech', function (req, res, next) {
  var config = {
    encoding: "FLAC",
    sampleRateHertz: 16000,
    languageCode: "en-US",
    enableWordTimeOffsets: false
  };
  var audio = {
    uri: "gs://cloud-samples-tests/speech/brooklyn.flac"
  };

  var speechRequest = {
    config: config,
    audio: audio
  };

  speech.recognize(speechRequest)
    .then((results) => {
      const transcription = results[0].results[0].alternatives[0].transcript;
      console.log(`Transcription: ${transcription}`);
      res.send(200, `Recognized: ${transcription}`);
      next();
    })
    .catch((err) => {
      res.send(200, 'Some problem with speech API integration')
      console.error('ERROR:', err);
    });
});

server.get('status', function (req, res, next) {
  res.send(200, 'Works !!!');
  next();
});

server.get('/webhook', function (req, res, next) {
  console.log(`REQUEST: ${JSON.stringify(req.query)}`);
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === '1a7941320973ae6f57a2a20585b9c936') {
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
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
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

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:",
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    messageAttachments.forEach((attachment) => processAttachment(attachment, senderID));
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function processAttachment(attachment, senderID) {
  switch (attachment.type) {
    case 'audio':
      processAudio(attachment, senderID);
    default:
      sendTextMessage(senderID, 'here is no handler for such attachment type.');
  }
}

function processAudio(attachment, senderID) {
  console.log(`User ID: ${senderID}`);
  var audioURL = attachment.payload.url
  console.log(`AUDIO: ${audioURL}`);
  copyToS3(senderID, audioURL);
}

server.get('testConvertion', function (req, res, next) {
  //copyToS3('assdqwd12', 'https://s3.amazonaws.com/aura-bot-storage/1418192464963903-audioclip-1507443710000-10078.mp4');
  //copyToS3('assdqwd12', 'file:///Users/Alex/workspace/aura/1418192464963903-audioclip-1507443710000-10078.mp4');
  copyToS3('assdqwd12', 'https://s3.amazonaws.com/aura-bot-storage/1418192464963903-audioclip-1506899171652-3680.aac');
  //copyToS3('assdqwd12', 'file:///Users/Alex/workspace/aura/1418192464963903-audioclip-1506899171652-3680-1.aac');
  res.send(200, 'Successfully !!!');
  next();
});

function copyToS3(senderID, audioUrl) {
  var pathname = url.parse(audioUrl).pathname;
  var pathInfo = path.parse(pathname);
  var fileName = `${senderID}-${pathInfo.name}.flac`;
  console.log(`File name: ${fileName}`);

  var upload = s3Stream.upload({
    Bucket: "aura-bot-storage",
    Key: fileName,
    ACL: "public-read",
    ContentType: "audio/flac"
  });
  upload.on('error', function (error) {
    console.log(error);
  });

  upload.on('part', function (details) {
    console.log(details);
  });
  upload.on('uploaded', function (details) {
    console.log(details);
  });

  switch (pathInfo.ext) {
    case '.aac':
      console.log('FORMAT ACC');
      ffmpeg(request.get(audioUrl))
        .inputFormat('aac')
        .audioBitrate('128k')
        .audioFrequency(44100)
        .outputFormat('flac')
        .on('error', function (err) {
          console.log('an error happened: ' + err.message);
        })
        .on('end', function () {
          console.log('Processing finished !');
        })
        .on('progress', function (progress) {
          console.log('Processing: ' + progress.percent + '% done');
        })
        .pipe(upload, { end: true });
      break;

    case '.mp4':
      console.log('FORMAT MP4');
      tmp.file(function _tempFileCreated(err, path, fd, cleanupCallback) {
        if (err) {
          console.log(`Some error during streaming to tmp file: ${err}`);
          return;
        }
        request(audioUrl).pipe(fs.createWriteStream(path)).on('finish', () => {
          ffmpeg(path)
            .inputFormat('mp4')
            .noVideo()
            .audioBitrate('128k')
            .audioFrequency(44100)
            .outputFormat('flac')
            .on('error', function (err) {
              console.log('an error happened: ' + err.message);
            })
            .on('end', function () {
              console.log('Processing finished !');
            })
            .on('progress', function (progress) {
              console.log('Processing: ' + progress.percent + '% done');
            })
            .pipe(upload, { end: true })
        });

        console.log('Request end !');
      });
      break;

    default:
      //sendTextMessage(senderID, `Cannot convert ${pathInfo.ext}`);
      console.log(`Cannot convert ${pathInfo.ext}`);
  }
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}


function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'EAABdes6dUT0BAAN5uDmpR5HzRFdKsFS3pCoui7uM0maoP3SZCwKzp4eiceEreWIh3dTIg1be8Hd86ElOhNZCyiC8YRc2Kk0SxMoLUHZB3UEuMInrZAZBegCylTOhpL8UZAVmeGYEdbzXBG6njm1FIQtqlMYpZA0tZBV7lKS5nDq0ywZDZD' },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s",
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}

server.listen(8081, function () {
  console.log('%s listening at %s', server.name, server.url);
});