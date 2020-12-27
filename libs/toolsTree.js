const vscode = require('vscode');
const os = require('os');
const path = require('path');
const axios = require("axios");

var lastTimestamp;
var r_tools;
class ToolsTree {
    constructor(context){
        this.context = context;
        this.userRoot = os.homedir();
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh(){
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element){
        return element;
    }
    async getChildren(element) {
        var timestamp = new Date().getTime();
        if(!lastTimestamp||timestamp-lastTimestamp>3600000){
            lastTimestamp=timestamp;
            const res = await axios.get("http://www.rainbow1024.com/ilovejuejin/tools.json");
            r_tools = res.data;
        }else{
            console.log("use cached recommend users");
        }
        if(!r_tools)r_tools=[];
        var a_length = r_tools.length;
        var fin_items = [];
        
        for(var i = 0;i<a_length;i++){
            var item = r_tools[i];
            item.view = "tool";
            fin_items.push(
                new DataItem(
                    item.title,
                    item.description,
                    {
                        command:"ilovejuejin.openSite",title:"",arguments:[item]
                    }
                )
            );
        }

        return fin_items;
    }
}

class DataItem extends vscode.TreeItem{
    constructor(label, tooltip, command) {
        super(label,  vscode.TreeItemCollapsibleState.None);
        this.tooltip = tooltip;
        this.iconPath = path.join(__filename,'../../','resources', 'icon_tool.svg');
        this.command = command;
    }
}

module.exports = ToolsTree;