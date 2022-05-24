const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const { randomBytes } = require('crypto');

const region = 'eu-central-1';
const bucketName = 'myeladenbucket';
const accessKeyId = process.env.AWS_AccessKeyID;
const secretAccessKey = process.env.AWS_SecretAccessKey;

const client = new S3Client({
    region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    }
});

const generateUploadUrl = async function () {

    const bytes = await randomBytes(16);
    const imageName = bytes.toString('hex');

    const params = {
        Bucket: bucketName,
        Key: imageName
    };

    const command = await new PutObjectCommand(params);

    return await getSignedUrl(client, command, { expiresIn: 60 });

}

const deleteObjectByKey = async function (key) {

    const params = {
        Bucket: bucketName,
        Key: key
    };

    const command = await new PutObjectCommand(params);

    const deleteMarker = await client.send(command);

    return deleteMarker;

}

const getObjectKeyByUrl = (urlString) => {

    const url = new URL(urlString);

    return url.pathname.slice(1);
}

module.exports = {
    generateUploadUrl,
    deleteObjectByKey,
    getObjectKeyByUrl
}