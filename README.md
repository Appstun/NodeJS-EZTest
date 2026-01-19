# NodeJS-EZTest

NodeJS-EZTest is a VS Code extension that simplifies testing Node.js projects. With a single click, you can run tests for your Node.js project and view the progress in a console.

## Features

- Run tests with a single button click.
- Automatic compilation and execution of TypeScript files.
- Support for executing JavaScript files.
- Output to a dedicated console.
- Easy start and stop of the running code.
- Compile TypeScript files without executing them.
- Display an error document when compilation fails.

For the buttons to be shown, the workspace must contain a `node_modules` folder and TypeScript or JavaScript files.

## Usage

#### Start testing:

1. Open your Node.js project in VS Code.
2. A "Start Testing" button appears in the status bar.
3. Click the button to open a new console and run your code.
4. Click the button again to stop the running code and close the terminal.

- Press the "Restart Testing" button to reopen and restart the terminal.
- By default, the extension waits for the code to finish. The "Stop Testing" and "Restart Testing" buttons will display "NOW" to abort the waiting period and stop the code immediately.

#### Compile TypeScript files:

1. Open your Node.js project that contains TypeScript files in VS Code.
2. A "Compile TS" button appears in the status bar.
3. Click the button to compile the TypeScript files to JavaScript.
4. Wait briefly while compilation runs.
5. When the button's icon changes, compilation has finished or failed.

> If compilation fails, an error document listing the issues will open.

- The "Compile TS" button is shown only if TypeScript files and a `tsconfig.json` file are present, and no test is currently running.

## Configuration

You can configure which runtime your code uses.

Add this to the JSON root in `{workspace path}/.vscode/eztest.json`:
```json
"startConfig": {
   "indexFile": ".",          // Path to your entry file (e.g. "./out/index.js")
   "runtimeCommand": "node",  // Command of a JavaScript runtime (e.g. "node" or "bun")
   "compileCommand": "tsc"    // Command executed before running the runtime. Set to "" to skip compilation.
}
```

If the file does not exist, the extension will create it automatically when you press the "Start Testing" button.

## Settings

By default, the extension waits for the code to finish. This can be changed with the setting `nodejs-eztest.waitForCodeToFinish` (default: true).

You can also change the wait time with `nodejs-eztest.finishWaitTime` in seconds (default: 15; min: 2; max: 300).

[Appstun](https://github.com/appstun) - Developer