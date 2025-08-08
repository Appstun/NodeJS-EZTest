import * as vscode from "vscode";
import { LaunchConfig } from "./config";
import { FileManager } from "./fileManager";
import { MessageManager } from "./MessageManager";
import { StatusbarButtons } from "./statusbarButtons";

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

  export async function startTerminal(updateButtons = true) {
    if (currentTerminal) {
      return;
    }

    if (!FileManager.hasWorkspaceFolder()) {
      MessageManager.showMessage({ type: "error", message: "No workspace folder found." });
      return;
    }

    currentTerminal = vscode.window.createTerminal({
      name: "Test Terminal",
      cwd: FileManager.getWorkspaceFolderPath(),
      isTransient: false,
    });
    currentTerminal.show();

    let opts = await LaunchConfig.getOptions();
    if (opts.compileCommand.trim().length > 0 && FileManager.filesCheck.typescript && FileManager.filesCheck.tsconfig) {
      currentTerminal.sendText(opts.compileCommand, true);
    }
    currentTerminal.sendText(`${opts.runtimeCommand} "${opts.indexFile}"`, true);

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
