#!/bin/bash

# Prompt the user for the private key
read -p "Enter the private key: " private_key

# Use lotus wallet import to generate the address
import_output=$(lotus wallet import <<< "$private_key")

# Extract the address from the import_output
address=$(echo "$import_output" | grep -oE 't[0-9a-zA-Z]+' | tail -n 1)

# Check if the import_output contains "successfully" to determine success
if [[ $import_output == *"successfully"* ]]; then
    # Print the generated address
    echo "Generated Address: $address"
else
    # Print the import_output as is (likely an error message)
    echo "$import_output"
fi

# Wait for user input before exiting
read -p "Press Enter to exit"
