# NodeJS-EZTest

NodeJS-EZTest is a VS Code extension that simplifies the testing of Node.js projects. With just the click of a button, you can test your Node.js project _and track its progress in a console_.

## Features

- Test your Node.js project with just one button click.
- Automatic compilation and execution of TypeScript files.
- Support for executing JavaScript files.
- Output to a dedicated console.
- Convenient starting and stopping of code.
- Compiling TypeScript files without executing the code.
- Error document when a compilation fails.
    <br><br>
- For the button to be displayed, there must be the folder `node_modules` and TypeScript/JavaScript files in the current workspace.

## Usage

#### Start testing:

1. Open your Node.js project in VS Code. <br>
2. A "start Testing" button is displayed in the status bar. <br>
3. Click on the button to open a new console and execute the code <br>
      The process is displayed in the console. <br>
4. Click on the button again to stop the code and close the terminal. <br>
      <br>

- Press the "restart Testing" button to reopen and restart the terminal.
- By default, the extension waits for the code to finish. On the buttons "stop Testing" and "restart Testing" will appear "NOW" to abort the waiting and stop the code early.

#### Compile Typescript files:

1. Open your Node.js project with TypeScript files in VS Code. <br>
2. A "compile TS" button is displayed in the status bar. <br>
3. Click on the button to compile the TypeScript files to JavaScript files. <br>
4. Wait a bit and stare at the spinning loading symbol.
5. When the symbol of the button has changed, the compilation failed or finished.

   > If the compilation fails, a document will be displayed with error points.

<br>
<br>

- The "Compile TS" button is only displayed if TypeScript files and the `tsconfig.json` file are present, and no test is currently running.

<br><br>

# Configuration

You can configure with which runtime you code gets run.

Add this into the json root in `{workspace path}/.vscode/eztest.json`:
```json
"startConfig": {
   "indexFile": ".",          // Path to your code index file. (like './out/index.js')
   "runtimeCommand": "node",  // Command of a Javascript runtime (like 'node' or 'bun')
   "compileCommand": "tsc"    // Command that gets executed before the runtime gets run command. (You can set it to an empty string to ignore it.)
}
```
> By the way, if the file is not present, the extension will create it automatically when you press the "start Testing" button.

<br><br>

# Settings

By default, the extension will wait for the code to finish.
This can be changed with the setting `nodejs-eztest.waitForCodeToFinish` (default: checked/on).

It's also possible to change the wait time with `nodejs-eztest.finishWaitTime` in seconds (default: 15; min: 2; max: 300).

[Appstun](https://github.com/appstun) - Developer
