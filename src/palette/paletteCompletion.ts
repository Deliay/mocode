import * as vscode from "vscode";
import * as paletteServices from "./paletteServices";

export class PaletteCompletionItemManager {
    public static Instance : PaletteCompletionItemManager = new PaletteCompletionItemManager();
    private constructor() {

    }
    private completions : vscode.CompletionItem[] = [];
    //Auto refresh when palette reprased.
    public RefreshCompletion() {
        this.completions = [];
        for (const [key, sets] of paletteServices.Settelap) {
            sets.forEach(define => {
                const realValue = paletteServices.findRealValue(define.Value);
                const completion = new vscode.CompletionItem(`${define.Name} (${realValue})`, vscode.CompletionItemKind.Value);
                completion.insertText = define.Name;
                completion.sortText = realValue;
                completion.filterText = realValue;
                this.completions.push(completion);
            });
        }
        console.log("Completion loaded");
        
    }

    public GetCompletionList() {
        return [...this.completions];
    }

    public RaiseCompletionBySearch(keyword: string) : vscode.CompletionItem[] {
        return this.completions.filter((item) => item.filterText.indexOf(keyword) > -1);
    }
}

export class PaletteCompletion implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        const range = document.getWordRangeAtPosition(position);
        const currentWord = document.getText(range).trim();

        return PaletteCompletionItemManager.Instance.RaiseCompletionBySearch(currentWord);
    }
    resolveCompletionItem?(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.CompletionItem> {
        return item;
    }
}