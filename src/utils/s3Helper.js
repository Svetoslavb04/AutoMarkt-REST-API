const { S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
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

module.exports = {
    generateUploadUrl,
}