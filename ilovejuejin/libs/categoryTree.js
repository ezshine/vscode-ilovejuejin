const vscode = require('vscode');
const os = require('os');
const path = require('path');
const axios = require("axios");

class CategoryTree {
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

        var r_cates = [
            {
                title:"首页",
                icon:"icon_home.svg",
                url:"https://juejin.cn"
            },
            {
                title:"沸点",
                icon:"icon_tweet.svg",
                url:"https://juejin.cn/pins"
            },
            {
                title:"小册",
                icon:"icon_book.svg",
                url:"https://juejin.cn/books"
            },
            {
                title:"活动",
                icon:"icon_calendar.svg",
                url:"https://juejin.cn/events"
            },
            {
                title:"群聊(beta)",
                icon:"icon_chat.svg",
                url:"http://kedou.workerman.net/"
            }
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
    deleteRom(item){
        
    }
    rename(item){
		
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

module.exports = CategoryTree;