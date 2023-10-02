import os from "os";
import fs from "fs";
import { encodeBase32 } from "./functions/base32.js";
import * as datacap from "./helpers/datacap.js";
import * as common from "./helpers/common.js";

common.loadEnv();
const homeDirectory = os.homedir();

const notaryAddress1 = process.env.NOTARY_1_ADDRESS;
const notaryAddress2 = process.env.NOTARY_2_ADDRESS;
const dummyPrivKey = process.env.DUMMY_PRIVATE_KEY;

async function removeDatacap(clientAddress, datacapToRemove) {
    // process.env.LOTUS_PATH = "~/.lotus-local-net";
    // process.env.LOTUS_MINER_PATH = "~/.lotus-miner-local-net";
    // process.env.LOTUS_SKIP_GENESIS_CHECK = "_yes_";
    // process.env.CGO_CFLAGS_ALLOW = "-D__BLST_PORTABLE__";
    // process.env.CGO_CFLAGS = "-D__BLST_PORTABLE__";
    common.injectPathVariables();

    // Encode the wallet to be added to keystore
    //
    // We use base32 encoding as it is the same encoding used by lotus
    const encoded = encodeBase32("wallet-" + clientAddress);
    console.log("Client wallet encoded: ", encoded);

    // Write an empty file with the encoded name to the specified path
    //
    // This is required for lotus to be able to import the wallet
    //
    // TODO: Check if we need the dummyPrivKey
    const content = `{"Type":"secp256k1","PrivateKey":"${dummyPrivKey}"}`;
    const keystorePath =
        homeDirectory + "/.lotus-local-net/keystore/" + encoded;
    fs.writeFileSync(keystorePath, content, "utf-8");

    // Set the permissions to 0600
    //
    // Chmod 0600 (chmod a+rwx,u-x,g-rwx,o-rwx,ug-s,-t) sets permissions so that, (U)ser / owner can read,
    // can write and can't execute.
    // (G)roup can't read, can't write and can't execute. (O)thers can't read,
    // can't write and can't execute.
    fs.chmodSync(keystorePath, 0o600);

    // TODO: Explain here why we need two signatures    
    //
    //
    //
    //
    //
    //Sign data removal proposal
    console.log("Signing on notary1");
    const removeDataCapProposal1 =
        await datacap.signRemoveDataCapProposal(
            notaryAddress1,
            clientAddress,
            datacapToRemove
        );

    console.log("Signing on notary2");
    const removeDataCapProposal2 =
        await datacap.signRemoveDataCapProposal(
            notaryAddress2,
            clientAddress,
            datacapToRemove
        );
    return;
}

removeDatacap("t1fuyotngdccs3xefpmzik2dhuk2x4wsrpcnzbyta", 2000);
