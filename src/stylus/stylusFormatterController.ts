import * as vscode from "vscode";

export class StylusFormatterController {

    private removeSymbol_via_Command = vscode.commands.registerCommand("extension.formatStylus", () => {
        const editor = vscode.window.activeTextEditor;
        const selection = editor.selection;
        const selText = editor.document.getText(selection);
        const regex = /^(\s*?)([a-z]+?(-[a-z]+?)*?)(:|\s)+(.*?);?$/;
        const newValue = selText.split("\n").map(line => {
            const result = regex.exec(line);
            return result ? `${result[1]}${result[2]} ${result[5]}` : line;
        }).join("\n");
        editor.edit((builder) => {
            builder.replace(selection, newValue);
        })
        .then((succ) => {
            if (!succ) {
                vscode.window.showErrorMessage("Can't format selection texts");
            }
        });
    });

    constructor(content: { dispose(): any }[]) {
        content.push(this.removeSymbol_via_Command);
    }
}

