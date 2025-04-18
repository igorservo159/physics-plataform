#!/bin/bash

docker build -t minha-api-nest .

docker run -p 3000:3000 \
  --env-file .env.prod \
  minha-api-nest

