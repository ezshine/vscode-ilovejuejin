const vscode = require('vscode');
const os = require('os');
const path = require('path');
const axios = require("axios");

var lastTimestamp;
var r_users;
class RecommendTree {
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
            const res = await axios.get("https://apinew.juejin.im/user_api/v1/author/recommend?category_id=&cursor=0&limit=100");
            r_users = res.data.data;
        }else{
            console.log("use cached recommend users");
        }
        if(!r_users)r_users=[];
        r_users.sort(function() {
            return .5 - Math.random();
        });
        var a_length = 10;
        var fin_items = [];
        var dashuaiFound = false;
        for(var i = 0;i<a_length;i++){
            var item = r_users[i];
            if(item.user_id=="2955079655898093")dashuaiFound=true;
            fin_items.push(
                new DataItem(
                    item.user_name,
                    new vscode.MarkdownString(
                        item.description+"\r\n\r\n"+
                        "----"+"\r\n"+
                        "- 掘金等级：Lv."+item.level+"\r\n"+
                        "- 总计获赞："+item.got_digg_count+"\r\n"+
                        "- 总计阅读："+item.got_view_count+"\r\n"
                        ),
                    {
                        command:"ilovejuejin.openSite",title:"",arguments:[{url:"https://juejin.cn/user/"+item.user_id,title:item.user_name}]
                    }
                )
            );
        }

        /*
        2020平安夜干到凌晨两点，就在写这个插件。把自己加到推荐列表里不过分吧？
        https://juejin.cn/user/2955079655898093
        */

        if(!dashuaiFound)fin_items[Math.floor(Math.random()*a_length)]=new DataItem(
            "大帅搞全栈",
            "",
            {
                command:"ilovejuejin.openSite",title:"",arguments:[{url:"https://juejin.cn/user/2955079655898093",title:"大帅搞全栈"}]
            }
        );

        return fin_items;
    }
}

class DataItem extends vscode.TreeItem{
    constructor(label, tooltip, command) {
        super(label,  vscode.TreeItemCollapsibleState.None);
        this.tooltip = tooltip;
        this.iconPath = path.join(__filename,'../../','resources', 'icon_user.svg');
        command.arguments[0].alert = "该页可直接关注作者，点赞，评论<br><span style='font-size:16px;color:#333;'>点击无效时请按住cmd或ctrl键重试</span>";
        this.command = command;
    }
}

module.exports = RecommendTree;