'use strict';

const conf = require('./config');
const storage = require('@google-cloud/storage')({
    projectId: conf.google_project_id,
    keyFilename: conf.google_key_file
});
const myBucket = storage.bucket(conf.storage_bucket);

const MongoClient = require('mongodb').MongoClient;

function Storage(){
    this.createFileWriteStream = createFileWriteStream;
    this.createFileReadStream = createFileReadStream;
    this.getFileUrl = getFileUrl;
    this.connectToDB = connectToDB;
    this.insertToDb = insertToDb;
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

function connectToDB(callback){
    MongoClient.connect(conf.mongodb_url, (err, db) => {
        if(err) {
            console.log("Some problem with MongoDb connection");
            callback(err);
        }

        console.log("Connected correctly to the server");
        callback(null, "Connected !");

        db.close();
    });
}

function insertToDb(data, callback){
    MongoClient.connect(conf.mongodb_url, (err, db) => {
        if(err) {
            console.log("Some problem with MongoDb connection");
            callback(err);
        }

        //console.log(`Insert data to the mongo collection: ${JSON.stringify(data)}`);
        var col = db.collection(conf.mongodb_collection);
        col.insertOne(JSON.parse(JSON.stringify(data)), (err, result) => {
            if(err){
                console.log(`Some problem during insertion into MongoDb: ${err}`);
                callback(err);
            } else {
                console.log(`Successfully inserted ${result.insertedCount} docs`);
                callback(err, result);
            }
        });

        db.close();
    });
}