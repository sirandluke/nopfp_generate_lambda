const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');

function uploadS3(path, filename) {
  let s3 = new S3({
    region: process.env.S3_REIGON,
    accessKeyId: process.env.S3_ACCESS,
    secretAccessKey: process.env.S3_SECRET
  });

  let fileStream = fs.createReadStream(path);

  let uploadParams = {
    Bucket: process.env.S3_BUCKET,
    Body: fileStream,
    Key: filename
  };

  return s3.upload(uploadParams).promise();
}

module.exports = { uploadS3 };