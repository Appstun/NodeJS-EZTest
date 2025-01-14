export namespace Config {
  export const commandNames = {
    startStop: "nodejs-eztest.start_stop",
    tscRestart: "nodejs-eztest.tsc_restart",
  };
  export const statusbarItemTexts = {
    startTest: {
      symbole: "terminal",
      text: "start Testing",
    },
    restartTest: {
      symbole: "refresh",
      text: "restart Testing",
    },
    stopTest: {
      symbole: "stop",
      text: "stop Testing",
    },
    compileTs: {
      symbole: "symbol-keyword",
      text: "compile TS",
    },
  };
  export const terminalCommands = {
    compileTs: "tsc",
    startNode: "node .",
  };
}
