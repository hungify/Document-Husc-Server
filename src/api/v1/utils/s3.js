const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const uuid = require('uuid').v4;
const envConfig = require('../../../configs/env.config');

module.exports = {
  uploadFiles: async (files) => {
    const client = new S3Client({
      region: envConfig.s3.region,
      credentials: {
        accessKeyId: envConfig.s3.accessKeyId,
        secretAccessKey: envConfig.s3.secretAccessKey,
      },
    });
    const params = files?.map((file) => {
      return {
        Bucket: envConfig.s3.bucket,
        Key: `${uuid()}-${file.originalname}`,
        Body: file.buffer,
        OriginalName: file.originalname,
        ACL: 'public-read',
        ContentType: file.mimetype,
      };
    });

    const result = await Promise.all(
      params.map((param) => client.send(new PutObjectCommand(param)))
    );

    return params.map((p) => {
      return {
        location: `https://${p.Bucket}.s3.${envConfig.s3.region}.amazonaws.com/${p.Key}`,
        originalName: p.OriginalName,
      };
    });
  },
};
