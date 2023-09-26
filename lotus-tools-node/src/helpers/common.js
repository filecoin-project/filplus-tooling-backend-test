import { exec } from 'child_process';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

export async function injectPathVariables() {
        process.env.LOTUS_PATH = "~/.lotus-local-net";  
        process.env.LOTUS_MINER_PATH = "~/.lotus-miner-local-net";
        process.env.LOTUS_SKIP_GENESIS_CHECK = "_yes_";
        process.env.CGO_CFLAGS_ALLOW = "-D__BLST_PORTABLE__";
        process.env.CGO_CFLAGS = "-D__BLST_PORTABLE__";
}

export function runCommand(command, args = []) {
        return new Promise((resolve, reject) => {
            exec(`${command} ${args.join(' ')}`, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(stdout.trim());
            });
        });
}


export function loadEnv() {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const envFilePath = path.join(dirname, '../../.env');
    const envFileContent = fs.readFileSync(envFilePath, 'utf8');
    const lines = envFileContent.split('\n');
    
    for (const line of lines) {
        const [key, value] = line.split('=').map(str => str.trim());
        if (!process.env[key]) {
            process.env[key] = value;
        }
    }
}

export async function inspectMsig(msigAddress) {
    const msigOutput = await runCommand('lotus', ['msig', 'inspect', msigAddress]);
    const lines = msigOutput.split("\n");
    
    const pendingTransactions = [];
    
    let isTransactionSection = false;
    for (const line of lines) {
        if (line.startsWith("Transactions:")) {
            isTransactionSection = true;
            continue;  // Skip the "Transactions:" line
        }

        if (isTransactionSection && line.trim() !== "") {
            // Example line format: 
            // 9       pending  1          t06     0 FIL   RemoveVerifiedClientDataCap(7)  8443008008420064824300ec075842...
            const regex = /(\d+)\s+pending\s+\d+\s+\w+\s+\d+ FIL\s+([\w()]+)\s+(\w+)/;
            const matches = line.match(regex);
            
            if (matches) {
                const transactionId = matches[1];
                const methodName = matches[2];
                const params = matches[3];
                
                pendingTransactions.push({
                    transactionId,
                    methodName,
                    params
                });
            }
        }
    }
    
    return pendingTransactions;
}