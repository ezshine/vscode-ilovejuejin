// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const RecommendTree = require('./libs/recommendTree');
const CategoryTree = require('./libs/categoryTree');
const ToolsTree = require("./libs/toolsTree");
const SettingTree = require("./libs/settingTree");
const { default: axios } = require('axios');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */

var webViewStorage={};
function activate(context) {

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
	
	const recommendTree = new RecommendTree(context);
	vscode.window.registerTreeDataProvider("ilovejuejin_recommend", recommendTree);

	const toolsTree = new ToolsTree(context);
	vscode.window.registerTreeDataProvider("ilovejuejin_tools", toolsTree);

	let openSite = vscode.commands.registerCommand('ilovejuejin.openSite', function (params) {
		// The code you place here will be executed every time your command is executed
		// console.log('ilovejuejin.openSite:' + JSON.stringify(params));
		// Display a message box to the user

		var view = params.view||"juejin";

		if(!webViewStorage[view])webViewStorage[view]={};

		var webViewPanel = webViewStorage[view].panel;
		if(!webViewPanel){
			webViewPanel = vscode.window.createWebviewPanel(
				'webview', // viewType
				params.title, // 视图标题
				vscode.ViewColumn.One,
				{
					enableScripts: true, // 启用JS，默认禁用
					retainContextWhenHidden: true // webview被隐藏时保持状态，避免被重置
				}
			);
			webViewPanel.onDidDispose(function(){
				console.log("webview diposed");
				delete webViewStorage[view];
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
					}
				},
				undefined,
				context.subscriptions
			);

			webViewStorage[view]={panel:webViewPanel,url:params.url};
		}
		webViewStorage[view].url = params.url;
		webViewPanel.title = params.title;
		webViewPanel.iconPath = vscode.Uri.file(path.join(__dirname,"resources","icon_"+view+".svg"));

		webViewPanel.webview.html = getWebViewContent(context, 'views/'+view+'.html');
		webViewPanel.activate = true;

		if(view=="tool"&&!params.user_info){
			console.log("request user_info",params.recommendby);
			axios.get("https://api.juejin.cn/user_api/v1/user/get?user_id="+params.recommendby+"&not_self=1").then(function(res){
				params.user_info = res.data.data;
				webViewPanel.webview.postMessage({ command: 'load' , params:params });
			});
		}else{
			webViewPanel.webview.postMessage({ command: 'load' , params:params });
		}
	});
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

	context.subscriptions.push(refreshRecommendUsers);
}

function getWebViewContent(context, templatePath) {
	const resourcePath = path.join(context.extensionPath, templatePath);
	const dirPath = path.dirname(resourcePath);
	let html = fs.readFileSync(resourcePath, 'utf-8');
	// vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
    html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m, $1, $2) => {
		return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
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
