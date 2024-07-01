import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

let currentTerminal: vscode.Terminal | undefined = undefined;
let statusBarItems: vscode.StatusBarItem[] = [];
let statusbarPrioirty = 1000;
let filesCheck: {
  worspaceFolder: boolean;
  javascript: boolean;
  typescript: boolean;
  tsconfig: boolean;
  nodeModules: boolean;
};

const cmdNames: string[] = [
  "nodejs-eztest.start_stop",
  "nodejs-eztest.tsc_restart",
];
const statusBarItemTexts: string[] = [
  "$(terminal) start Testing",
  "$(stop) stop Testing",
  "$(symbol-keyword) compile TS",
  "$(refresh) restart Testing",
];
const tsCommand = "tsc";
const jsCommand = "node .";

let buttonDisabled = false;
function disableButtons(miliseconds: number) {
  buttonDisabled = true;

  let time = miliseconds;
  let interval = setInterval(() => {
    if (time <= 0 || !buttonDisabled) {
      clearInterval(interval);
      buttonDisabled = false;
      return;
    }
    time--;
  }, 1);
}

async function startFileCheck() {
  filesCheck = await checkFiles();
  +setTimeout(async () => {
    filesCheck = await checkFiles();
  }, 60000);
}

export async function activate({ subscriptions }: vscode.ExtensionContext) {
  startFileCheck();

  statusBarItems.push(
    vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      statusbarPrioirty
    )
  );
  statusBarItems.push(
    vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      statusbarPrioirty - statusBarItems.length
    )
  );

  statusBarItems[0].command = cmdNames[0];
  statusBarItems[1].command = cmdNames[1];

  subscriptions.push(
    vscode.commands.registerCommand(cmdNames[0], () => {
      if (!buttonDisabled) {
        toggleTerminal();
      }
    })
  );
  subscriptions.push(
    vscode.commands.registerCommand(cmdNames[1], () => {
      if (!buttonDisabled) {
        currentTerminal ? restartTerminal() : compileTS();
      }
    })
  );

  subscriptions.push(
    vscode.window.onDidCloseTerminal((event) => {
      if (event.processId === currentTerminal?.processId) {
        stopTerminal();
      }
    })
  );
  subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(updateStatusBarItem)
  );
  subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem)
  );

  updateStatusBarItem();
}

export function deactivate() {
  stopTerminal();
}

function compileTS() {
  if (!currentTerminal) {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("No workspace folder found.");
      return;
    }
    buttonDisabled = true;

    let split = statusBarItemTexts[2].split(" ");
    vscode.window.showInformationMessage("Compiling Typescript files...");
    split = split.slice(1);
    statusBarItems[1].text = `$(loading~spin) ${split.join(" ")}`;
    let terminal = vscode.window.createTerminal({
      name: "TS Compiler",
      cwd: workspaceFolder.uri.fsPath,
      isTransient: false,
      hideFromUser: true,
    });

    terminal.sendText(tsCommand);
    terminal.sendText("exit");

    let quitTimer = 60;
    let interval = setInterval(() => {
      if (terminal.exitStatus !== undefined) {
        clearInterval(interval);

        vscode.window.showInformationMessage("Typescript compilation finished");
        terminal.dispose();

        buttonDisabled = false;
        updateStatusBarItem();
      }
      if (quitTimer <= 0) {
        clearInterval(interval);

        vscode.window.showWarningMessage(
          "Typescript compilation took too long... Aborted!"
        );
        terminal.dispose();

        buttonDisabled = false;
        updateStatusBarItem();
      } else {
        quitTimer--;
      }
    }, 1000);
  }
}

function toggleTerminal() {
  disableButtons(100);
  if (currentTerminal) {
    stopTerminal();
  } else {
    startTerminal();
  }
}

function restartTerminal() {
  disableButtons(100);
  if (currentTerminal) {
    stopTerminal(false);
    startTerminal();
  }
}

function startTerminal(updateButtons = true) {
  if (currentTerminal) {
    return;
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage("No workspace folder found.");
    return;
  }

  const tsFiles: vscode.Uri[] = [];
  const excludeFolders = ["node_modules"];

  const files = vscode.workspace.findFiles(
    "**/*.ts",
    "**/{" + excludeFolders.join(",") + "}/**"
  );
  files.then((uris) => {
    uris.forEach((uri) => {
      if (!excludeFolders.some((folder) => uri.path.includes(folder))) {
        tsFiles.push(uri);
      }
    });

    currentTerminal = vscode.window.createTerminal({
      name: "Code Terminal",
      cwd: workspaceFolder.uri.fsPath,
      isTransient: false,
    });

    currentTerminal.show();
    if (tsFiles.length > 0) {
      currentTerminal.sendText(tsCommand);
    }
    currentTerminal.sendText(jsCommand);

    if (updateButtons) {
      updateStatusBarItem();
    }
    //vscode.window.showInformationMessage("Terminal and code launched");
  });
}

function stopTerminal(updateButtons = true) {
  if (!currentTerminal) {
    return;
  }

  currentTerminal.dispose();

  currentTerminal = undefined;

  if (updateButtons) {
    updateStatusBarItem();
    vscode.window.showInformationMessage("Terminal and code stopped");
  }
}

async function updateStatusBarItem() {
  if (currentTerminal) {
    statusBarItems[0].text = statusBarItemTexts[1];
    statusBarItems[1].text = statusBarItemTexts[3];
  } else {
    statusBarItems[0].text = statusBarItemTexts[0];
    statusBarItems[1].text = statusBarItemTexts[2];
  }

  if (!filesCheck.worspaceFolder) {
    statusBarItems[0].hide();
    statusBarItems[1].hide();
    return;
  }

  if (
    filesCheck.nodeModules &&
    (filesCheck.javascript || (filesCheck.typescript && filesCheck.tsconfig))
  ) {
    statusBarItems[0].show();
  } else {
    statusBarItems[0].hide();
  }

  if (filesCheck.typescript && filesCheck.tsconfig) {
    statusBarItems[1].show();
  } else {
    statusBarItems[1].hide();
  }

  if (currentTerminal) {
    statusBarItems[1].show();
  }
}

async function checkFiles(): Promise<{
  worspaceFolder: boolean;
  javascript: boolean;
  typescript: boolean;
  tsconfig: boolean;
  nodeModules: boolean;
}> {
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

  const nodeModulesPath = path.join(
    activeWorkspaceFolder.uri.fsPath,
    "node_modules"
  );

  const hasJsFiles = await vscode.workspace
    .findFiles(
      new vscode.RelativePattern(activeWorkspaceFolder, "**/*.js"),
      "**/node_modules/**",
      1
    )
    .then((files) => files.length > 0);
  const hasTsFiles = await vscode.workspace
    .findFiles(
      new vscode.RelativePattern(activeWorkspaceFolder, "**/*.ts"),
      "**/node_modules/**",
      1
    )
    .then((files) => files.length > 0);

  const hasTsconfig = await vscode.workspace
    .findFiles(
      new vscode.RelativePattern(activeWorkspaceFolder, "tsconfig.json"),
      "**/node_modules/**",
      1
    )
    .then((files) => files.length > 0);

  return {
    worspaceFolder: true,
    javascript: hasJsFiles,
    typescript: hasTsFiles,
    tsconfig: hasTsconfig,
    nodeModules: fs.existsSync(nodeModulesPath),
  };
}
