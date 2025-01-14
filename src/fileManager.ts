import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export type FilesCheck = {
  worspaceFolder: boolean;
  javascript: boolean;
  typescript: boolean;
  tsconfig: boolean;
  nodeModules: boolean;
};

export namespace FileManager {
  export let filesCheck: FilesCheck;

  let checkerUpdate: boolean = false;
  export async function startFileCheck() {
    if (checkerUpdate) {
      return;
    }

    filesCheck = await checkFiles();
    setInterval(async () => {
      filesCheck = await checkFiles();
    }, 60000);

    checkerUpdate = true;
  }

  export function hasWorkspaceFolder(): boolean {
    return filesCheck.worspaceFolder;
  }

  export function getWorkspaceFolderPath(): string | undefined {
    return vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  }

  export async function checkFiles(): Promise<FilesCheck> {
    const activeWorkspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!activeWorkspaceFolder) {
      return {
        worspaceFolder: true,
        javascript: false,
        typescript: false,
        tsconfig: false,
        nodeModules: false,
      };
    }

    const hasJsFiles = await vscode.workspace
      .findFiles(new vscode.RelativePattern(activeWorkspaceFolder, "**/*.js"), "**/node_modules/**", 1)
      .then((files) => files.length > 0);
    const hasTsFiles = await vscode.workspace
      .findFiles(new vscode.RelativePattern(activeWorkspaceFolder, "**/*.ts"), "**/node_modules/**", 1)
      .then((files) => files.length > 0);

    const hasTsconfig = await vscode.workspace
      .findFiles(new vscode.RelativePattern(activeWorkspaceFolder, "tsconfig.json"), "**/node_modules/**", 1)
      .then((files) => files.length > 0);
    const hasNodeModules = fs.existsSync(path.join(activeWorkspaceFolder.uri.fsPath, "node_modules"));

    return {
      worspaceFolder: true,
      javascript: hasJsFiles,
      typescript: hasTsFiles,
      tsconfig: hasTsconfig,
      nodeModules: hasNodeModules,
    };
  }
}
