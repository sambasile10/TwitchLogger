#!/bin/bash 

#Environment Variables
MOUNT_DB_PATH=~/data
TWITCH_LOG_LEVEL=debug

export MOUNT_DB_PATH=$MOUNT_DB_PATH
export TWITCH_LOG_LEVEL=$TWITCH_LOG_LEVEL
echo "Exported MOUNT_DB_PATH as $MOUNT_DB_PATH."
echo "Exported TWITCH_LOG_LEVEL as $TWITCH_LOG_LEVEL." 
echo "Spinning up docker image"

#Start docker image
docker-compose up --build