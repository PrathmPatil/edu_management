const CryptoJS = require("crypto-js");

exports.decryptPayload = (encryptedPayload) => {
  const bytes = CryptoJS.AES.decrypt(encryptedPayload, process.env.SECRET_KEY);

  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

exports.decryptMiddleware = (req, res, next) => {
  try {
    const encrypted = req.body?.payload || req.query?.payload;
    if (!encrypted) return next();

    req.decrypted = exports.decryptPayload(encrypted);

    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid encrypted payload" });
  }
};
