#!/bin/bash

set -ex

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
    npm install -g http-server
    npm install --save-dev cypress
    npm install react react-dom create-react-class prop-types gulp
    gulp examples
    http-server --silent &
    cypress run --record
fi;
