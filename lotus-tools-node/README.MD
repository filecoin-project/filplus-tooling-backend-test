https://lotus.filecoin.io/lotus/developers/local-network/

1. On the given link, follow the commands to run lotus cli on local, and also the miner. You should have 2 windows of terminals for these 2.
You can skip the Connect multiple nodes, since we don't need for development, unless otherwise stated.

export PATH=/usr/local/go/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
2. These are the PATH variables to enable Go compiling in the lotus cli, if you dont have these in the bashrc set, add them.
- Adding to bashrc:
nano ~/.bashrc => in the end of the file there is the export PATH='' add here, separated by ,

3. Be sure to include 
export LOTUS_PATH=~/.lotus-local-net 
export LOTUS_MINER_PATH=~/.lotus-miner-local-net
export LOTUS_SKIP_GENESIS_CHECK=_yes_ 
export CGO_CFLAGS_ALLOW="-D__BLST_PORTABLE__" 
export CGO_CFLAGS="-D__BLST_PORTABLE__" 

in every terminal you open. Also, if you are writing code and debugging in visual studio be sure to import them on the start of the function,
like shown in startFlow() function in index.js