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
        const datacapAmount = await runCommand('lotus', [
            'filplus',
            'check-client-datacap',
            clientAddress
        ]);
        console.log(`Client ${clientAddress} has datacap: ${datacapAmount}`);
        return datacapAmount;
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