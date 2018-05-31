import * as vscode from "vscode";
import { Settings } from "../settings/settings";
import { jenkins } from "../settings/jenkins";
import { execSync, spawn } from "child_process";
import { spawnAndReadAllOutput } from "../tools/childProcessStdIO";

export class MokaJenkinsController {

    private jkSettings: jenkins = null;
    private enable: boolean = false;
    private CONST_JK_ARGS = {
        JK_CHECK: "i",
    };
    private readonly CONST_JK_FLAG = "moka_jenkins_flag";
    constructor(content: { dispose(): any }[]) {
        //此处先检查jk工具是否存在
        Settings.Instance.RegisterSettingChangeNotify(this.onSettingChange);
        this.onSettingChange();
    }

    private onSettingChange() {
        this.jkSettings = Settings.Instance.SettingOf<jenkins>("jenkins");
    }

    private jkSpawn(args: string, callback: (result: string) => void = () => {}) {
        spawnAndReadAllOutput(`${this.jkSettings.toolAlias} ${args}`, callback);
    }

    private checkJKVersion() {
        this.jkSpawn(this.CONST_JK_ARGS.JK_CHECK, (result) => {
            if (result === this.CONST_JK_FLAG) {
                this.enable = true;
            }
        });
    }
}