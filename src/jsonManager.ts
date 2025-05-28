import * as fs from "fs";
import { JsonDB as NodeJsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";
import * as path from "path";
import { FileManager } from "./fileManager";

export namespace JsonDB {
  export let createValueOnGetWhenNotExists: Boolean = false;
  let files = [
    path.join(FileManager.getWorkspaceFolderPath() || ".", `/.vscode/launch`),
    //"<Pfad der Datei (OHNE Dateinamenerweiterung (z.B. ".json"))>",
  ];
  for (let file of files) checkJsonFile(`${file}.json`);

  export const dataBases = {
    lauConf: new NodeJsonDB(new Config(files[0], true, false, "/")),
    //<Name>: new NodeJsonDB(new Config(files[<Nummer>], true, false, "/")),
  } as const;

  export async function valueExists(database: (typeof dataBases)[keyof typeof dataBases], path: string) {
    path = correctPath(path);
    if (await database.exists(path)) return true;
    return false;
  }

  export async function setValue(database: (typeof dataBases)[keyof typeof dataBases], path: string, value: any) {
    let completed = false;
    path = correctPath(path);
    try {
      await database.push(path, value);
      completed = true;
    } catch (error) {
      completed = false;
    }
    return completed;
  }

  export async function deleteValue(database: (typeof dataBases)[keyof typeof dataBases], path: string) {
    let completed = false;
    path = correctPath(path);
    try {
      await database.delete(path);
      completed = true;
    } catch (error) {
      completed = false;
    }
    return completed;
  }

  export async function getValue<D, T = any>(database: (typeof dataBases)[keyof typeof dataBases], path: string, def: D): Promise<D | T> {
    let value = def;
    path = correctPath(path);
    if (!(await database.exists(path))) {
      if (createValueOnGetWhenNotExists) await database.push(path, def);
      return def;
    }

    try {
      value = await database.getData(path);
    } catch (error) {
      if (createValueOnGetWhenNotExists) await database.push(path, def);
      value = def;
    }
    return value;
  }

  export async function getKeys(database: (typeof dataBases)[keyof typeof dataBases], path: string) {
    let value: string[] = [];
    path = correctPath(path);
    if (!(await database.exists(path))) return [];
    try {
      value = Object.keys(await database.getData(path));
    } catch (error) {
      value = [];
    }
    return value;
  }
}

export class Json {
  private jsonObject;

  constructor(json: string | object | null = null) {
    if (json == null) this.jsonObject = {};
    else if (typeof json == "string") {
      try {
        this.jsonObject = JSON.parse(json);
      } catch (error) {
        throw new Error("Invalid JSON string");
      }
    } else this.jsonObject = json;
  }

  private getPathSegments(path: string): string[] {
    return path.split("/").filter((segment) => segment.length > 0);
  }

  setValue(path: string, value: any) {
    const segments = this.getPathSegments(path);
    let current = this.jsonObject;

    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      if (!(segment in current)) current[segment] = {};
      current = current[segment];
    }
    current[segments[segments.length - 1]] = value;
  }

  getValue<D, T = any>(path: string, def: D): D | T {
    const segments = this.getPathSegments(path);
    let current = this.jsonObject;

    for (let segment of segments) {
      if (!(segment in current)) return def;
      current = current[segment];
    }
    return current;
  }

  getKeys(path: string): string[] {
    const value = this.getValue(path, null);
    if (value && typeof value == "object" && !Array.isArray(value)) return Object.keys(value);
    return [];
  }

  valueExists(path: string): boolean {
    return this.getValue(path, undefined) != undefined;
  }

  deleteValue(path: string) {
    const segments = this.getPathSegments(path);
    let current = this.jsonObject;

    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      if (!(segment in current)) return;
      current = current[segment];
    }

    delete current[segments[segments.length - 1]];
  }

  getAsJson() {
    return this.jsonObject;
  }

  getAsString() {
    return JSON.stringify(this.jsonObject);
  }
}

function correctPath(path: string) {
  path = path.replace(".", "/");
  if (!path.startsWith("/")) path = "/" + path;
  return path;
}
function checkJsonFile(filePath: string) {
  if (!fs.existsSync(path.dirname(filePath))) return;
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "{}");
  try {
    if (fs.readFileSync(filePath).length == 0) fs.writeFileSync(filePath, "{}");
  } catch (error) {}
}
