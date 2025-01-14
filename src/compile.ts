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
}
