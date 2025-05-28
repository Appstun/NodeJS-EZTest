import { FileManager } from "./fileManager";
import { Json, JsonDB } from "./jsonManager";

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
}

type LaunchOptions = {
  indexFile: string;
  runtimeCommand: string;
  compileCommand: string;
};
export namespace LaunchConfig {
  const defaultOptions: LaunchOptions = {
    indexFile: ".",
    runtimeCommand: "node",
    compileCommand: "tsc",
  };

  export async function getOptions() {
    let workspace = FileManager.getWorkspaceFolderPath();
    if (!workspace) {
      return defaultOptions;
    }

    await JsonDB.dataBases.lauConf.reload();
    let data = await JsonDB.getValue<undefined, Partial<LaunchOptions>>(JsonDB.dataBases.lauConf, "/eztest", undefined);

    if (!data) {
      JsonDB.setValue(JsonDB.dataBases.lauConf, "/eztest", defaultOptions);
      return defaultOptions;
    }

    for (const key of Object.keys(defaultOptions) as (keyof LaunchOptions)[]) {
      if (data[key] === undefined) {
        data[key] = defaultOptions[key];
      }
      data[key] = data[key].replace(/\$\{workspaceFolder\}/g, workspace || ".");
      data[key] = data[key].replace(/\$\{cwd\}/g, workspace || ".");
    }

    return data as LaunchOptions;
  }
}
