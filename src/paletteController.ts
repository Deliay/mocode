import * as vscode from 'vscode';
import * as paletteServices from './paletteServices';

export class PaletteContoller {

    private disposable_replace = vscode.commands.registerCommand('extension.findMokaUIColor', () => {
        if (paletteServices.getIsLoadPalettes()) {
            vscode.window.showErrorMessage("Palette was not loaded, please try agin later");
            return;
        }
        paletteServices.replaceValue();
    });
    
    private disposable_parseMokaUIPalette = vscode.commands.registerCommand('extension.parseMokaUIPalette', () => {
        paletteServices.cleanAndReParse(vscode.window.activeTextEditor.document.getText());
    });
    
    private disposable_reload = vscode.commands.registerCommand('extension.reloadPalette', () => {
        paletteServices.cleanAndReParse();
    });
    
    ///palette.styl
    //when change workspace auto parse the palette.styl
    private disposable_initial = vscode.workspace.onDidChangeWorkspaceFolders((ev) => {
        paletteServices.cleanAndReParse();
    });
    
    private paletteContollers = [ this.disposable_replace, this.disposable_parseMokaUIPalette, this.disposable_reload, this.disposable_initial];

    constructor(contents: { dispose(): any }[]) {
        paletteServices.cleanAndReParse();
        contents.push(...this.paletteContollers);
    }
}