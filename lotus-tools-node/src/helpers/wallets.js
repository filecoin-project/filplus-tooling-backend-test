import { runCommand } from "./common.js";

export async function inspectMultisig(multisigAddress) {
        const output = await runCommand('lotus', ['msig', 'inspect', multisigAddress]);
        console.log(output);
        return output;
}