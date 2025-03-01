import * as vscode from "vscode";
import { exec, spawnSync } from "child_process";
import exp = require("constants");
import { FileManager } from "./fileManager";

export namespace Compiler {
  type OutputInfo = {
    file: string;
    line: number;
    column: number;
    code: string;
    message: string;
  };

  export async function compileTypescriptInWorkspace() {
    return new Promise<void>((resolve) => {
      const workspacePath = FileManager.getWorkspaceFolderPath();
      if (!workspacePath) {
        vscode.window.showErrorMessage("No workspace folder found.");
        return;
      }

      let parsedOutput: OutputInfo[] = [];
      let procInfo: any | undefined = undefined;
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Compiling Typescript files...",
          cancellable: false,
        },
        (progress, token) => {
          let proc = spawnSync("tsc", { cwd: workspacePath, shell: true });
          parsedOutput = parseTscOutput(proc.stdout.toString());
          procInfo = { status: proc.status };

          return new Promise<void>((resolve) => {
            resolve();
          });
        }
      );

      if (procInfo.status !== 0 && parsedOutput.length === 0) {
        vscode.window.showErrorMessage("There was an error while compiling. Is tsc/typescript installed?");
        resolve();
        return;
      }

      if (parsedOutput.length > 0) {
        vscode.window.showErrorMessage("Typescript compilation failed. Check the output for more information.");
        showErrorsInWebview(parsedOutput, workspacePath);
        resolve();
        return;
      }

      vscode.window.showInformationMessage("Typescript compilation finished");
      resolve();
    });
  }

  function parseTscOutput(output: string): OutputInfo[] {
    const lines = output.split("\n");
    const errors = lines
      .map((line) => {
        const match = line.match(/(.*)\((\d+),(\d+)\): error (TS\d+): (.*)/);
        if (match) {
          return {
            file: match[1],
            line: parseInt(match[2], 10),
            column: parseInt(match[3], 10),
            code: match[4],
            message: match[5],
          } as OutputInfo;
        }
        return null;
      })
      .filter((error) => error !== null) as OutputInfo[];
    return errors;
  }

  function showErrorsInWebview(errors: OutputInfo[], rootPath: string) {
    const panel = vscode.window.createWebviewPanel("tscErrors", "TypeScript Errors", vscode.ViewColumn.One, {
      enableScripts: true,
    });

    const errorList = errors
      .map(
        (error) => `
        <div>
          <strong>${error.code}</strong>: ${error.message}<br>
          <a href="#" onclick="openFile('${error.file}', ${error.line}, ${error.column})" title="Go to file">
            <em>${error.file} (${error.line}:${error.column})</em>
          </a>
        </div>
      `
      )
      .join("");

    panel.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TypeScript Errors (${errorList.length})</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 10px; }
          p { color: #5c5c5c; }
          div { margin-bottom: 14px; }
          strong { color: red; }
          em { color: gray; }
          a { text-decoration: underline; color: gray; }
          a:hover { text-decoration: underline; color: gray; }
        </style>
      </head>
      <body>
        <h1>TypeScript Errors</h1>
        <p>It's not the prettiest, but it's useful. You can also click on the file names</p>
        <br>
        <br>
        ${errorList}
        <script>
          const vscode = acquireVsCodeApi();
          function openFile(file, line, column) {
            vscode.postMessage({ command: 'openFile', file, line, column });
          }
        </script>
      </body>
      </html>
    `;

    panel.webview.onDidReceiveMessage(
      (message) => {
        console.log(message);
        if (message.command === "openFile") {
          const { file, line, column } = message;
          const openPath = vscode.Uri.file(`${rootPath}/${file}`);
          vscode.workspace.openTextDocument(openPath).then((doc) => {
            vscode.window.showTextDocument(doc).then((editor) => {
              const position = new vscode.Position(line - 1, column - 1);
              editor.selection = new vscode.Selection(position, position);
              editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
            });
          });
        }
      },
      undefined,
      []
    );
  }
}
