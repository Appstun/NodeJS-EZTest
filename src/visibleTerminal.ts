import * as vscode from "vscode";
import { StatusbarButtons } from "./statusbarButtons";
import { Config } from "./config";
import { FileManager } from "./fileManager";

export namespace VisibleTerminal {
  export let currentTerminal: vscode.Terminal | undefined = undefined;

  export function isTerminalRunning() {
    return currentTerminal !== undefined;
  }

  export function toggleTerminal() {
    StatusbarButtons.updateStatusbar(100);
    if (currentTerminal) {
      stopTerminal();
    } else {
      startTerminal();
    }
  }

  export function restartTerminal() {
    StatusbarButtons.updateStatusbar(100);
    if (currentTerminal) {
      stopTerminal(false);
      startTerminal();
    }
  }

  export function startTerminal(updateButtons = true) {
    if (currentTerminal) {
      return;
    }

    if (!FileManager.hasWorkspaceFolder()) {
      vscode.window.showErrorMessage("No workspace folder found.");
      return;
    }

    currentTerminal = vscode.window.createTerminal({
      name: "Test Terminal",
      cwd: FileManager.getWorkspaceFolderPath(),
      isTransient: false,
    });
    currentTerminal.show();
    
    //execute tsc if ts files are present
    if (FileManager.filesCheck.typescript && FileManager.filesCheck.tsconfig) {
      currentTerminal.sendText(Config.terminalCommands.compileTs);
    }
    currentTerminal.sendText(Config.terminalCommands.startNode);

    if (updateButtons) {
      StatusbarButtons.updateStatusbar();
    }
    //vscode.window.showInformationMessage("Terminal and code launched");
  }

  export function stopTerminal(updateButtons = true) {
    if (!currentTerminal) {
      return;
    }

    currentTerminal.dispose();

    currentTerminal = undefined;

    if (updateButtons) {
      StatusbarButtons.updateStatusbar();
      vscode.window.showInformationMessage("Terminal and code stopped");
    }
  }
}
