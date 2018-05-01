import * as vscode from "vscode";
import { getColorDefineByKey } from "./paletteServices";

export class PaletteHover implements vscode.HoverProvider {
    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        const wordRange = document.getWordRangeAtPosition(position);
        const value = getColorDefineByKey(document.getText(wordRange));

        if (value) { 
            return new vscode.Hover(`[Color Alias] ${value}`);
        } else {
            return null;
        }
    }
}