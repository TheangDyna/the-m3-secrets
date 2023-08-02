// decryptionWorker.js
const decrypt = (encryptedMessage, privateKey) => {
  const { N, d } = privateKey;
  const decryptedMessage = encryptedMessage
    .split(" ")
    .map((encryptedChar) => BigInt(encryptedChar) ** BigInt(d) % BigInt(N));
  return decryptedMessage
    .map((charCode) => String.fromCharCode(Number(charCode)))
    .join("");
};

onmessage = function (e) {
  const { encryptedMessage, privateKey } = e.data;
  const decryptedMessage = decrypt(encryptedMessage, privateKey);
  postMessage(decryptedMessage);
};
