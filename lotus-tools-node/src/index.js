import * as notaries from './helpers/notaries.js';
import * as common from './helpers/common.js';
import * as datacap from './helpers/datacap.js';
import * as clients from './helpers/clients.js';
import * as wallets from './helpers/wallets.js';

// Load environment variables
common.loadEnv();

const rootKey1 = process.env.ROOT_1_KEY;
const rootKey2 = process.env.ROOT_2_KEY;
const rootAddress1 = process.env.ROOT_1_ADDRESS;
const rootAddress2 = process.env.ROOT_2_ADDRESS;
const msigWalletAddress1 = process.env.MSIG_WALLET_1;
const notaryAddress1 = process.env.NOTARY_1_ADDRESS;
const notaryAddress2 = process.env.NOTARY_2_ADDRESS;



async function startFlow(clientToRemove, datacapToRemove) {
    try {
        
        common.injectPathVariables();

       
        // Create and approve first notary
        const generatedNotaryAddress1 = await notaries.createNotary();
        await notaries.approveNotary(generatedNotaryAddress1, rootAddress1, rootAddress2);

        // Create and approve second notary
        const generatedNotaryAddress2 = await notaries.createNotary();
        await notaries.approveNotary(generatedNotaryAddress2, rootAddress1, rootAddress2);

        // Check if notaries are added
        const notariesCheck = await common.runCommand('lotus', ['filplus', 'list-notaries']);
        console.log("Notaries: ", notariesCheck);
        
        // Send funds to notary
        const funds = await wallets.sendFunds(rootAddress1, notaryAddress1, 1000)   
        
        //Create client
        const client = await clients.createClient();
        const dataCap = await datacap.addDatacap(notaryAddress1, client, 1000);
        const checkDataCap = await datacap.checkClientDataCap(client);
        
        //Sign data removal proposal
        console.log("Signing on notary1")
        const removeDataCapProposal1 = await datacap.signRemoveDataCapProposal(notaryAddress1, client, 100);
        console.log("Signing on notary2")
        const removeDataCapProposal2 = await datacap.signRemoveDataCapProposal(notaryAddress2, client,100)  
        const removeDataCap = await datacap.removeVerifiedClientDataCap(rootAddress1, client, 100, notaryAddress1, removeDataCapProposal1, notaryAddress2, removeDataCapProposal2);
         // const inspectMultiSig = await inspectMultisig(msigWalletAddress1);
    } catch (error) {
        console.error(`Error adding notaries: ${error}`);
    }
}

startFlow();
