import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
export interface SettingsBase {};

export class Settings {
    public static readonly Instance: Settings = new Settings();
    private settings: vscode.WorkspaceConfiguration = null;
    private settingsChangeNotify: (() => void)[] = [];
    private branchCachePath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, ".vscode", "branchcache.json");

    private constructor() {
        this.loadSettings();
        vscode.workspace.onDidChangeConfiguration((ev) => {
            this.loadSettings();
            this.settingsChangeNotify.forEach(element => {
                element();
            });
        });
        if (!fs.existsSync(this.branchCachePath)) {
            fs.writeFileSync(this.branchCachePath, `{"pr":{},"jira":{}}`, "utf8");
        }
    }
    
    private loadSettings() {
        this.settings = vscode.workspace.getConfiguration('moka', vscode.workspace.workspaceFolders[0].uri);
    }

    public RegisterSettingChangeNotify(callback: () => void) {
        this.settingsChangeNotify.push(callback);
    }
    
    public SettingOf<T extends SettingsBase>(section: string) : T {
        return this.settings[section];
    }

    public getCacheBranchBind(key : string, opt = "pr") {
        const result : string = fs.readFileSync(this.branchCachePath, 'utf8');
        return (JSON.parse(result) || {pr:{}, jira:{}})[opt][key];
    }

    public getBothBranchBind(key : string) : {pr:number, jira:string} {
        const result : string = fs.readFileSync(this.branchCachePath, 'utf8');
        const obj = JSON.parse(result) || {pr:{}, jira:{}};
        return {pr: Number(obj["pr"][key]), jira: obj["jira"][key]};
    }

    public saveCacheBranchBind(branch : string, pr: number | string, opt = "pr") :void {
        const result : string = fs.readFileSync(this.branchCachePath, 'utf8');
        const cache = JSON.parse(result) || {};
        cache[opt][branch] = pr;
        fs.writeFileSync(this.branchCachePath, JSON.stringify(cache), 'utf8');
    }

}