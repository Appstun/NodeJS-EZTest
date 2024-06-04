"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
let currentTerminal = undefined;
let statusBarItem;
const cmdName = "nodejs-eztest.eztest";
const statusBarItemTexts = [
    "$(terminal) start Testing",
    "$(stop) stop Testing",
];
const tsCommand = "tsc";
const jsCommand = "node .";
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate({ subscriptions }) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 4269);
    statusBarItem.command = cmdName;
    let disposable = vscode.commands.registerCommand(cmdName, () => runCode());
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = cmdName;
    subscriptions.push(statusBarItem);
    subscriptions.push(disposable);
    subscriptions.push(vscode.window.onDidCloseTerminal((event) => {
        if (event.processId === currentTerminal?.processId) {
            stopCode();
        }
    }));
    subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(updateStatusBarItem));
    subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
    updateStatusBarItem();
}
exports.activate = activate;
function runCode() {
    if (currentTerminal && !currentTerminal.exitStatus) {
        stopCode();
        return;
    }
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder found.");
        return;
    }
    const tsFiles = [];
    const excludeFolders = ["node_modules"];
    const files = vscode.workspace.findFiles("**/*.ts", "**/{" + excludeFolders.join(",") + "}/**");
    files.then((uris) => {
        uris.forEach((uri) => {
            if (!excludeFolders.some((folder) => uri.path.includes(folder))) {
                tsFiles.push(uri);
            }
        });
        currentTerminal = vscode.window.createTerminal({
            name: "Code Terminal",
            cwd: workspaceFolder.uri.fsPath,
        });
        currentTerminal.show();
        if (tsFiles.length > 0) {
            currentTerminal.sendText(tsCommand);
        }
        currentTerminal.sendText(jsCommand);
        updateStatusBarItem();
        //vscode.window.showInformationMessage("Terminal and code launched");
    });
}
function deactivate() {
    stopCode();
}
exports.deactivate = deactivate;
function stopCode() {
    if (currentTerminal) {
        currentTerminal.dispose();
        currentTerminal = undefined;
        updateStatusBarItem();
        vscode.window.showInformationMessage("Terminal and code stopped");
    }
}
function updateStatusBarItem() {
    if (currentTerminal) {
        statusBarItem.text = statusBarItemTexts[1];
    }
    else {
        statusBarItem.text = statusBarItemTexts[0];
    }
    updateStatusBarVisibility();
}
function updateStatusBarVisibility() {
    const activeWorkspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!activeWorkspaceFolder) {
        statusBarItem.hide();
        return;
    }
    const nodeModulesPath = path.join(activeWorkspaceFolder.uri.fsPath, "node_modules");
    const hasNodeModules = fs.existsSync(nodeModulesPath);
    const filePattern = new vscode.RelativePattern(activeWorkspaceFolder, "**/*.{js,ts}");
    const tsConfigPattern = new vscode.RelativePattern(activeWorkspaceFolder, "tsconfig.json");
    const hasJsOrTsFiles = vscode.workspace
        .findFiles(filePattern, "**/node_modules/**", 1)
        .then((files) => files.length > 0);
    const hasTsConfig = vscode.workspace
        .findFiles(tsConfigPattern, "**/node_modules/**", 1)
        .then((files) => files.length > 0);
    Promise.all([hasNodeModules, hasJsOrTsFiles, hasTsConfig]).then(([nodeModules, jsOrTsFiles, tsConfig]) => {
        //vscode.window.showInformationMessage(`${nodeModules} && (${jsOrTsFiles} || ${tsConfig})`);
        if (nodeModules && (jsOrTsFiles || tsConfig)) {
            statusBarItem.show();
        }
        else {
            statusBarItem.hide();
        }
    });
}
//# sourceMappingURL=extension.js.map