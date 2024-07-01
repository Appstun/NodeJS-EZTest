# NodeJS-EZTest

NodeJS-EZTest is a VS Code extension that simplifies the testing of Node.js projects. With just the click of a button, you can test your Node.js project _and track its progress in a console_.

## Functions

- Test your Node.js project with just one button click.
- Automatic compilation and execution of TypeScript files.
- Support for executing JavaScript files.
- Output to a dedicated console.
- Convenient starting and stopping of code.
- Compiling Typescript files without executing the code.
  <br><br>
- For the button to be displayed, there must be the folder `node_modules` and Typescript/Javascript files in the current workspace.

## Usage

#### To start testing:
1. Open your Node.js project in VS Code. <br>
2. A "start Testing" button is displayed in the status bar. <br>
3. Click on the button to open a new console and execute the code <br>
The process is displayed in the console. <br>
5. Click on the button again to stop the code and close the terminal. <br>
   <br>

- Press the "restart Testing" button to reopen the terminal.
- epic pro tip: Use `Ctrl+R` or `Cmd+R` on Mac to terminate the currently running command. After that you can use the terminal as usual.

#### To compile Typescript files
1. Open your Node.js project with Typescript files in VS Code. <br>
2. A "compile TS" button is displayed in the status bar. <br>
3. Click on the button to compile the Typescript files to Javascript files. <br>
4. Wait a bit and stare at the spinning loading symbol.
5. When the symbol of the button has changed, the compilation is complete.

- The "Compile TS" button is only displayed if typescript files and the `tsconfig.json` file are present. 

## Installation

1. Open VS Code. <br>
2. Go to the extension menu (left sidebar) or use the key combination `Ctrl+Shift+X` or `Cmd+Shift+X` om Mac. <br>
3. Enter "NodeJS-EZTest" in the search field. <br>
4. Click on "Install" to install the extension. <br>
5. Restart VS Code to activate the extension. <br>

<br><br>

[Appstun](https://github.com/appstun) - Main Developer
###### NodeJS-EZTest 0.2.1
