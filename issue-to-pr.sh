#!/bin/sh
curl --header "Content-Type: application/json" --request POST --data '{"application_id": "'"$1"'"}' https://fp-core.6omfj573u6naa.us-east-2.cs.amazonlightsail.com/application

