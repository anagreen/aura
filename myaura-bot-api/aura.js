'use strict';

var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var url = require("url");
var path = require("path");
var extend = require('extend');

var Storage = require('./storage');
var storage = new Storage();
var Media = require('./media');
var media = new Media();
var Recognizer = require('./recognizer');
var recognizer = new Recognizer();


module.exports = Aura;

function Aura() {
    this.storeAndRecognize = storeAndRecognize;
}

function storeAndRecognize(audioURL, getOutputName, firstName, lastName, messengerId) {
    return new Promise((resolve, reject) => {
        try {
            var pathname = url.parse(audioURL).pathname;
            var pathInfo = path.parse(pathname);
        } catch (err) {
            console.log(`Cannot parse audioUrl: ${audioURL}. Error: ${err}`);
            reject(err);
        }
        var outputFileName = getOutputName(pathInfo.name);
        var outputStream = storage.createFileWriteStream(outputFileName);
        let resultObj = { 
            _id: outputFileName,
            firstName: firstName,
            lastName: lastName,
            messengerId: messengerId
        };

        return media.convertToFlac(request.get(audioURL), outputStream,
            {
                inputFormat: pathInfo.ext.substring(1),
                bitrate: '128k',
                frequency: 48000
            }).then(() => {
                return Promise.reduce([
                    recognizer.recognizeText(storage.getFileUrl(outputFileName)),
                    recognizer.recognizeEmotions(outputFileName)
                ], (result, recognition) => {
                    //console.log(`RECOGNITION: ${JSON.stringify(recognition)}`);
                    return extend(result, recognition);
                }, resultObj)
            }).then(result =>
                Promise.promisify(storage.insertToDb, { context: storage })(result)
                    .then(dbResult => resolve(result))
            )
            .catch(reject);
    });
}
