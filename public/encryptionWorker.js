// encryptionWorker.js
const encrypt = (message, publicKey) => {
  const { N, e } = publicKey;
  const encryptedMessage = message.split("").map((char) => char.charCodeAt(0));
  const encryptedResult = encryptedMessage.map(
    (charCode) => BigInt(charCode) ** BigInt(e) % BigInt(N)
  );
  return encryptedResult.join(" ");
};

onmessage = function (e) {
  const { message, publicKey } = e.data;
  const encryptedResult = encrypt(message, publicKey);
  postMessage(encryptedResult);
};
