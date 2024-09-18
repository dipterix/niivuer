#!/bin/bash

cd inst/niivue-js

npx webpack && \
  cp -r dist/* ../niivuer-js-build/

cd ../..
