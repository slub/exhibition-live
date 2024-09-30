#!/usr/bin/env bash

set -e  # Exit immediately on error

# Check for required arguments
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <starting_commit_sha> <folder_or_git_remote>"
  exit 1
fi

# Set defaults
STARTING_COMMIT_SHA=""
END_COMMIT_SHA=""
FOLDER_OR_GIT_REMOTE=""
CLONE_EACH_TIME=false # Default to not cloning each time
ORIGINAL_FOLDER=$PWD
MAIN_APP="apps/exhibition-live"
PROJECT_DIR="project-checkout"

# Function to display help message
show_help() {
  echo "Usage: $0 -s <starting_commit_sha> -e <end_commit_sha> -r <folder_or_git_remote> [options]"
  echo "Options:"
  echo "  -s, --start          Starting commit SHA (required)"
  echo "  -e, --end            Ending commit SHA (defaults to HEAD)"
  echo "  -r, --remote         Folder or Git remote URL (required)"
  echo "  -c, --clone-each     Clone repository for each commit (optional)"
  echo "  -h, --help           Display this help message"
}

# Process command-line arguments using getopts
while getopts ":s:e:r:ch" opt; do
  case $opt in
    s) STARTING_COMMIT_SHA="$OPTARG" ;;
    e) END_COMMIT_SHA="$OPTARG" ;;
    r) FOLDER_OR_GIT_REMOTE="$OPTARG" ;;
    c) CLONE_EACH_TIME=true ;;
    h) show_help && exit 0 ;;
    \?) echo "Invalid option: -$OPTARG" >&2; show_help && exit 1 ;;
    :) echo "Option -$OPTARG requires an argument." >&2; show_help && exit 1 ;;
  esac
done

# Check for required arguments
if [ -z "$STARTING_COMMIT_SHA" ] || [ -z "$FOLDER_OR_GIT_REMOTE" ]; then
  echo "Error: -s and -r options are required." >&2
  show_help && exit 1
fi

# If END_COMMIT_SHA is not provided, default to HEAD
if [ -z "$END_COMMIT_SHA" ]; then
  END_COMMIT_SHA="HEAD"
fi

# ... (Rest of your script)

echo "STARTING_COMMIT =$STARTING_COMMIT_SHA"
echo "FOLDER_OR_GIT_REMOTE =$FOLDER_OR_GIT_REMOTE"

# Function to run tests for a specific commit
run_tests_for_commit() {
  local commit_sha=$1

  echo "Testing commit: $commit_sha"


  # nonzero and not false
  if [ -n CLONE_EACH_TIME -a "$CLONE_EACH_TIME" != "false" ]; then
    cd "$ORIGINAL_FOLDER"
    rm -rf "$PROJECT_DIR"
    git clone -q "$FOLDER_OR_GIT_REMOTE" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
  fi

  git stash
  git checkout -q "$commit_sha"

  bun i
  bun build:packages || true

  cp ../personList.cy.js "$MAIN_APP/cypress/e2e/"
  cp ../cypress.config.ts "$MAIN_APP/"
  cp ../.env.local "$MAIN_APP/"


  cd "$MAIN_APP"
  # Run development server in the background
  bun run dev:vite &
  vite_pid=$!

  # Give the server time to start
  sleep 2

  bun add @testing-library/cypress --dev
  echo "import '@testing-library/cypress/add-commands'" >> cypress/support/commands.ts

  # Run Cypress tests, redirecting output to a log file
  COMMIT_SHA=${commit_sha} bunx cypress run --headed --spec ./cypress/e2e/personList.cy.js  2>&1 | tee "$ORIGINAL_FOLDER/${commit_sha}.cypress.log" || true

  echo "Test run ready"

  # Kill the development server
  kill "$vite_pid" || true
  killall node || true


  local SCREENSHOT_FOLDER="./cypress/screenshots/personList.cy.js"

  if [ -d "${SCREENSHOT_FOLDER}" ]; then
    echo "Will copy screenshots"
    mv "${SCREENSHOT_FOLDER}" "${ORIGINAL_FOLDER}/${commit_sha}"
  else
    echo "no screenshots to copy"
  fi

  cd "$ORIGINAL_FOLDER/$PROJECT_DIR"

  echo "Finished testing commit: $commit_sha"

  sleep 2
}

# --- Main Script ---

#check if folder exists

if [ -d "$PROJECT_DIR" ]; then
  echo "Folder exists"
  cd "$PROJECT_DIR"
  git stash
  git checkout -q $END_COMMIT_SHA
  #git pull
else
  echo "Folder does not exist"
  # Clone only once at the beginning
  git clone -q "$FOLDER_OR_GIT_REMOTE" "$PROJECT_DIR"
  cd "$PROJECT_DIR"
  git checkout -q $END_COMMIT_SHA
fi

# Get the list of commits
commit_list=$(git rev-list "$STARTING_COMMIT_SHA"..HEAD | tac)

echo "Commits to test: $commit_list"

# Iterate over the commit list and run tests
for commit_sha in $commit_list; do
  run_tests_for_commit "$commit_sha"
done

cd "$ORIGINAL_FOLDER"

echo "All commits tested."
