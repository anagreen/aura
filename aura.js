'use strict';

var request = require('request');
var url = require("url");
var path = require("path");

var Storage = require('./storage');
var storage = new Storage();
var Media = require('./media');
var media = new Media();
var Recognizer = require('./recognizer');
var recognizer = new Recognizer();


module.exports = Aura;

function Aura(){
    this.recognizeEmotions = recognizeEmotions;
    this.storeAndRecognize = storeAndRecognize;
}


function recognizeEmotions(fileName, callback) {
    media.convertAndSaveToTmp(storage.createFileReadStream(fileName),
        {
            inputFormat: 'flac',
            frequency: 8000,
            outputFormat: 'wav'
        },
        (err, data) => {
            recognizer.recognizeEmotions(data, (err, result) => {
                if (err) {
                    callback({ beyondverbal: err });
                } else {
                    callback(null, { beyondverbal: result });
                }
            });
        }
    );
}


function storeAndRecognize(audioURL, getOutputName, callback) {
    try {
        var pathname = url.parse(audioURL).pathname;
        var pathInfo = path.parse(pathname);
    } catch (err) {
        console.log(`Cannot parse audioUrl: ${audioURL}. Error: ${err}`);
        callback(err);
        return;
    }
    var outputFileName = getOutputName(pathInfo.name);
    var outputStream = storage.createFileWriteStream(outputFileName);
    media.convertToFlac(request.get(audioURL), outputStream,
        {
            inputFormat: pathInfo.ext.substring(1),
            bitrate: '128k',
            frequency: 48000
        },
        (err, result) => {
            if (err) {
                callback(err);
                return;
            } else {
                recognizer.recognizeText(storage.getFileUrl(outputFileName), callback);
                recognizeEmotions(outputFileName, callback);
            }
        }
    );
}