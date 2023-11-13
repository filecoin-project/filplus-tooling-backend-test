import { keyDerive } from '@zondax/filecoin-signing-tools/js';

//const mnemonic: string = "exit mystery juice city argue breeze film learn orange dynamic marine diary antenna road couple surge marine assume loop thought leader liquid rotate believe";

const mnemonic = "cupboard garden oppose gorilla honey special leader volcano mom gown host vintage lawn choice claw want rule shove control replace must envelope hat special"
const path = "m/44'/461'/0'/0/0";

const { private_base64, address } = keyDerive(mnemonic, path, "");
console.log(private_base64);
const keyInfo = {
    Type: "secp256k1",
    PrivateKey: private_base64
};

const keyInfoJsonString = JSON.stringify(keyInfo);
const keyInfoHex = Buffer.from(keyInfoJsonString).toString('hex');

console.log("Derived address:", address);
console.log("KeyInfo for hex-lotus:", keyInfoHex);