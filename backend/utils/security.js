// const bytes = CryptoJS.AES.decrypt(encrypted, process.env.SECRET_KEY);
// const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
const decryptValue = (encrypted) => {
  const bytes = CryptoJS.AES.decrypt(encrypted, process.env.SECRET_KEY);
  const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return data;
};
