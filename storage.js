'use strict';

var storage = require('@google-cloud/storage')({
    projectId: 'aura-bot',
    keyFilename: 'aura-bot-000000000.json'
});
var myBucket = storage.bucket('aura-storage');

function Storage(){
    this.createFileWriteStream = createFileWriteStream;
    this.createFileReadStream = createFileReadStream;
    this.getFileUrl = getFileUrl;
}

module.exports = Storage;

function createFileWriteStream(fileName) {
    var gFile = myBucket.file(fileName);
    var gFileMetadata = {
        contentType: 'audio/flac',
        metadata: {
            custom: 'metadata'
        }
    };
    return gFile.createWriteStream(gFileMetadata);
}

function createFileReadStream(fileName) {
    return myBucket.file(fileName).createReadStream();
}

function getFileUrl(fileName){
    return `gs://${myBucket.name}/${fileName}`;
}