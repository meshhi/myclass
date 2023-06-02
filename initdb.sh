#!/bin/bash

docker run --name pg-myclass -p 3998:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=myclass -d postgres:latest