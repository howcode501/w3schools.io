const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");
const { createPresignedPost } = require('@aws-sdk/s3-presigned-post');

module.exports = async (models, config, logger) => {
  // List current Branch/Tag/Version
  async function amazon_getS3Client() {
    return new S3Client({
      credentials: {
        accessKeyId: config.amazon.access_key_id,
        secretAccessKey: config.amazon.secret_access_key,
      },
      region: config.amazon.s3_region,
    });
  }

  // presigned post
  async function amazon_createPresignedPost(contentType,attachmentPath) {

    //get client
    const client = await amazon_getS3Client();

    const imagePath =  `${config.amazon.s3_bucket_mode}${attachmentPath}`;

    // Params needed to generated Presigned URL
    const params = {
      Expires: config.amazon.s3_expireTime,
      Key: `${imagePath}`,
      Bucket: config.amazon.s3_bucket,
      Conditions: [['content-length-range', config.amazon.s3_contentLengthMin, config.amazon.s3_contentLengthMax]], // 100Byte - 2MB
      Fields: {
        'Content-Type': contentType,
      },
    };

    const { fields } = await createPresignedPost(client, params);

    return fields;

  }

  async function amazon_uploadImage(blob, attachmentPath) {
    const client = await amazon_getS3Client();

    const imagePath = `${config.amazon.s3_bucket_mode}${attachmentPath}`;
    return client
      .send(
        new PutObjectCommand({
          Bucket: config.amazon.s3_bucket,
          Key: imagePath,
          Body: blob,
        })
      )
      .then(
        (data) => {
          // process data.
          if (data) {
            return data;
          }
        },
        (error) => {
          // error handling.
          logger.info({ error }, "Aws S3 error image upload");
          return error;
        }
      );
  }

  async function amazon_deleteImage(attachmentPath) {
    const client = await amazon_getS3Client();

    return client
      .send(
        new DeleteObjectCommand({
          Bucket: config.amazon.s3_bucket,
          Key: attachmentPath,
        })
      );
      
  }

  return {
    amazon_getS3Client,
    amazon_createPresignedPost,
    amazon_uploadImage,
    amazon_deleteImage,
  };
};
