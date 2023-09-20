import { runCommand } from "./common.js";
  
export async function createNotary() {
    const notaryAddress = await runCommand('lotus', ['wallet', 'new', 'secp256k1']);
    console.log(`Notary address created: ${notaryAddress}`);
    return notaryAddress;
}

export async function approveNotary(notaryAddress, rootAddress1, rootAddress2) {
    const proposalMessage = await runCommand('lotus-shed', ['verifreg', 'add-verifier', rootAddress1, notaryAddress, '10000000']);
    console.log(`Proposal message: ${proposalMessage}`);
    
    const msigOutput = await runCommand('lotus', ['msig', 'inspect', 'f080']);

    const regex = /(\d+)\s+pending\s+\d+\s+\w+\s+\d+ FIL\s+\w+\(\d+\)\s+(\w+)/;
    const matches = msigOutput.match(regex);

    if (matches) {
        const transactionId = matches[1];
        const params = matches[2];

        const approvalArgs = [
          'msig', 
          'approve', 
          '--from=' + rootAddress2, 
          'f080', 
          transactionId, 
          't0100', 
          't06', 
          '0', 
          '2', //Method id, maybe extract from the msig params
          params
        ];
        const approvalMessage = await runCommand('lotus', approvalArgs);
        console.log(`Approval message: ${approvalMessage}`);
    }
}