import os from 'os';
import fs from 'fs';
import { encodeBase32 } from './functions/base32.js'
import * as datacap from './helpers/datacap.js';
import * as common from './helpers/common.js';

common.loadEnv();
const homeDirectory = os.homedir();

const notaryAddress1 = process.env.NOTARY_1_ADDRESS;
const notaryAddress2 = process.env.NOTARY_2_ADDRESS;
const dummyPrivKey = process.env.DUMMY_PRIVATE_KEY;

async function startRemoval(client, datacapToRemove) {

    common.injectPathVariables();

    // Encode the wallet to be added to keystore
    const encoded = encodeBase32("wallet-" + client)
    console.log("Client wallet encoded: ", encoded);

    // Write an empty file with the encoded name to the specified path
    const content = `{"Type":"secp256k1","PrivateKey":"${dummyPrivKey}"}`;
    const keystorePath = homeDirectory + "/.lotus-local-net/keystore/" + encoded;
    fs.writeFileSync(keystorePath, content, 'utf-8');
    
    // Set the permissions to 0600
    fs.chmodSync(keystorePath, 0o600);
    
    //Add datacap to match the removal 
    // (the client must have at least as much as the datacap to remove in order to sign the removal)
    const checkDataCapBefore = await datacap.checkClientDataCap(client);
    if (checkDataCapBefore < datacapToRemove) {
    await datacap.addDatacap(notaryAddress1, client, datacapToRemove);
    const checkDataCap = await datacap.checkClientDataCap(client);
    console.log("Client datacap matched with removal: ", checkDataCap);
    } else 
    console.log("Client already has the datacap requested... Proceeding...")

    //Sign data removal proposal
    console.log("Signing on notary1")
    const removeDataCapProposal1 = await datacap.signRemoveDataCapProposal(notaryAddress1, client, datacapToRemove);
    console.log("Signing on notary2")
    const removeDataCapProposal2 = await datacap.signRemoveDataCapProposal(notaryAddress2, client,datacapToRemove)  
    return;
}

startRemoval("t1fuyotngdccs3xefpmzik2dhuk2x4wsrpcnzbyta", 1000)