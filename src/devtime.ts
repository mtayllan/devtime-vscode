import * as vscode from 'vscode';
import { HOST } from './constants';
import fetch from 'node-fetch';

type Hit = {
  project?: string,
  language?: string,
  timestamp?: string
};

let lastHit:Hit = { };

export const initialize = () => {
  vscode.window.onDidChangeTextEditorSelection(sendHit);
  vscode.window.onDidChangeActiveTextEditor(sendHit);
  vscode.workspace.onDidSaveTextDocument(sendHit);
};

export const dispose = () => {};

export const disposable = { dispose: dispose };

const sendHit = () => {
  const project = vscode.workspace.name;
  const language = vscode.window.activeTextEditor?.document.languageId;
  const date = new Date();
  date.setMilliseconds(0);
  const timestamp = date.toISOString();
  const hit:Hit = { project, language, timestamp };

  if (project && language && !isHitsEqual(hit, lastHit)) {
    lastHit = hit;
    console.log('sending');
    fetch(`${HOST}/hits.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hit: { project, language, timestamp } })
    });
  }
};

const _sendHit = async (
  language: string,
  project: string
) => {
  fetch(`${HOST}/hits`);
};

const isHitsEqual = (hit1:Hit, hit2:Hit) => {
  if (hit1.language !== hit2.language) {return false;}
  if (hit1.project !== hit2.project) {return false;}
  if (hit1.timestamp !== hit2.timestamp) {return false;}
  return true;
};


