'use strict';

var speech = require('@google-cloud/speech');
var speechClient = speech.v1({
    projectId: 'aura-bot',
    keyFilename: 'aura-bot-0000000000.json'
});
var Analyzer = require('./analyzer-v3');
var analyzer = new Analyzer('BEYONDVERBAL_API_KEY');

module.exports = Recognizer;

function Recognizer(){
    this.recognizeEmotions = recognizeEmotions;
    this.recognizeText = recognizeText;
}


function recognizeEmotions(data, callback) {
    analyzer.analyze(data, (err, analysis) => {
        console.log(`EMOTIONS: result: ${JSON.stringify(analysis)}.    error: ${err}`);
        callback(err, analysis);
    });
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
            callback(null, {text: result});
        });

        // Adding a listener for the "progress" event causes the callback to be
        // called on any change in metadata when the operation is polled.
        operation.on('progress', (metadata, apiResponse) => {
            console.log(`PROGRESS: \n METADATA: ${JSON.stringify(metadata)}`);
        })

        // Adding a listener for the "error" event handles any errors found during polling.
        operation.on('error', (err) => {
            console.log(`ERROR: \n ERROR: ${JSON.stringify(err)}`);
            callback({text: err});
        })
    })
        .catch( (err) => {
            console.error(err);
            callback(err);
        });
}