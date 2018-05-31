'use strict';
import * as vscode from 'vscode';
import { PaletteContoller } from './palette/paletteController';
import { StylusFormatterController } from './stylus/stylusFormatterController';
import { ConnectorController } from './connector/connectorController';

export function activate(context: vscode.ExtensionContext) {
    const paletteController = new PaletteContoller(context.subscriptions);
    const stylusFormatterContoller = new StylusFormatterController(context.subscriptions);
    const connectorController = new ConnectorController(context.subscriptions);
}

// this method is called when your extension is deactivated
export function deactivate() {
}