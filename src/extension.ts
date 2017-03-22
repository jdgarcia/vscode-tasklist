'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

class TasklistDocumentContentProvider implements vscode.TextDocumentContentProvider {

    todo: string[];
    complete: string[];

    constructor() {
        this.todo = [];
        this.complete = [];
    }

    getTodoItems(): string {
        return '<div>nothing...</div>';
    }

    getCompletedItems(): string {
        return '<div>nothing...</div>';
    }

    provideTextDocumentContent2(uri: vscode.Uri, token: vscode.CancellationToken): string {
        console.log('i am being called', uri);
        var enc = encodeURI('command:extension.test1');
        return `
            <input />
            <button onclick="console.log(vscode)">Add</button>
            <div>Todo</div>
            ${this.getTodoItems()}
            <div>Complete</div>
            ${this.getCompletedItems()}
            <script>
                var a = document.createElement('a');
                a.textContent = 'test link';
                a.href = '${enc}';
                document.body.appendChild(a);
                console.log('!', localStorage.getItem('test'));
                localStorage.setItem('test', 'woo');
                console.log('!!', localStorage.getItem('test'));
            </script>
        `;
    }

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): string {
        var testPath = path.join(__dirname, 'test.js');
        var testCss = path.join(__dirname, '..', '..', 'src', 'styles.css');

        return `
            <head>
                <link rel="stylesheet" href="${vscode.Uri.file(testCss)}" />
                <script src="https://unpkg.com/react@15/dist/react.min.js"></script>
                <script src="https://unpkg.com/react-dom@15/dist/react-dom.min.js"></script>
            </head>
            <body>
                <div id="tasklist"></div>
                <script src="${vscode.Uri.file(testPath)}"></script>
            </body>
        `;
    }

}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "tasklist" is now active!');




    const registration = vscode.workspace.registerTextDocumentContentProvider('jdgarcia-tasklist', new TasklistDocumentContentProvider());

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!');

        vscode.commands.executeCommand(
            'vscode.previewHtml',
            vscode.Uri.parse('jdgarcia-tasklist://tasklist'),
            undefined,
            'Tasklist Test'
        );

        // vscode.workspace.openTextDocument(vscode.Uri.parse('jdgarcia-tasklist://tasklist'))
        //     .then((document: vscode.TextDocument) => {
        //         console.log(document);
        //     });
    });

    context.subscriptions.push(disposable);

    context.subscriptions.push(vscode.commands.registerCommand('extension.test1', () => {
        vscode.window.showInformationMessage('command successful!');
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}