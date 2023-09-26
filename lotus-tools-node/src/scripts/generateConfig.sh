#!/bin/bash

# Prompt the user for the first private key
read -p "Enter the first private key: " private_key1

# Prompt the user for the second private key
read -p "Enter the second private key: " private_key2

# Prompt the user for a password
read -s -p "Enter a password for encryption: " password
echo  # Print a newline after password input

# Create a temporary file to store the private keys
temp_file=$(mktemp)

# Write the private keys to the temporary file with key labels
echo "key1=$private_key1" > "$temp_file"
echo "key2=$private_key2" >> "$temp_file"

# Encrypt the temporary file using GPG with a symmetric cipher
gpg --batch --passphrase "$password" -c "$temp_file"

# Rename the encrypted file to a configuration file
mv "$temp_file.gpg" config.enc

# Securely remove the temporary file
shred -u "$temp_file"

echo "Private keys encrypted and saved to 'config.enc'"
