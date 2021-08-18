#!/bin/bash 

#Environment Variables
MOUNT_DB_PATH=~/data

export MOUNT_DB_PATH=$MOUNT_DB_PATH
echo "Exported MOUNT_DB_PATH as $MOUNT_DB_PATH."
echo "Spinning up docker image"

#Start docker image
docker-compose up --build