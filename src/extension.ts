import * as vscode from "vscode";
import { FileManager } from "./fileManager";
import { VisibleTerminal } from "./visibleTerminal";
import { MessageManager } from "./MessageManager";
import { StatusbarButtons } from "./statusbarButtons";
import { Config } from "./config";
import { Compiler } from "./compile";
import { JsonDB } from "./jsonManager";

export namespace Index {
  export let statusBarItems: vscode.StatusBarItem[] = [];
  export let statusbarPrioirty = 1000;

  export function compileTS() {
    if (!VisibleTerminal.currentTerminal) {
      if (!FileManager.hasWorkspaceFolder()) {
        MessageManager.showMessage({ type: "error", message: "No workspace folder found." });
        return;
      }

      //Disable buttons, show loading, compile TS, enable buttons
      StatusbarButtons.updateStatusbar(true);
      statusBarItems[1].text = `$(loading~spin) ${Config.statusbarItemTexts.compileTs.text}`;

      setTimeout(async () => {
        await Compiler.compileTypescriptInWorkspace();
        StatusbarButtons.updateStatusbar(false);
      }, 100);
    }
  }
}

export async function activate({ subscriptions }: vscode.ExtensionContext) {
  //Create Buttons
  Index.statusBarItems.push(vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, Index.statusbarPrioirty));
  Index.statusBarItems.push(
    vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, Index.statusbarPrioirty - Index.statusBarItems.length)
  );

  //Add commands to buttons
  Index.statusBarItems[0].command = Config.commandNames.startStop;
  Index.statusBarItems[1].command = Config.commandNames.tscRestart;

  // Register commands
  subscriptions.push(
    vscode.commands.registerCommand(Config.commandNames.startStop, () => {
      if (!StatusbarButtons.isButtonsDisabled()) {
        VisibleTerminal.toggleTerminal();
      }
    })
  );
  subscriptions.push(
    vscode.commands.registerCommand(Config.commandNames.tscRestart, () => {
      if (!StatusbarButtons.isButtonsDisabled()) {
        //Restart Terminal if running, else compile TS
        VisibleTerminal.isTerminalRunning() ? VisibleTerminal.restartTerminal() : Index.compileTS();
      }
    })
  );

  // Register events
  subscriptions.push(
    vscode.window.onDidCloseTerminal((event) => {
      if (event.processId === VisibleTerminal.currentTerminal?.processId) {
        VisibleTerminal.stopTerminal();
      }
    })
  );
  subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(() => StatusbarButtons.updateStatusbar()));
  subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => StatusbarButtons.updateStatusbar()));

  //First File check and Statusbar update
  //+ File check every 60 seconds
  FileManager.startFileCheck().then(() => StatusbarButtons.updateStatusbar());
}

export function deactivate() {
  VisibleTerminal.stopTerminal();
}