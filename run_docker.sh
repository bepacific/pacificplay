#!/bin/bash
# Remove existing container if it exists
docker rm -f airtable-data-hub || true

# Build and run new container
docker build -t airtable-data-hub .

docker run -p 3000:5000 --env-file .env --name airtable-data-hub airtable-data-hub

