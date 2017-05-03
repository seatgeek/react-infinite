#!/bin/bash

set -e

if [ "$TEST" = 1 ]; then
    npm install react react-dom prop-types create-react-class
    npm run test
fi;

if [ "$TYPECHECK" = 1 ]; then
    npm run typecheck
fi;

if [ "$LINT" = 1 ]; then
    npm run lint
fi;
