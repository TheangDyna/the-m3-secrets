// Function to check if a number is prime
const isPrime = (num) => {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;

  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
};

// Function to find a random prime number within a given range
const getRandomPrime = (min, max) => {
  let num = Math.floor(Math.random() * (max - min + 1)) + min;
  while (!isPrime(num)) {
    num = Math.floor(Math.random() * (max - min + 1)) + min;
  }
  return num;
};

// Function to compute the greatest common divisor (GCD) of two numbers
const gcd = (a, b) => {
  return b === 0 ? a : gcd(b, a % b);
};

// Function to compute the modular multiplicative inverse of a number
const modInverse = (a, m) => {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  return 1;
};

// Function to generate public and private keys for RSA
const generateKeys = () => {
  const minPrime = 100;
  const maxPrime = 1000;

  // Select two distinct prime numbers
  const p = getRandomPrime(minPrime, maxPrime);
  let q = getRandomPrime(minPrime, maxPrime);
  while (q === p) {
    q = getRandomPrime(minPrime, maxPrime);
  }

  const N = p * q;
  const phi = (p - 1) * (q - 1);

  let e = 65537;

  while (gcd(e, phi) !== 1) {
    e++;
  }

  const d = modInverse(e, phi);

  return {
    publicKey: { N, e },
    privateKey: { N, d },
  };
};

// Function to encrypt a message using RSA public key
const encrypt = (message, publicKey) => {
  const { N, e } = publicKey;
  const encryptedMessage = message.split("").map((char) => char.charCodeAt(0));
  const encryptedResult = encryptedMessage.map(
    (charCode) => BigInt(charCode) ** BigInt(e) % BigInt(N)
  );
  return encryptedResult.join(" ");
};

// Function to decrypt a message using RSA private key
const decrypt = (encryptedMessage, privateKey) => {
  const { N, d } = privateKey;
  const decryptedMessage = encryptedMessage
    .split(" ")
    .map((encryptedChar) => BigInt(encryptedChar) ** BigInt(d) % BigInt(N));
  return decryptedMessage
    .map((charCode) => String.fromCharCode(Number(charCode)))
    .join("");
};

export { generateKeys, encrypt, decrypt };
