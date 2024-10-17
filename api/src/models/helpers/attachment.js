module.exports = async (models, config, logger) => {
  const { Attachment } = models;

  async function attachment_insert(params) {
    logger.debug({ params }, "Creating attachment");
    const attachment = await Attachment.create({
      data: {
        file_name_org: params.file_name_org,
        file_name: params.file_name,
        public_url: params.public_url,
        attachment_type: params.attachment_type,
      },
    });

    logger.debug({ attachment }, "Attachment Inserted");
    return attachment;
  }

  async function attachment_delete(id) {
    logger.debug({ id }, "deleting attachment");
    const attachment = await Attachment.delete({ where: { id } });

    logger.debug({ attachment }, "Attachment deleted");
    return attachment;
  }

  return {
    attachment_insert,
    attachment_delete,
  };
};
