#!/bin/bash 

#Environment Variables
MOUNT_DB_PATH=~/data
TMI_DEBUG=false

export MOUNT_DB_PATH=$MOUNT_DB_PATH
export TMI_DEBUG=$TWITCH_LOG_LEVEL
echo "Exported MOUNT_DB_PATH as $MOUNT_DB_PATH."
echo "Exported TMI_DEBUG as $TMI_DEBUG." 
echo "Spinning up docker image"

#Start docker image
docker-compose up --build