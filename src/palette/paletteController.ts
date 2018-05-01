import * as vscode from 'vscode';
import * as paletteServices from './paletteServices';
import { PaletteHover } from './paletteHover';

export class PaletteContoller {

    private replace = vscode.commands.registerCommand('extension.findMokaUIColor', () => {
        if (paletteServices.getIsLoadPalettes()) {
            vscode.window.showErrorMessage("Palette was not loaded, please try agin later");
            return;
        }
        paletteServices.replaceValue();
    });
    
    private parseMokaUIPalette = vscode.commands.registerCommand('extension.parseMokaUIPalette', () => {
        paletteServices.cleanAndReParse(vscode.window.activeTextEditor.document.getText());
    });
    
    private reload = vscode.commands.registerCommand('extension.reloadPalette', () => {
        paletteServices.cleanAndReParse();
    });
    
    ///palette.styl
    //when change workspace auto parse the palette.styl
    private initial = vscode.workspace.onDidChangeWorkspaceFolders((ev) => {
        paletteServices.cleanAndReParse();
    });

    private STYLUS_FILES : vscode.DocumentFilter = { pattern: "**/*.styl" };

    private documentHover = vscode.languages.registerHoverProvider(this.STYLUS_FILES, new PaletteHover());
    
    private paletteContollers = [ 
        this.replace, 
        this.parseMokaUIPalette, 
        this.reload, 
        this.initial,
        this.documentHover,
    ];

    constructor(contents: { dispose(): any }[]) {
        paletteServices.cleanAndReParse();
        contents.push(...this.paletteContollers);
    }
}