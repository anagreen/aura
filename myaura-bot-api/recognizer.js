'use strict';

var Promise = require('bluebird');
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
var analyzerObj = new Analyzer(conf.beyondverbal_api_key);
var analyze = Promise.promisify(analyzerObj.analyze, { context: analyzerObj });

module.exports = Recognizer;

function Recognizer() {
    this.recognizeEmotions = recognizeEmotions;
    this.recognizeText = recognizeText;
}


function recognizeEmotions(fileName) {
    return media.convertAndSaveToTmp(storage.createFileReadStream(fileName),
        {
            inputFormat: 'flac',
            frequency: 8000,
            outputFormat: 'wav'
        }
    ).then(analyze).then(data => { return { emotions: data } }).catch(err => {
        console.log(`BEYONDVERBAL ERROR: ${err}`);
        throw err;
    });
}


function recognizeText(audioUrl) {
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
    return new Promise((resolve, reject) => {
        speechClient.longRunningRecognize(request).then((responses) => {
            var operation = responses[0];
            var initialApiResponse = responses[1];

            operation.on('complete', (result, metadata, finalApiResponse) => {
                resolve({ text: result });
            });

            // operation.on('progress', (metadata, apiResponse) => {
            //     console.log(`PROGRESS: \n METADATA: ${JSON.stringify(metadata)}`);
            // })

            // Adding a listener for the "error" event handles any errors found during polling.
            operation.on('error', (err) => {
                console.log(`ERROR: \n ERROR: ${JSON.stringify(err)}`);
                reject({ text: err });
            })
        })
            .catch((err) => {
                console.error(err);
                reject(err);
            })
    }).catch(err => {
        console.log(`SPEECH ERROR: ${err}`);
        throw err;
    });
}