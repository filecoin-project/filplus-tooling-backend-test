import { runCommand } from "./common.js";

export async function createClient() {
    const clientAddress = await runCommand('lotus', ['wallet', 'new', 'secp256k1']);
    console.log(`Client address created: ${clientAddress}`);

    return clientAddress;  
}