import * as vscode from 'vscode';
import { spawnAndReadAllOutput, execute } from '../tools/childProcessStdIO';
import { Settings } from '../settings/settings';
import { connector } from '../settings/connector';
import * as https from 'https';
import * as cp from 'child_process';

export class ConnectorController {
    
    private currentJIRA: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -1)
    private currentPR: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -2);

    private updateGitHubTooltip(num:number):void {
        this.currentPR.text = `$(git-pull-request) #${num}`;
        this.currentPR.tooltip = `Pull request #${num}`
        if (num > 0) {
            this.currentPR.command = "extension.openPullReuqest";
        }
        this.currentPR.show();
    }

    private updateJIRATooltup(id:string):void {
        this.currentJIRA.text = `$(clippy) ${id}`;
        this.currentJIRA.tooltip = `JIRA-${id}`;
        if (id && id.length > 0 ) {
            this.currentJIRA.command = "extension.openJIRA";
        }
        this.currentJIRA.show();

    }

    private updateConnector = vscode.commands.registerCommand('extension.refreshConnector', () => {
        const config = Settings.Instance.SettingOf<connector>('connector');
        const cookie : string = config.cookie;
        if (cookie && cookie.length > 0) {
            spawnAndReadAllOutput('git symbolic-ref --short HEAD', (result) => {
                const branch = result.substr(0, result.length - 1);
                const set = Settings.Instance.getBothBranchBind(branch);
                let pr = set.pr;
                if (pr > 0) {
                    this.updateGitHubTooltip(pr);
                    this.updateJIRATooltup(set.jira);
                    return;
                } else {
                    const requestOpt : https.RequestOptions = {
                        host: 'github.com',
                        path: `/TryMoka/mage/tree/${branch}`,
                        port: '443',
                        headers: {
                            cookie: cookie,
                        },
                        method: 'GET',
                    }

                    console.log("start request");
                    console.log(requestOpt);
                    this.currentPR.show();
                    this.currentPR.text = `$(git-pull-request) Loading from github..`;

                    try {
                        let page = '';
                        const req = https.request(requestOpt, (res) => {
                            console.log("requested");
                            res.on('data', (chunk) => {
                                page += chunk.toString();
                            });
                        });
                        req.on('close', () => {
                            const startIndex = page.indexOf('View #') + 6;
                            const endIndex = page.indexOf(' ', startIndex);
                            const prId = page.substring(startIndex, endIndex);
                            const cfg = vscode.workspace.getConfiguration('moka');
                            pr = Number(prId);
                            this.updateGitHubTooltip(pr);
                            Settings.Instance.saveCacheBranchBind(branch, pr);

                            loadJIRA();
                        });
                        req.on('error', (err) => {
                            console.log(err);
                        });
                        req.end();
                    } catch (e) {
                        console.log(e);
                    }
                }

                const loadJIRA = () => {
                    let jira = set.jira;
                    if (jira && jira.length > 0) {
                        this.updateJIRATooltup(jira);
                        return;
                    } else {
                        //https://jira.mokahr.com/browse/MOKA-771
                        const requestOptJIRA : https.RequestOptions = {
                            host: 'github.com',
                            path: `/TryMoka/mage/pull/${pr}`,
                            port: 443,
                            headers: {
                                cookie: cookie,
                            },
                            method: 'GET',
                        }

                        try {
                            let page = '';
                            const req = https.request(requestOptJIRA, (res) => {
                                //
                                res.on('data', (chunk) => {
                                    page += chunk.toString();
                                });
                            });
                            req.on('close', () => {
                                const startIndex = page.indexOf("/browse/") + 8;
                                const endIndex = page.indexOf("\n", startIndex);
                                jira = page.substring(startIndex, endIndex);
                                const cfg = vscode.workspace.getConfiguration("moka");
                                this.updateJIRATooltup(jira);
                                Settings.Instance.saveCacheBranchBind(branch, jira, "jira");
                            });
                            req.on('error', (err) => {
                                console.log(err);
                            });
                            req.end();
                        } catch(e) {
                            console.log(e);
                        }
                    }
                };
            });
        } else {
            vscode.window.showErrorMessage("Setting up your github cookie in settings first.")
        }
    });  
    
    private openPullRequest = vscode.commands.registerCommand('extension.openPullReuqest', () => {
        spawnAndReadAllOutput('git symbolic-ref --short HEAD', (result) => {
            const branch = result.substr(0, result.length - 1);
            const pr = Settings.Instance.getCacheBranchBind(branch);
            if (pr > 0) {
                execute(`https://github.com/TryMoka/mage/pull/${pr}`);
            } else {
                vscode.window.showErrorMessage("Please refresh your current branch");
            }
        });
    });

    private openJIRA = vscode.commands.registerCommand('extension.openJIRA', () => {
        spawnAndReadAllOutput('git symbolic-ref --short HEAD', (result) => {
            const branch = result.substr(0, result.length - 1);
            const pr : string = Settings.Instance.getCacheBranchBind(branch, 'jira');
            if (pr && pr.toString().length > 0) {
                execute(`https://jira.mokahr.com/browse/${pr}`);
            } else {
                vscode.window.showErrorMessage("Please refresh your current branch");
            }
        });
    });

    constructor(contents: { dispose(): any }[]) {
        contents.push(this.updateConnector);
    }

}