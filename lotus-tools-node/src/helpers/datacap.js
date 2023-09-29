import { runCommand } from "./common.js";

export async function addDatacap(notaryAddress, clientAddress, datacapAmount) {
        const commandOutput = await runCommand('lotus', [
            'filplus',
            'grant-datacap',
            '--from=' + notaryAddress,
            clientAddress,
            datacapAmount
        ]);
        console.log(`Datacap grant message: ${commandOutput}`);
}
  
export async function checkClientDataCap(clientAddress) {
    try{
        const datacapAmount = await runCommand('lotus', [
            'filplus',
            'check-client-datacap',
            clientAddress
        ]);
        console.log(`Client ${clientAddress} has datacap: ${datacapAmount}`);
        return datacapAmount;
    } catch (err){
        return 0;
    }
}

export async function signRemoveDataCapProposal(from, client, datacap) {
      const result = await runCommand('lotus', [
          'filplus',
          'sign-remove-data-cap-proposal',
          from,
          client,
          datacap.toString()
      ]);
      console.log(`Signed removal proposal result: ${result}`);
      return result;
}

export async function removeVerifiedClientDataCap(rootKeyHolder1, client, datacap, notaryAddress1, removeDataCapProposal1, notaryAddress2, removeDataCapProposal2) {
        const commandOutput = await runCommand('lotus-shed', [
            'verifreg',
            'remove-verified-client-data-cap',
            rootKeyHolder1,
            client,
            datacap.toString(),
            notaryAddress1,
            removeDataCapProposal1,
            notaryAddress2,
            removeDataCapProposal2
        ]);
        console.log(`Remove datacap: ${commandOutput}`);
        return commandOutput;
}

export async function approveDataCapRemoval(multisigAddress, rootAddress2) {
    const pendingTransactions = await inspectMsig(multisigAddress);

    const dataCapRemovalTransactions = pendingTransactions.filter(transaction => transaction.methodName === 'RemoveVerifiedClientDataCap(7)');

    if (dataCapRemovalTransactions.length === 0) {
        console.log("No pending datacap removal transactions found.");
        return;
    }

    const lastDataCapRemovalTransaction = dataCapRemovalTransactions[dataCapRemovalTransactions.length - 1];

    const transactionId = lastDataCapRemovalTransaction.transactionId;
    const params = lastDataCapRemovalTransaction.params;

    const approvalArgs = [
        'msig',
        'approve',
        '--from=' + rootAddress2,
        multisigAddress,
        transactionId,
        't0100',
        't06',
        '0',
        '7',  // Method id for RemoveVerifiedClientDataCap
        params
    ];

    const approvalMessage = await runCommand('lotus', approvalArgs);
    console.log(`Approval message: ${approvalMessage}`);
}
