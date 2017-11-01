'use strict';

var request = require('request');
var Aura = require("./aura");
var aura = new Aura();

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
    var serviceResult = [];
    var sendRecognitionResult = (result) => {
        if (result.length == 2) {
            result.forEach((item) => {
                setTimeout((item) => {
                    if (item.beyondverbal) {
                        sendEmotions(senderID, item);
                    } else {
                        sendSpeech(senderID, item);
                    }
                }, 2000, item);
            });
        }
    }
    aura.storeAndRecognize(audioURL, (fileName) => { return `${senderID}-${fileName}.flac` },
        (err, result) => {
            if (err) {
                serviceResult.push(err);
                console.log(`ERROR storeAndRecognize: ${err}`);
                sendRecognitionResult(serviceResult);
            } else {
                serviceResult.push(result);
                console.log(`SUCCESSFULLY storeAndRecognize: ${err}`);
                sendRecognitionResult(serviceResult);
            }
        });
}

function sendEmotions(senderID, emotionsResult) {
    if (emotionsResult.beyondverbal.result) {
        setTimeout(sendTextMessage, 1000, senderID
            , `EMOTIONS RECOGNITION: duration=${emotionsResult.beyondverbal.result.duration}; sessionStatus=${emotionsResult.beyondverbal.result.sessionStatus}`);
            setTimeout(sendTextMessage, 1000, senderID, "analysisSegments:");
        emotionsResult.beyondverbal.result.analysisSegments.forEach((segment) => { sendTextMessage(senderID, `EMOTIONS. ${JSON.stringify(segment)}`) });
        setTimeout(sendTextMessage, 1000, senderID, `EMOTIONS. analysisSummary: ${JSON.stringify(emotionsResult.beyondverbal.result.analysisSummary)}`);
        setTimeout(sendTextMessage, 1000, senderID, `EMOTIONS. recordingId: ${emotionsResult.beyondverbal.recordingId}`);
    } else {
        setTimeout(sendTextMessage, 1000, senderID, `EMOTIONS error: ${JSON.stringify(emotionsResult)}`);
    }
}

function sendSpeech(senderID, speechResult) {
    if (speechResult.text.results) {
        setTimeout(sendTextMessage, 1000, senderID
            , 'TEXT ROCOGNITION');
        speechResult.text.results.forEach((item) => { sendTextMessage(senderID, `TEXT. alternatives: ${JSON.stringify(item.alternatives)}`) });
    } else {
        setTimeout(sendTextMessage, 1000, senderID, `TEXT error: ${JSON.stringify(speechResult)}`);
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
