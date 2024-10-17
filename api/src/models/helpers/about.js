const fs = require('fs');
const yaml = require('js-yaml');

module.exports = async (models, config, logger) => {
  // List current Branch/Tag/Version
  async function about_getBuildInfo() {
    try {
      const fileContents = fs.readFileSync('./build_info.yaml', 'utf8');
      const data = yaml.load(fileContents);
      return data;
    } catch (e) {
      logger.debug({ e }, 'about_getBuildInfo');
      return false;
    }
  }
  return {
    about_getBuildInfo,
  };
};
