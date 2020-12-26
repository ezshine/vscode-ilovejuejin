const vscode = acquireVsCodeApi();
function log(str){
    vscode.postMessage({
        command: 'log',
        text: str
    })
}
function openExternal(url){
    vscode.postMessage({
        command: 'openExternal',
        url: url
    })
}
function openInWebview(url,view){
    vscode.postMessage({
        command: 'openInWebview',
        url: url,
        view:view
    })
}

function request(params){
    function onMessage(event){
        const message = event.data;
        if(message.command=="onRequestSuccess"){
            if(params.success)params.success(message.data);
        }else if(message.command=="onRequestFail"){
            if(params.fail)params.fail(message.data);
        }
        window.removeEventListener('message',onMessage);
    }
    window.addEventListener('message',onMessage);
    vscode.postMessage({
        command: 'request',
        params: {
            url:params.url,
            data:params.data,
            method:params.method
        }
    })
}

function getTimeUntilNow(time) {
    var now = new Date();
    var date3 = now.getTime() - time*1000;
    var days = Math.floor(date3 / (24 * 3600 * 1000));
  
    //计算出小时数  
    var leave1 = date3 % (24 * 3600 * 1000);    //计算天数后剩余的毫秒数  
    var hours = Math.abs(Math.floor(leave1 / (3600 * 1000)));
    //计算相差分钟数  
    var leave2 = leave1 % (3600 * 1000);        //计算小时数后剩余的毫秒数  
    var minutes = Math.floor(leave2 / (60 * 1000))
    //计算相差秒数  
    var leave3 = leave2 % (60 * 1000);      //计算分钟数后剩余的毫秒数  
    var seconds = Math.round(leave3 / 1000);
  
    if (days > 0) {
      if (days / 365 >= 1) {
        return Math.floor(days / 365) + "年前";
      } else {
        return days + "天前";
      }
    } else {
      if (hours > 0) {
        return hours + "小时前";
      } else {
        if (minutes <= 3) {
          return "刚刚";
        } else {
          return minutes + "分钟前";
        }
      }
    }
  
    return "刚刚";
  }