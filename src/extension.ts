'use strict';
import * as vscode from 'vscode';
import { PaletteContoller } from './palette/paletteController';
import { StylusFormatterController } from './stylus/stylusFormatterController';

export function activate(context: vscode.ExtensionContext) {
    const paletteController = new PaletteContoller(context.subscriptions);
    const stylusFormatterContoller = new StylusFormatterController(context.subscriptions);
}

// this method is called when your extension is deactivated
export function deactivate() {
}