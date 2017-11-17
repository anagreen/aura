'use strict';

const conf = require('./config');
var request = require('request');
var Aura = require("./aura");
var aura = new Aura();
var extend = require('extend');
var Storage = require("./storage");
var storage = new Storage();

module.exports = Messenger;

function Messenger() {
    this.receivedMessage = receivedMessage;
}

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
        //sendTextMessage(senderID, 'here is no handler for such attachment type.');
    }
}

function processAudio(attachment, senderID) {
    console.log(`User ID: ${senderID}`);
    var audioURL = attachment.payload.url
    console.log(`AUDIO: ${audioURL}`);
    var serviceResult = {facebookId: senderID};
    var sendRecognitionResult = (result) => {
        if (serviceResult.emotions && serviceResult.text) {
            sendEmotions(senderID, serviceResult.emotions, 1000);
            sendSpeech(senderID, serviceResult.text, 3000);
            sendFileName(senderID, serviceResult.fileName, 4000)
            storage.insertToDb(serviceResult, (err, r) => {
                if(err) {
                    sendTextMessage(senderID, `Cannot insert into DB: ${err}`);
                  } else {
                    sendTextMessage(senderID, `Stored in DB: ${JSON.stringify(r)}`);
                  }
            });
        }
    }
    aura.storeAndRecognize(audioURL, (fileName) => {
        serviceResult.fileName = `${senderID}-${fileName}.flac`;
        serviceResult._id = serviceResult.fileName;
        return serviceResult.fileName
    },
        (err, result) => {
            if (err) {
                extend(serviceResult, err);
                console.log(`ERROR storeAndRecognize: ${err}`);
                sendRecognitionResult(serviceResult);
            } else {
                extend(serviceResult, result);
                console.log(`SUCCESSFULLY storeAndRecognize: ${err}`);
                sendRecognitionResult(serviceResult);
            }
        });
}

function sendEmotions(senderID, emotionsResult, timeOffset) {
    if (emotionsResult.result) {
        setTimeout(sendTextMessage, timeOffset + 100, senderID
            , `EMOTIONS RECOGNITION: duration=${emotionsResult.result.duration}; sessionStatus=${emotionsResult.result.sessionStatus}`);
        var i = 0;
        if(emotionsResult.result.analysisSegments) emotionsResult.result.analysisSegments.forEach((segment) => { 
            setTimeout(sendTextMessage, timeOffset + 200 + i*100, senderID, `EMOTIONS. segment ${i}: offset: ${segment.offset}, duration: ${segment.duration}, end: ${segment.duration}`);
            setTimeout(sendTextMessage, timeOffset + 220 + i*100, senderID, `EMOTIONS. segment ${i}: Temper: ${JSON.stringify(segment.analysis.Temper)}`);
            setTimeout(sendTextMessage, timeOffset + 240 + i*100, senderID, `EMOTIONS. segment ${i}: Valence: ${JSON.stringify(segment.analysis.Valence)}`);
            setTimeout(sendTextMessage, timeOffset + 260 + i*100, senderID, `EMOTIONS. segment ${i}: Arousal: ${JSON.stringify(segment.analysis.Arousal)}`);
            setTimeout(sendTextMessage, timeOffset + 280 + i*100, senderID, `EMOTIONS. segment ${i}: Mood: ${JSON.stringify(segment.analysis.Mood)}`);
            i = i + 1;
        });
        setTimeout(sendTextMessage, timeOffset + 1000, senderID, `EMOTIONS. analysisSummary: ${JSON.stringify(emotionsResult.result.analysisSummary)}`);
        setTimeout(sendTextMessage, timeOffset + 1100, senderID, `EMOTIONS. recordingId: ${emotionsResult.recordingId}`);
    } else {
        setTimeout(sendTextMessage, timeOffset + 100, senderID, `EMOTIONS error: ${JSON.stringify(emotionsResult)}`);
    }
}

function sendSpeech(senderID, speechResult, timeOffset) {
    if (speechResult.results) {
        setTimeout(sendTextMessage, timeOffset + 100, senderID
            , 'TEXT ROCOGNITION:');
        speechResult.results.forEach((item) => { setTimeout(sendTextMessage, timeOffset + 200, senderID, `TEXT. alternatives: ${JSON.stringify(item.alternatives)}`) });
    } else {
        setTimeout(sendTextMessage, timeOffset + 100, senderID, `TEXT error: ${JSON.stringify(speechResult)}`);
    }
}

function sendFileName(senderID, fileName, timeOffset) {
    setTimeout(sendTextMessage, timeOffset + 100, senderID, `FILE NAME: ${fileName}`);
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
        qs: { access_token: conf.facebook_access_token },
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
