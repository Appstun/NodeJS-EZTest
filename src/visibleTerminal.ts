import * as vscode from "vscode";
import { Config, LaunchConfig, Settings } from "./config";
import { Index } from "./extension";
import { FileManager } from "./fileManager";
import { MessageManager } from "./MessageManager";
import { StatusbarButtons } from "./statusbarButtons";

export namespace VisibleTerminal {
  export let currentTerminal: vscode.Terminal | undefined = undefined;
  export let updateButtons_: boolean = true;
  export let executeOnNextEndFunctions: (() => Promise<void>)[] = [];
  export let stopOnAbort: boolean = false;
  export let hasEnded: boolean = false;
  let stoppingProgress: MessageManager.ProgressMessage | undefined = undefined;
  let exitCheckInterval: NodeJS.Timeout | undefined = undefined;

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

  export async function restartTerminal() {
    StatusbarButtons.updateStatusbar(100);
    if (currentTerminal) {
      executeOnNextEndFunctions.push(async () => {
        startTerminal();
      });

      stopTerminal(true, true);
    }
  }

  export async function startTerminal(updateButtons = true) {
    updateButtons_ = updateButtons;
    if (currentTerminal) {
      return;
    }
    clearInterval(exitCheckInterval);
    executeOnNextEndFunctions = [];

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

    await sendExecute();

    if (updateButtons) {
      StatusbarButtons.updateStatusbar();
    }
  }

  export function stopTerminal(updateButtons = true, isRestart = false) {
    updateButtons_ = updateButtons;
    if (!currentTerminal) {
      return;
    }

    if (stoppingProgress) {
      if (!isRestart) {
        executeOnNextEndFunctions = [];
        updateButtons_ = true;
      }

      onExecutionEnd(isRestart ? "any" : "user");
      return;
    }

    if (hasEnded) {
      onExecutionEnd(isRestart ? "any" : "normal");
      return;
    }

    sendAbort();

    const setExeEnd = Settings.getSetting<boolean>("waitForCodeToFinish");
    if (setExeEnd === false) {
      onExecutionEnd(isRestart ? "any" : "normal");
      return;
    }

    let stopText = "Stopping";
    if (isRestart) {
      stopText = "Restarting";
    }
    stoppingProgress = new MessageManager.ProgressMessage({ firstMessage: `${stopText} code...` });

    setTimeout(() => {
      let loopCount = Settings.getSetting<number>("finishWaitTime") || 15;
      if (loopCount < 2 || loopCount > 300) {
        loopCount = 15;
      }
      loopCount = loopCount * 5 - 1;

      if (!currentTerminal) {
        return;
      }

      if (hasEnded) {
        onExecutionEnd(isRestart ? "any" : "normal");
        return;
      }
      stopOnAbort = true;

      Index.statusBarItems[0].text += ` ${Config.statusbarItemTexts.stopTest.extraWaitEnd}`;
      Index.statusBarItems[1].text += ` ${Config.statusbarItemTexts.restartTest.extraWaitEnd}`;

      stoppingProgress?.setProgress(`${stopText}: Waiting ${Math.ceil(loopCount / 5)}s for the code to finish...`);
      // MessageManager.showMessage({ type: "info", message: `${stopText}: Press the button again to end the code now` });

      exitCheckInterval = setInterval(() => {
        if (!currentTerminal || !exitCheckInterval || loopCount === 0) {
          if (isRestart) {
            onExecutionEnd("any");
          } else {
            onExecutionEnd(loopCount > 0 ? "codeExit" : "extension");
          }
        }

        stoppingProgress?.setProgress(`${stopText}: Waiting ${Math.ceil(loopCount / 5)}s for the code to finish...`);
        loopCount--;
      }, 200);
    }, 1000);
  }

  export function onExecutionEnd(endedBy: "user" | "extension" | "codeExit" | "any" | "normal") {
    const updBtns = updateButtons_ ? true : false;
    stopOnAbort = false;
    hasEnded = true;

    currentTerminal?.dispose();
    currentTerminal = undefined;

    executeOnNextEndFunctions.forEach((fn) => fn());
    executeOnNextEndFunctions = [];

    if (updBtns) {
      StatusbarButtons.updateStatusbar();
    }

    if (stoppingProgress || endedBy === "normal") {
      if (endedBy !== "any") {
        switch (endedBy) {
          case "user":
            MessageManager.showMessage({ type: "info", message: "Code stopped by user" });
            break;
          case "extension":
            MessageManager.showMessage({ type: "info", message: "Code forcibly stopped" });
            break;
          case "codeExit":
            MessageManager.showMessage({ type: "info", message: "Code finished" });
            break;
          case "normal":
            MessageManager.showMessage({ type: "info", message: "Code stopped" });
            break;
        }
      }
    }

    stoppingProgress?.finish();
    stoppingProgress = undefined;

    clearInterval(exitCheckInterval);
    exitCheckInterval = undefined;
  }

  async function sendExecute() {
    if (!currentTerminal) {
      return;
    }

    let opts = await LaunchConfig.getOptions();
    if (opts.compileCommand.trim().length > 0 && FileManager.filesCheck.typescript && FileManager.filesCheck.tsconfig) {
      currentTerminal.sendText(opts.compileCommand, true);
    }
    currentTerminal.sendText(`${opts.runtimeCommand} "${opts.indexFile}"`, true);
    hasEnded = false;
  }

  function sendAbort(stopAfterAbort: boolean = false) {
    if (!currentTerminal) {
      return;
    }

    stopOnAbort = stopAfterAbort;

    if (process.platform === "win32") {
      currentTerminal.sendText("\u0003", true); // Sends Ctrl+C to the terminal
    } else {
      currentTerminal.sendText("\x03", true); // Sends Ctrl+C to the terminal for non-Windows systems
    }
  }
}
