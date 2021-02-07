const vscode = require('vscode');
const os = require('os');
const path = require('path');
const axios = require("axios");

class WipTree {
    constructor(context){
        this.context = context;
        this.userRoot = os.homedir();
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getTreeItem(element){
        return element;
    }
    async getChildren(element) {

        var r_cates = [
            {
                title:"解压游戏",
                icon:"icon_game.svg",
                url:"",
                view:"game",
                target:"game"
            },
        ];
        var a_length = r_cates.length;

        var fin_items = [];
        for(var i = 0;i<a_length;i++){
            var item = r_cates[i];
            fin_items.push(
                new DataItem(
                    item.title,
                    item.icon,
                    "",
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
    constructor(label, icon, tooltip, command) {
        super(label,  vscode.TreeItemCollapsibleState.None);
        this.tooltip = tooltip;
        this.iconPath = path.join(__filename,'../../','resources', icon);
        this.command = command;
    }
}

module.exports = WipTree;