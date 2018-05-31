import { exec, ExecOptions } from "child_process";
import * as vscode from 'vscode';

export function spawnAndReadAllOutput(cmd: string, callback: (result: string) => void) {
    const option : ExecOptions = {
        cwd: vscode.workspace.workspaceFolders[0].uri.fsPath,
    }
    exec(cmd, option, (stderr, stdout) => {
        callback(stdout);
    });
}

export function execute(command: string) {
    let cmd = "start";
    if (process.platform.toString() === 'wind32') {
        cmd = 'start';
    } else if (process.platform == 'linux') {
        cmd = 'xdg-open';
    } else if (process.platform == 'darwin') {
        cmd = 'open';
    }
    exec(`${cmd} ${command}`);
}
