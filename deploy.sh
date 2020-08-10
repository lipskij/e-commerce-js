#!/bin/env sh
rsync -avz -e "ssh -i secrets/rsa -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" --progress --exclude 'node_modules' . ubuntu@34.244.54.141:~/app
