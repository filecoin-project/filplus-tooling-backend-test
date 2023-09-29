import { runCommand } from "./common.js";

export async function inspectMultisig(multisigAddress) {
        const output = await runCommand('lotus', ['msig', 'inspect', multisigAddress]);
        console.log(output);
        return output;
}

export async function sendFunds(fromAddress, toAddress, amount) {
        const result = await runCommand('lotus', [
            'send',
            '-from=' + fromAddress,
            toAddress,
            amount
        ]);
        console.log(`Sent ${amount} from ${fromAddress} to ${toAddress}: ${result}`);
        return result;
    }