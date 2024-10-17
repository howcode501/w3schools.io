const express = require("express");
const asyncHandler = require("express-async-handler");

module.exports = async (app, helpers) => {
  const router = express.Router();
  const config = app.get("configuration");
  const logger = app.get("logger");
  const { attachment_insert, amazon_createPresignedPost, amazon_deleteImage } =
    app.get("datastore");
  const { anyUser } = helpers;

  // Attachment upload route
  router.post(
    "/attachment",
    anyUser,
    asyncHandler(async (req, res) => {
      req.logger.info("POST /api/upload/attachment");

      const endpoint = config.amazon.s3_bucket_base_url;

      const { contentType, ext, path, pageType, fileName } = req.body;

      if (!contentType || !ext || !path) {
        /**
         * Returns error response if parameters not exist :
         * 1) content type (image/jpeg)
         * 2) extension (jpg)
         * 3) path (avatar)
         */
        res
          .status(400)
          .json("Missing required parameters : contentType or ext or path !!!");
      }

      // Unique file name generated
      const uniqueFileName = `/${pageType}/${new Date()
        .toISOString()
        .replace(/:/g, "-")}.${ext}`;

      const fields = await amazon_createPresignedPost(
        contentType,
        uniqueFileName
      );

      const attachment = await attachment_insert({
        file_name_org: fileName,
        file_name: uniqueFileName,
        public_url: `${endpoint}/${fields.key}`,
        attachment_type: pageType,
      });
      res.status(200).json({ url: endpoint, attachment, fields });
    })
  );

  // Attachment delete route
  router.delete(
    "/attachment",
    anyUser,
    asyncHandler(async (req, res) => {
      req.logger.info("DELETE /api/upload/attachment");

      try {
        const { fileName } = req.body;

        if (!fileName) {
          /**
           * Returns error response if parameters not exist :
           * 1) fileName
           */
          return res
            .status(400)
            .json("Missing required parameter : fileName !!!");
        }

        // Delete the object.
        const data = await amazon_deleteImage(fileName);

        req.logger.debug({ data }, "Data for Object Deletion");

        if (data.DeleteMarker && data.DeleteMarker === true) {
          // return data;
          res.status(200).json({ message: "Object is deleted!!!", code: 200 });
        } else {
          // return data;
          res
            .status(data.$metadata.httpStatusCode)
            .json({ message: "Object is not deleted!!!", code: 400 });
        }
      } catch (err) {
        logger.warn(
          "Error deleting object in DELETE /api/upload/attachment",
          err
        );
        res
          .status(500)
          .json({ message: "Internal Server Error!!!", code: 500 });
      }
    })
  );

  return router;
};
