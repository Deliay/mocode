'use strict';
import * as vscode from 'vscode';
import { PaletteContoller } from './palette/paletteController';

export function activate(context: vscode.ExtensionContext) {
    const paletteController = new PaletteContoller(context.subscriptions);
}

// this method is called when your extension is deactivated
export function deactivate() {
}