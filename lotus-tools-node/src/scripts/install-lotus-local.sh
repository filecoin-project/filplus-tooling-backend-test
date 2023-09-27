#!/bin/bash

# Exit on any error
set -e

# Install dependencies
sudo apt update
sudo apt install -y hwloc

#Remove local lotus repository
echo "Removing previous iterations"
rm -rf lotus-local-net
rm -rf lotus_v1.22.1_linux_amd64
rm -f lotus_v1.22.1_linux_amd64.tar.gz

# Remove any existing lotus binary
sudo rm -rf /usr/local/bin/lotus

# Download the latest Lotus Linux bundle
echo "Download and install lotus linux bundle..."
wget https://github.com/filecoin-project/lotus/releases/download/v1.22.1/lotus_v1.22.1_linux_amd64.tar.gz

# Extract the tarball
tar -xvf lotus_v1.22.1_linux_amd64.tar.gz

# Move the lotus binary to /usr/local/bin
sudo mv lotus_v1.22.1_linux_amd64/lotus /usr/local/bin/lotus

# Set environment variables
export LOTUS_PATH=~/.lotus-local-net
export LOTUS_MINER_PATH=~/.lotus-miner-local-net
export LOTUS_SKIP_GENESIS_CHECK=_yes_
export CGO_CFLAGS_ALLOW="-D__BLST_PORTABLE__"
export CGO_CFLAGS="-D__BLST_PORTABLE__"

# Clone the lotus-local-net folder
echo "Download and install local net..."
git clone https://github.com/filecoin-project/lotus lotus-local-net

# Navigate to the cloned directory
cd lotus-local-net

# Checkout to the latest stable branch
git checkout releases

# Remove any existing repositories
rm -rf ~/.genesis-sectors

# Build the 2k binary for Lotus
echo "Building source code..."
make 2k

# Fetch the proving parameters
./lotus fetch-params 2048

# Build lotus-shed
make lotus-shed

# (Local network with Fil+) Create a BLS-address to serve as the first root key holder
echo "Creating first root key holder..."
root_key_1=$(./lotus-shed keyinfo new bls | tail -n 1)
echo "First root key holder address: $root_key_1"

# (Local network with Fil+) Create a BLS-address to serve as the second root key holder
echo "Creating second root key holder..."
root_key_2=$(./lotus-shed keyinfo new bls | tail -n 1)
echo "Second root key holder address: $root_key_2"

# Preseal 2 sectors for the genesis block
./lotus-seed pre-seal --sector-size 2KiB --num-sectors 2

# Create the genesis block
./lotus-seed genesis new localnet.json

# (Local network with Fil+) Set the root key holders in the genesis block
./lotus-seed genesis set-signers --threshold=2 --signers $root_key_1 --signers $root_key_2 localnet.json

# Create a pre-miner and an address with some funds
./lotus-seed genesis add-miner localnet.json ~/.genesis-sectors/pre-seal-t01000.json

# Print completion message
echo "Lotus local is now installed!"