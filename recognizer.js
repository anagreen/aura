'use strict';

const conf = require('./config');
var speech = require('@google-cloud/speech');
var speechClient = speech.v1({
    projectId: conf.google_project_id,
    keyFilename: conf.google_key_file
});
var Storage = require('./storage');
var storage = new Storage();
var Media = require('./media');
var media = new Media();
var Analyzer = require('./analyzer-v3');
var analyzer = new Analyzer(conf.beyonverbal_api_key);

module.exports = Recognizer;

function Recognizer() {
    this.recognizeEmotions = recognizeEmotions;
    this.recognizeText = recognizeText;
}


function recognizeEmotions(fileName, callback) {
    media.convertAndSaveToTmp(storage.createFileReadStream(fileName),
        {
            inputFormat: 'flac',
            frequency: 8000,
            outputFormat: 'wav'
        },
        (err, data) => {
            if (err) {
                callback({ emotions: err });
            } else {
                analyzer.analyze(data, (err, analysis) => {
                    console.log(`EMOTIONS: result: ${JSON.stringify(analysis)}.    error: ${err}`);
                    callback(err, { emotions: analysis });
                });
            }
        }
    );
}


function recognizeText(audioUrl, callback) {
    var encoding = speech.v1.types.RecognitionConfig.AudioEncoding.FLAC;
    var sampleRateHertz = 48000;
    var languageCode = 'en-US';
    var config = {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode
    };
    var audio = {
        uri: audioUrl
    };
    var request = {
        config: config,
        audio: audio
    };


    console.log('Start speech recognition');
    speechClient.longRunningRecognize(request).then((responses) => {
        var operation = responses[0];
        var initialApiResponse = responses[1];

        operation.on('complete', (result, metadata, finalApiResponse) => {
            console.log(`COMPLETE: \n RESULT:${JSON.stringify(result)}`);
            callback(null, { text: result });
        });

        // Adding a listener for the "progress" event causes the callback to be
        // called on any change in metadata when the operation is polled.
        operation.on('progress', (metadata, apiResponse) => {
            console.log(`PROGRESS: \n METADATA: ${JSON.stringify(metadata)}`);
        })

        // Adding a listener for the "error" event handles any errors found during polling.
        operation.on('error', (err) => {
            console.log(`ERROR: \n ERROR: ${JSON.stringify(err)}`);
            callback({ text: err });
        })
    })
        .catch((err) => {
            console.error(err);
            callback(err);
        });
}