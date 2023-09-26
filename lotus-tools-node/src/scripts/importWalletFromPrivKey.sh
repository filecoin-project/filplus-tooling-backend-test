#!/bin/bash

# Prompt the user for a password
read -s -p "Enter a password for decryption: " password
echo  # Print a newline after password input

# Decrypt the private keys from the encrypted configuration file
decrypted_keys=$(gpg --batch --passphrase "$password" -d config.enc 2>&1)

# Check if decryption was successful
if [[ $? -eq 0 ]]; then
    # Extract the private keys based on labels
    private_key1=$(echo "$decrypted_keys" | grep -oP 'key1=\K[^,]+' | tr -d '[:space:]' | tr -d '"' )
    private_key2=$(echo "$decrypted_keys" | grep -oP 'key2=\K[^,]+' | tr -d '[:space:]' | tr -d '"' )
    echo "$private_key1"
    echo "$private_key2"

    # Use lotus wallet import to generate addresses for the private keys
    import_output1=$(lotus wallet import <<< "$private_key1")
    import_output2=$(lotus wallet import <<< "$private_key2")

    # Extract the addresses from the import outputs
    address1=$(echo "$import_output1" | grep -oE 't[0-9a-zA-Z]+' | tail -n 1)
    address2=$(echo "$import_output2" | grep -oE 't[0-9a-zA-Z]+' | tail -n 1)

    # Check if the import outputs contain "successfully" to determine success
    if [[ $import_output1 == *"successfully"* ]] && [[ $import_output2 == *"successfully"* ]]; then
        # Print the generated addresses
        echo "Generated Address 1: $address1"
        echo "Generated Address 2: $address2"
    else
        # Print the import outputs as is (likely error messages)
        echo "$import_output1"
        echo "$import_output2"
    fi
else
    # Print an error message if decryption failed
    echo "Error: $decrypted_keys"
fi

# Wait for user input before exiting
read -p "Press Enter to exit"
