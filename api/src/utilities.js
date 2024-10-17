const { customAlphabet } = require("nanoid");
const { nolookalikesSafe } = require("nanoid-dictionary");
const crypto = require("crypto");
const Forge = require("node-forge");
const dayjs = require("dayjs");

// eslint-disable-next-line no-unused-vars
module.exports = (config, logger) => {
  class Security {
    static compute_key(secret) {
      if (secret !== null) {
        const normalized_key = crypto
          .createHash("sha1")
          .update(secret)
          .digest()
          .slice(0, 16);

        // Effective key
        return Buffer.from(normalized_key);
      }
      return null;
    }

    constructor(secrets, algorithm = "aes-128-ecb", iv_length = 0) {
      this.algorithm = algorithm;
      this.iv = "";
      this.padding = true;
      if (iv_length > 0) {
        this.iv = crypto.randomBytes(iv_length);
      }

      // Normalize key size for algorithm
      this.keys = [];
      if (secrets !== null) {
        if (typeof secrets === "string") {
          this.keys.push(Security.compute_key(secrets));
        } else {
          secrets.forEach((secret) => {
            this.keys.push(Security.compute_key(secret));
          });
        }
      }
    }

    get_key() {
      const keys = [];
      this.keys.forEach((k) => {
        keys.append(Buffer.from(k).toString("base64"));
      });
      return keys;
    }

    // input cleartext utf8, output encrypted base64
    encrypt(input) {
      const key = this.keys[0] || null;
      if (key) {
        const cipher = crypto.createCipheriv(this.algorithm, key, this.iv);
        if (this.padding === false) {
          cipher.setAutoPadding(false);
        }

        let result = cipher.update(input, "utf8", "base64");
        result += cipher.final("base64");
        return result;
      }
      logger.warn("No valid encryption key found, encoding as base64");
      return Buffer.from(input).toString("base64");
    }

    // input encrypted base64, output cleartext utf8
    decrypt(input) {
      let result = null;
      if (this.keys.length > 0) {
        for (const key of this.keys) {
          result = null;
          if (key !== null) {
            try {
              const decipher = crypto.createDecipheriv(
                this.algorithm,
                key,
                this.iv
              );
              if (this.padding === false) {
                decipher.setAutoPadding(false);
              }
              result = decipher.update(input, "base64", "utf8");
              result += decipher.final("utf8");
              break;
            } catch (e) {
              // logger.exception("Encryption failed");
              logger.warn("Attempting next decryption key in sequence");
            }
          } else {
            logger.warn("Null decryption key, decoding base64");
            break;
          }
        }
        if (result === null) {
          logger.warn("No valid decryption keys found, decoding base64");
        }
      } else {
        logger.warn("No valid decryption keys found, decoding base64");
      }
      if (result === null) {
        result = Buffer.from(input, "base64").toString("utf8");
      }
      return result;
    }

    recrypt(input) {
      const cleartext = this.decrypt(input);
      return this.encrypt(cleartext);
    }
  }

  function parsePemInfos(pem) {
    try {
      const cert = Forge.pki.certificateFromPem(pem);
      const certBytes = Forge.pki.pemToDer(pem).getBytes();

      const sha256 = Forge.md.sha256.create();
      const sha1 = Forge.md.sha1.create();
      sha256.update(certBytes, "raw");
      sha1.update(certBytes, "raw");

      const fpSha256 = sha256
        .digest()
        .toHex()
        .toUpperCase()
        .replace(/.{2}/g, "$& ");
      const fpSha1 = sha1
        .digest()
        .toHex()
        .toUpperCase()
        .replace(/.{2}/g, "$& ");

      return {
        issuer: cert.issuer,
        subject: cert.subject,
        validity: cert.validity,
        fingerprint: {
          sha256: fpSha256,
          sha1: fpSha1,
        },
      };
    } catch (e) {
      throw new Error("Certification invalid");
    }
  }

  function nanocode(length = 16) {
    return customAlphabet(nolookalikesSafe, length)();
  }

  function ad_username_generator(length = 10) {
    const allowedChars = "0123456789abcdefghijklmnopqrstuvwxyz";
    return customAlphabet(allowedChars, length)();
  }

  function removeAdIllegalChars(str) {
    const re = new RegExp(/[&'"^*\\/:<\\>?|]/, "gi");
    return str.trim().replace(re, () => "");
  }

  const encrypt = (key, data) => {
    const s = new Security(key);
    return s.encrypt(data);
  };

  const decrypt = (key, data) => {
    const s = new Security(key);
    return s.decrypt(data);
  };

  // get date minus days from now
  function getDateMinusNow(daysLess) {
    const currentDate = new Date(new Date().toJSON().slice(0, 10));
    const dateDiffNow = new Date(
      currentDate.setDate(currentDate.getDate() - daysLess)
    );
    return new Date(dateDiffNow);
  }

  const secrets = [];
  if (config.encryption_secret) secrets.push(config.encryption_secret);
  if (config.previous_encryption_secret) {
    secrets.push(config.previous_encryption_secret);
  }

  const dbSecurity = new Security(secrets);

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  const retryOperation = (operation, delay, retries) =>
    new Promise((resolve, reject) =>
      operation()
        .then(resolve)
        .catch((reason) => {
          if (retries > 0) {
            return wait(delay)
              .then(retryOperation.bind(null, operation, delay, retries - 1))
              .then(resolve)
              .catch(reject);
          }
          return reject(reason);
        })
    );

  function replaceSpacesWithUnderscore(str) {
    return str.replace(/ /g, "_");
  }

  function getDiffenceBetweenTwotimeStampInDays(date_1, date_2) {
    const date1 = new Date(date_1);
    const date2 = new Date(date_2);
    const diffTime = Math.abs(date2 - date1);
    return Math.round(Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  function randomString() {
    //define a variable consisting alphabets in small and capital letter
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    //specify the length for the new string
    var lenString = 7;
    var randomstring = "";

    //loop to select a new character in each iteration
    for (var i = 0; i < lenString; i++) {
      var rnum = Math.floor(Math.random() * characters.length);
      randomstring += characters.substring(rnum, rnum + 1);
    }

    return randomstring;
  }

  function generateRandomToken() {
    const resetToken = crypto.randomBytes(15).toString("hex");
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    return resetToken;
  }

  // StringtoArray
  function stringToArray(str) {
    return str.split(",");
  }

  function calculateSubscriptionExpiraryDate(interval, frequency) {
    let expire_date = "1997-07-16T19:20:30.451Z";
    let days = 1; // For DAY
    // convert to days
    if (frequency === "WEEK") {
      days = 7;
    }
    if (frequency === "MONTH") {
      days = 30;
    }
    if (frequency === "YEAR") {
      days = 365;
    }

    const totalDays = interval * days;
    expire_date = dayjs().add(totalDays, "day").format("YYYY-MM-DDTHH:mm:ssZ");
    return expire_date;
  }

  return {
    nanocode,
    encrypt,
    decrypt,
    dbSecurity,
    Security,
    ad_username_generator,
    removeAdIllegalChars,
    parsePemInfos,
    getDateMinusNow,
    retryOperation,
    replaceSpacesWithUnderscore,
    getDiffenceBetweenTwotimeStampInDays,
    randomString,
    generateRandomToken,
    stringToArray,
    calculateSubscriptionExpiraryDate,
  };
};
