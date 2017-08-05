#!/bin/bash

set -e

if [ "$TEST" = 1 ]; then
    npm install react react-dom prop-types && npm install
    npm run test
fi;

if [ "$TYPECHECK" = 1 ]; then
    npm install flow-bin
    npm run typecheck
fi;

if [ "$LINT" = 1 ]; then
    npm install react react-dom prop-types && npm install
    npm run lint
fi;

if [ "$BROWSER" = 1 ]; then
    npm install -g cypress-cli http-server
    http-server --silent &
    cypress run --record
fi;
