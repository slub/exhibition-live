#build-helper

This package provides a set of utilities to help with the build process of other packages.

## get-dependencies

Will return a list of all the dependencies of a directory
containing typescript files. The dependencies are returned as a
package.json object, containing dependencies and devDependencies.

It can be used to scaffold a package.json file for a new package,
when breaking down a monolithic package into smaller packages or
packaging methods previously build into an application.

### Usage

```bash
bun get-dependencies.js path/to/directory
```

### Caution

Do not blindly use the output of this script as the package.json
Especially frontend packages require a `peerDependencies` field
where the version of the dependency is specified. Packages like `react`,
`@mui/material`, `@mui/icons-material` and `@mui/lab` are examples of
those dependencies, that shouldn't be included in the `dependencies`
of frontend packages.

Otherwise the using app will have multiple versions of the same library
which most likely will cause all sorts of issues.

## bug-hunter.sh

A Sequential Commit Testing Script.

This script runs a specified Cypress test against a range of commits sequentially, helping you identify when a particular bug was introduced or fixed.

### Prerequisites

- **Bash:** The script is written in Bash and needs to be run in a Bash-compatible shell.
- **Git:** You need Git installed and the repository you want to test should be cloned locally.
- **Bun:** The script uses `bun` for package management and running Cypress. Make sure you have Bun installed and configured for your project.
- **Cypress:** Your project should have Cypress set up with a test that specifically checks for the bug you are interested in.

### Usage

1. **Make the script executable:**

   ```bash
   chmod +x bug-hunter.sh
   ```

2. **Run the script with the following options:**

   ```bash
   ./bug-hunter.sh -s <starting_commit_sha> -r <folder_or_git_remote> [options]
   ```

   **Required Options:**

- `-s, --start <starting_commit_sha>`: The commit SHA where you want to start the testing.
- `-r, --remote <folder_or_git_remote>`: The path to your local Git repository or a remote Git URL.

  **Optional Options:**

- `-e, --end <end_commit_sha>`: The commit SHA where you want to end the testing (defaults to `HEAD`).
- `-c, --clone-each`: Clone the repository for each commit being tested (useful if your tests modify the repository state).
- `-h, --help`: Display the help message.

### How it Works

The script iterates through the specified commit range and performs the following steps for each commit:

1. **Checkout:** It checks out the commit within the cloned repository.
2. **Install Dependencies (if needed):** Runs `bun install` if the `-c` (clone each time) option is used.
3. **Run Cypress Tests:** It executes the configured Cypress test suite.
4. **Collect Results:** The output of the Cypress test run, along with any relevant logs, is saved to a file named with the commit SHA.

### Example

```bash
./bug-hunter.sh -s abc123def456 -r ~/my-project -e fgh789ijk012 -c
```

This command will run the Cypress tests for each commit from `abc123def456` to `fgh789ijk012` in the repository located at `~/my-project`. The `-c` flag ensures a clean checkout for every commit.

#### Output

The script creates log files (named using the commit SHA) containing the output of each Cypress test run. You can analyze these log files to identify at which point the bug was introduced or fixed.

### Notes

- copy this script to an empty directory not under version control.
- Adjust the script's configuration (e.g., the path to your Cypress test file) to match your project setup.
  - needs to be done directly in the script
- Consider using a more sophisticated log analysis tool or integrating with a CI/CD pipeline for easier result interpretation in larger projects or for automated bug hunting workflows.
