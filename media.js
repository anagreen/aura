'use strict';

const Promise = require('bluebird');
const tmp = require('tmp-promise');
const fs = Promise.promisifyAll(require('fs'));
const ffmpeg = require('fluent-ffmpeg');


function MediaConverter() {
    this.convertToFlac = convertToFlac;
    this.convertAndSaveToTmp = convertAndSaveToTmp;
}

module.exports = MediaConverter;

function convert(readStream, outputStream, options) {
    return new Promise((resolve, reject) => {
        ffmpeg(readStream)
            .inputFormat(options.inputFormat)
            .audioBitrate(options.bitrate)
            .audioFrequency(options.frequency)
            .noVideo()
            .audioChannels(1)
            .outputFormat('flac')
            .on('error', reject)
            .pipe(outputStream, { end: true })
            .on('error', reject)
            .on('finish', resolve);
    });
}


function convertToFlac(readStream, outputStream, options) {
    return new Promise((resolve, reject) => {
        if (options.inputFormat === 'flac') {
            readStream.pipe(outputStream)
                .on('error', reject)
                .on('finish', resolve);
        } else if (options.inputFormat === 'aac') {
            convert(readStream, outputStream, options).then(resolve).catch(reject);
        } else if (['mp4', 'm4a', 'wav'].indexOf(options.inputFormat) >= 0) {
            tmp.withFile(file => {
                return new Promise((tmpResolve, tmpReject) => {
                    readStream.pipe(fs.createWriteStream(file.path))
                        .on('error', tmpReject)
                        .on('finish', () => {
                            convert(file.path, outputStream, options).then(tmpResolve).catch(tmpReject);
                        })
                })
            }).then(resolve).catch(reject);
        } else {
            reject(`Cannot convert such format ${options.inputFormat}`);
        }
    })
}


function convertAndSaveToTmp(readStream, options) {
    return tmp.withFile(file => {
        return new Promise((resolve, reject) => {
            console.log(`TMP FILE: ${file.path}`);
            ffmpeg(readStream)
                .inputFormat(options.inputFormat)
                .audioFrequency(options.frequency)
                .outputFormat(options.outputFormat)
                .on('error', reject)
                .save(file.path)
                .on('end', () => { resolve(fs.readFileAsync(file.path)); })
                .on('error', reject);
        });
    }, { postfix: '.wav' });
}