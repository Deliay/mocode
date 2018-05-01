
import * as vscode from 'vscode';
import { PaletteCompletionItemManager } from './paletteCompletion';

/**
 * [导出] 替换光标或选中的文本为指定颜色define
 */
export function replaceValue() {
    if(Palettes.size === 0) {
        vscode.window.showErrorMessage("Can't find and parse palette.styl automaticlly. Please open palette.styl and run `Moka: Parse Current`");
        return;
    }
    const editor = vscode.window.activeTextEditor;
    if(!editor) {
        vscode.window.showErrorMessage("Can't process empty document");
        return;
    }
    //如果选取为空，我们扩展一下当前单词
    if (editor.selection.isEmpty) {
        let wordPosition = editor.document.getWordRangeAtPosition(editor.selection.start);
        if(!!wordPosition && !wordPosition.isEmpty) {
            // 这里#是terminal symbol，需要向前探测一下
            const oldStartPosition = wordPosition.start;
            if (wordPosition.start.character !== 0) {
                const withSharp = new vscode.Range(new vscode.Position(oldStartPosition.line, oldStartPosition.character - 1), wordPosition.end);
                const expandValue = editor.document.getText(withSharp);
                if (expandValue.startsWith("#")) {
                    wordPosition = withSharp;
                }
            }

            editor.selection = new vscode.Selection(wordPosition.start, wordPosition.end);
        }
    }
    if (editor && (!editor.selection.isSingleLine)) {
        vscode.window.showErrorMessage("Can't input empty or more than one lines to converter");
        return;
    }
    const text = editor.document.getText(editor.selection);
    const textLowered = text.toLowerCase();
    let findText = null;
    //先对整个Settelap进行hash操作，如果有对应结果直接用了，没有indexof一下。模糊查找以后再写
    if (Settelap.has(textLowered)) {
        findText = textLowered;
    } else {
        for (const key in Settelap.keys()) {
            if (key.indexOf(textLowered) > -1) {
                findText = key;
            } 
        }
    }

    if (!findText) {
        vscode.window.showErrorMessage(`Can't find any value match "${text}"`);
        return;
    }

    vscode.window
    .showQuickPick(Settelap.get(findText).map(item => item.Name), { placeHolder: `Please pickup the define of ${text}` })
    .then((result) => {
        if(result) {
            editor
            .edit((builder) => {
                builder.replace(editor.selection, result);
            })
            .then((succ) => {
                if (!succ) {
                    vscode.window.showErrorMessage(`Error when replace text: ${result}`);
                }
            });
        }
    });
}

/**
 * 在workspace (folder)中寻找调色板文件
 */
function parsePaletteInCurrentWorkspace() {
    //如果已经parse过了，就不继续parse了。
    if(Palettes.size > 0) {
        return;
    }
    
    console.log("Parsing...");
    vscode.workspace
    .findFiles('**/palette.styl', '', 1)
    .then((result) => {
        if (result.length > 0) {
            parsePalette(result[0]);
        }
    });
    console.log("Palette parse Done.");
    isLoadPalettes = false;
}

/**
 * [导出] 清空当前palette，并重新加载
 */
export function cleanAndReParse(content?: string) {
    cleanPalette();
    if (content) {
        pickKeyValue(content);
    } else {
        parsePaletteInCurrentWorkspace();
    }
}

interface Palette {
    Name: string;
    Value: string;
}

function cleanPalette() {
    Palettes.clear();
    Settelap.clear();
}

export function getIsLoadPalettes() : boolean {
    return isLoadPalettes;
}

let isLoadPalettes = true;
export const Palettes : Map<string, string> = new Map<string, string>();
export const Settelap : Map<string, Palette[]> = new Map<string, Palette[]>();

export function getColorDefineByKey(key: string) {
    return Palettes.get(key);
}

function parsePalette(uri: vscode.Uri) {
    // parse规则
    // 键值对       ^(terminal symbols)key=value
    // 注释         (any)// *   (注: 假定不含literal value)
    //             /* until */
    vscode.workspace
    .openTextDocument(uri)
    .then((content) => pickKeyValue(content.getText()));
}
/**
 * 文法：
 *  - defs -> comment | kv
 *  - kv -> key=value
 *  - comment -> // .* $
 *  - key -> string
 *  - value -> string
 * 
 * 算了没必要这么正规，搞个正则按行来吧
 *  
 * `^\s*?(.*?)\s*?=\s*(.*?)(\/\/.*?)?$`
 * 
 * 不处理带注释的行:
 * `(?!\/\/|\/\*)`
 * 
 * 那种block的注释我就懒得适配了
 * 
 * 要适配还得认真写一个lexical analyzer和 parser
 * 
 * 此处放大
 * # 懒
 */
function pickKeyValue(texts: string) {
    const arr = texts.split("\n");
    const regex = /^\s*?(?!\/\/|\/\*)(.*?)\s*?=\s*(.*?)(\s*?\/\/.*?)?$/;
    arr.forEach((item) => {
        const result = regex.exec(item);
        if(result && result.length >= 2) {
            //全部小写处理
            const key = result[1].toLowerCase();
            const value = result[2].toLowerCase();
            const realValue = findRealValue(value);
            const paletteObject = { Name: key, Value: value };
            Palettes.set(key, value);
            if(Settelap.has(realValue)) {
                Settelap.get(realValue).push(paletteObject);
            } else {
                Settelap.set(realValue, new Array<Palette>(paletteObject));
            }
        }
    });

    PaletteCompletionItemManager.Instance.RefreshCompletion();
}

// 针对变量嵌套变量的情况
export function findRealValue(value: string) : string {
    const valueAskey = Palettes.get(value);

    if(valueAskey) { 
        return findRealValue(valueAskey);
    } else {
        return value;
    }
}
