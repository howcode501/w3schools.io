// eslint-disable-next-line no-unused-vars
import Ctx from '../src/ctx.js';

(async () => {
  const { logger, encrypt, decrypt } = await Ctx();

  logger.info("Hello !");

  const key = "fooxfoox";
  const a = encrypt(key, "Hello World!");
  logger.info(`Encrypted: ${a}`);

  const b = decrypt(key, a);
  logger.info(`Decrypted: ${b}`);
})();
