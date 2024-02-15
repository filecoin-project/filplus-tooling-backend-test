#!/bin/bash
REPOS=(
    "git@github.com:keyko-io/test-phillip-second.git"
    "git@github.com:keyko-io/alexander-the-test.git"
    "git@github.com:keyko-io/great-test-library.git"
    "git@github.com:filecoin-project/filplus-tooling-backend-test.git"
)

# Ensure that changes are ready to commit
# You can modify this part as per your requirement
git add .
echo "Enter commit message: "
read COMMIT_MESSAGE
git commit -m "$COMMIT_MESSAGE"

# Push to each repository
for REPO in "${REPOS[@]}"
do
    echo "Pushing to $REPO"
    git push "$REPO" main
done

echo "Pushed to all repositories."

# Wait for a button press before closing
read -p "Press any key to continue..."
