// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const RecommendTree = require('./libs/recommendTree');
const CategoryTree = require('./libs/categoryTree');
const ToolsTree = require("./libs/toolsTree");
const SettingTree = require("./libs/settingTree");
const WipTree = require("./libs/wipTree");
const { default: axios } = require('axios');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

var webViewStorage={};
var context;
function activate(ctx) {
	context = ctx;
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ilovejuejin" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const categoryTree = new CategoryTree(context);
	vscode.window.registerTreeDataProvider("ilovejuejin_site", categoryTree);

	const settingTree = new SettingTree(context);
	vscode.window.registerTreeDataProvider("ilovejuejin_setting", settingTree);

	const wipTree = new WipTree(context);
	vscode.window.registerTreeDataProvider("ilovejuejin_wip", wipTree);
	
	const recommendTree = new RecommendTree(context);
	vscode.window.registerTreeDataProvider("ilovejuejin_recommend", recommendTree);

	const toolsTree = new ToolsTree(context);
	vscode.window.registerTreeDataProvider("ilovejuejin_tools", toolsTree);

	let openSite = vscode.commands.registerCommand('ilovejuejin.openSite', openInWebview);
	context.subscriptions.push(openSite);

	let refreshRecommendUsers = vscode.commands.registerCommand('ilovejuejin.refreshRecommendUsers', function () {
		console.log('refresh');
		recommendTree.refresh();
		vscode.window.registerTreeDataProvider("ilovejuejin_recommend", recommendTree);
	});
	context.subscriptions.push(refreshRecommendUsers);

	let addTools = vscode.commands.registerCommand('ilovejuejin.addTools', function () {
		console.log('addTools');
		vscode.env.openExternal("https://github.com/ezshine/ilovejuejin-tools");
	});
	context.subscriptions.push(addTools);
}

function openInWebview(params) {
	// The code you place here will be executed every time your command is executed
	// console.log('ilovejuejin.openSite:' + JSON.stringify(params));
	// Display a message box to the user

	var view = params.view||"default";
	var target = params.target||view;

	if(!webViewStorage[target])webViewStorage[target]={};

	var webViewPanel = webViewStorage[target].panel;
	if(!webViewPanel){
		webViewPanel = vscode.window.createWebviewPanel(
			'webview', // viewType
			'', // 视图标题
			vscode.ViewColumn.One,
			{
				enableFindWidget:true,
				enableCommandUris: true,
				enableScripts: true, // 启用JS，默认禁用
				retainContextWhenHidden: true // webview被隐藏时保持状态，避免被重置
			}
		);
		webViewPanel.onDidDispose(function(){
			console.log("webview diposed");
			delete webViewStorage[target];
		});
		webViewPanel.webview.onDidReceiveMessage(
			message => {
				console.log("webview onDidReceiveMessage：",JSON.stringify(message));
				switch (message.command) {
					case 'alert':
						vscode.window.showInformationMessage(message.text);
						break;
					case 'log':
						console.log(message.text);
						break;
					case 'openExternal':
						vscode.env.openExternal(message.url);
						break;
					case 'openInWebview':
						openInWebview(message);
						break;
					case 'request':
						console.log("ready to request from weview");
						console.log(message.params);
						axios.request({
							url:message.params.url,
							method:message.params.method||'GET',
							data:message.params.data
						}).then((res)=>{
							console.log(res);
							webViewPanel.webview.postMessage({ command: 'onRequestSuccess' , data:res.data });
						}).catch((err)=>{
							console.log(err);
							webViewPanel.webview.postMessage({ command: 'onRequestFail' , data:err });
						});
						break;
				}
			},
			undefined,
			context.subscriptions
		);

		webViewStorage[target]={panel:webViewPanel};
	}
	webViewPanel.title = params.title||"掘金";

	webViewPanel.iconPath = vscode.Uri.file(path.join(__dirname,"resources",params.icon||"icon_default.svg"));

	if(params.url!=webViewStorage[target].url){
		webViewStorage[target].url = params.url;
		webViewPanel.webview.html = getWebViewContent(context, 'views/'+view+'.html');
		webViewPanel.webview.postMessage({ command: 'load' , params:params });
		if(params.alert)webViewPanel.webview.postMessage({ command: 'alert' , params:{text:params.alert} });
	}

	webViewPanel.reveal();
}

function getWebViewContent(context, templatePath) {
	const resourcePath = path.join(context.extensionPath, templatePath);
	const dirPath = path.dirname(resourcePath);
	let html = fs.readFileSync(resourcePath, 'utf-8');
    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
		if($2.indexOf("https://")<0)return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
		else return $1 + $2+'"';
	});
	return html;
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
