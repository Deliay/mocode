import { SettingsBase } from "./settings";

export interface jenkins extends SettingsBase {
    userName: string,
    password: string,
    autoRefresh: boolean,
    refreshInterval: number,
    toolAlias: string,
}