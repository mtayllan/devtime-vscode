// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as devtime  from './devtime';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'devtime-vscode.register_api_key',
      () => devtime.registerApiKey(context.globalState)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'devtime-vscode.register_host',
      () => devtime.registerHost(context.globalState)
    )
  );

  context.subscriptions.push(devtime.disposable);

  devtime.initialize(context.globalState);

}

// this method is called when your extension is deactivated
export function deactivate() {
  devtime.disposable.dispose();
}
