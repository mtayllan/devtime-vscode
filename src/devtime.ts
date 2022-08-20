import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { Memento } from 'vscode';

type Hit = {
  project?: string,
  language?: string,
  timestamp?: string
};

let lastHit:Hit = { };
let lastFileName = '';

const API_TOKEN_KEY = '@devtime/api_key';
const HOST_URL_KEY = '@devtime/host_url';

export const initialize = (globalState: Memento) => {
  const sendHitWithState = sendHit(globalState);
  vscode.window.onDidChangeTextEditorSelection(sendHitWithState);
  vscode.window.onDidChangeActiveTextEditor(sendHitWithState);
  vscode.workspace.onDidSaveTextDocument(sendHitWithState);
};

export const dispose = () => {};

export const disposable = { dispose: dispose };

const sendHit = (globalState: Memento) => () => {
  const apiToken:string = globalState.get(API_TOKEN_KEY) || '';
  const hostUrl:string = globalState.get(HOST_URL_KEY) || '';
  if (!apiToken || !hostUrl) { return; }

  const project = vscode.workspace.name;
  const language = vscode.window.activeTextEditor?.document.languageId;
  const date = new Date();
  const fileName = vscode.window.activeTextEditor?.document.fileName || '';
  date.setMilliseconds(0);
  const timestamp = date.toISOString();
  const hit:Hit = { project, language, timestamp };
  const lastHitDate = lastHit.timestamp && new Date(lastHit.timestamp);

  if (project && language && !areHitsEqual(hit, lastHit) && (fileName !== lastFileName || (lastHitDate && date.getTime() - lastHitDate.getTime() > 60_000))) {
    lastHit = hit;
    lastFileName = fileName;
    fetch(`${hostUrl}/api/hits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-extension-api-token': apiToken
      },
      body: JSON.stringify({ hit: { project, language, timestamp } })
    });
  }
};

const areHitsEqual = (hit1:Hit, hit2:Hit) => {
  if (hit1.language !== hit2.language) {return false;}
  if (hit1.project !== hit2.project) {return false;}
  if (hit1.timestamp !== hit2.timestamp) {return false;}
  return true;
};

export const registerApiKey = (globalState: Memento) => {
  vscode.window.showInputBox({ prompt: 'Paste your API Token'}).then(inputValue => {
    if (inputValue) {
      globalState.update(API_TOKEN_KEY, inputValue);
    }
  });
};

export const registerHost = (globalState: Memento) => {
  vscode.window.showInputBox({ prompt: 'Type the url of the host you are using'}).then(inputValue => {
    if (inputValue) {
      globalState.update(HOST_URL_KEY, inputValue);
    }
  });
};

