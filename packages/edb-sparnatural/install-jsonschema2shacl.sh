#!/usr/bin/env bash

if [ ! -f "jsonschema2shacl/requirements.txt" ]; then
  while true; do
    read -p "Submodules not initialized. Initialize now? (Y/N): " yn
    case $yn in
      [Yy]* ) git submodule update --init --recursive; break;;
      [Nn]* ) echo "Exiting without initializing submodules."; exit 1;;
      * ) echo "Please answer Yes or No.";;
    esac
  done
fi

python3 -m venv .venv || true
.venv/bin/pip install -r jsonschema2shacl/requirements.txt
