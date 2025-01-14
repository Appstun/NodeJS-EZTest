import { Config } from "./config";
import { Index } from "./extension";
import { FileManager } from "./fileManager";
import { VisibleTerminal } from "./visibleTerminal";

export namespace StatusbarButtons {
  let buttonDisabledTimeout: NodeJS.Timeout | undefined;

  export function isButtonsDisabled() {
    return buttonDisabledTimeout !== undefined;
  }

  export async function updateStatusbar(disableButtons?: number | boolean) {

    //Update buttons texts
    if (VisibleTerminal.currentTerminal) {
      Index.statusBarItems[0].text = `$(${Config.statusbarItemTexts.stopTest.symbole}) ${Config.statusbarItemTexts.stopTest.text}`;
      Index.statusBarItems[1].text = `$(${Config.statusbarItemTexts.restartTest.symbole}) ${Config.statusbarItemTexts.restartTest.text}`;
    } else {
      Index.statusBarItems[0].text = `$(${Config.statusbarItemTexts.startTest.symbole}) ${Config.statusbarItemTexts.startTest.text}`;
      Index.statusBarItems[1].text = `$(${Config.statusbarItemTexts.compileTs.symbole}) ${Config.statusbarItemTexts.compileTs.text}`;
    }

    //Hide buttons when no workspace folder is found
    if (!FileManager.filesCheck.worspaceFolder) {
      Index.statusBarItems[0].hide();
      Index.statusBarItems[1].hide();
      return;
    }

    //Show start/stop button when "executable" files are found
    if (
      FileManager.filesCheck.nodeModules &&
      (FileManager.filesCheck.javascript || (FileManager.filesCheck.typescript && FileManager.filesCheck.tsconfig))
    ) {
      Index.statusBarItems[0].show();
    } else {
      Index.statusBarItems[0].hide();
    }

    //Show restart/compile button when TS files and tsconfig are found
    if (FileManager.filesCheck.typescript && FileManager.filesCheck.tsconfig) {
      Index.statusBarItems[1].show();
    } else {
      Index.statusBarItems[1].hide();
    }

    //Show restart/compile button when terminal is running
    if (VisibleTerminal.currentTerminal) {
      Index.statusBarItems[1].show();
    }
  }

  function disableButtonsMs(miliseconds: number) {
    if (buttonDisabledTimeout) {
      return;
    }

    buttonDisabledTimeout = setTimeout(() => {
      buttonDisabledTimeout = undefined;
    }, miliseconds);
  }

  function enableButtons() {
    if (buttonDisabledTimeout) {
      clearTimeout(buttonDisabledTimeout);
      buttonDisabledTimeout = undefined;
    }
  }
}
