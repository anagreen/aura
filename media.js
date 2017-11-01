'use strict';

var tmp = require('tmp');
var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');


function MediaConverter(){
    this.convertToFlac = convertToFlac;
    this.convertAndSaveToTmp = convertAndSaveToTmp;
}

module.exports = MediaConverter;

function convert(readStream, outputStream, options, callback) {
    ffmpeg(readStream)
        .inputFormat(options.inputFormat)
        .audioBitrate(options.bitrate)
        .audioFrequency(options.frequency)
        .noVideo()
        .audioChannels(1)
        .outputFormat('flac')
        .on('error', function (err) {
            callback(err);
        })
        .pipe(outputStream, { end: true })
        .on('error', (err) => {
            console.log(`Error during audio converting: ${err}`);
            callback(err);
        })
        .on('finish', (result) => {
            console.log(`Audio successfully converted.`);
            callback(null, result);
        });
}


function convertToFlac(readStream, outputStream, options, callback) {

    var callbackWithCleaning = (cleanFunc) => {
        return (err, result) => {
            callback(err, result);
            cleanFunc();
        }
    };

    var convertThroughTmpFile = (readStream, outputStream, options, callback) => {
        tmp.file(function _tempFileCreated(err, path, fd, cleanupCallback) {
            if (err) {
                callbackWithCleaning(cleanupCallback)(err);
                return;
            }
            readStream.pipe(fs.createWriteStream(path))
                .on('error', callbackWithCleaning(cleanupCallback))
                .on('finish', () => {
                    return convert(path, outputStream, options, callbackWithCleaning(cleanupCallback));
                });
        });
    };

    switch (options.inputFormat) {
        case 'flac':
            console.log('FORMAT FLAC');
            readStream.pipe(outputStream)
            .on('error', (err) => {callback(err)})
            .on('finish', () => {callback(null, null)})
            break;

        case 'aac':
            console.log('FORMAT ACC');
            convert(readStream, outputStream, options, callback);
            break;

        case 'mp4':
            console.log('FORMAT MP4');
            convertThroughTmpFile(readStream, outputStream, options, callback);
            break;

        case 'm4a':
            console.log('FORMAT M4A');
            convertThroughTmpFile(readStream, outputStream, options, callback);
            break;

        case 'wav':
            console.log('FORMAT WAV');
            convertThroughTmpFile(readStream, outputStream, options, callback);
            break;

        default:
            callback(`Cannot convert such format ${options.inputFormat}`);
    }
}


function convertAndSaveToTmp(readStream, options, callback) {
    var callbackWithCleaning = (cleanFunc) => {
        return (err, data) => {
            cleanFunc();
            callback(err, data);
        }
    }

    tmp.file({ postfix: '.wav' }, function _tempFileCreated(err, path, fd, cleanupCallback) {
        if (err) {
            console.log(`Some error during streaming to tmp file: ${err}`);
            return;
        }
        console.log(`TMP PATH: ${path}`);
        ffmpeg(readStream)
            .inputFormat(options.inputFormat)
            .audioFrequency(options.frequency)
            .outputFormat(options.outputFormat)
            .save(path)
            .on('end', () => { fs.readFile(path, callbackWithCleaning(cleanupCallback)); })
            .on('err', callbackWithCleaning(cleanupCallback));
    });
}