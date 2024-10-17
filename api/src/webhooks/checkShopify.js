const crypto = require("crypto");
const SHOPIFY_SIGNATURE_SECRET =
  "4bdc86a30941c006a8ec4d14856c26b758746644e0e52f383e5007e17eda96d7";
if (!SHOPIFY_SIGNATURE_SECRET) {
  throw new Error("Please provide SHOPIFY_SIGNATURE_SECRET");
}
exports.validateShopifySignature = async (req, res, next) => {
  try {
    const rawBody = req.rawBody;
    console.log("rawBody is ...", rawBody);
    if (typeof rawBody == "undefined") {
      throw new Error(
        "validateShopifySignature: req.rawBody is undefined. Please make sure the raw request body is available as req.rawBody."
      );
    }
    const hmac = req.headers["x-shopify-hmac-sha256"];
    console.log("hmac is ...", hmac);
    const hash = crypto
      .createHmac("sha256", SHOPIFY_SIGNATURE_SECRET)
      .update(rawBody)
      .digest("base64");

    console.log("expected hash is ...", hash);
    const signatureOk = crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(hmac)
    );
    if (!signatureOk) {
      res.status(403);
      res.send("Unauthorized");
      return;
    }
    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};
