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

[Appstun](https://github.com/appstun) - Developer
