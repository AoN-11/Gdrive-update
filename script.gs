const DIR_ID = ""; //folder_id
const INTERVAL_MINUTE = 30;
const BASE_LINK = ""; //path
const post_url = ""; //Incoming Webhooks


function updateMonitor() { 
  var target_dir = DriveApp.getFolderById(DIR_ID);
  var notify_files = [];
  notify_files=getFiles(target_dir, notify_files)
  
  // Slack通知
  if (notify_files.length > 0) {
    post_text = 'ファイルが編集されました。\n';
    for (var i = 0; i < notify_files.length; i++) {
      post_text += '\n';
      post_text += '・' + notify_files[i]['file_name'];
      post_text += '\n' + BASE_LINK + notify_files[i]['dir_id'];
    }
    
    sendSlack(post_text);  
  }
}


function getFiles(dir, notify_files){
  
  //子フォルダに対してgetFilesを実行
  var folders = dir.getFolders();
  
  while (folders.hasNext()) {
    var folder = folders.next();    
    notify_files=getFiles(folder, notify_files)
  }
  
  // フォルダのファイルデータを取得
  var files = dir.getFiles();
  var now = new Date();
  
  while (files.hasNext()) {
    var file = files.next();
    var file_createdate = file.getDateCreated();
    var file_editdate = file.getLastUpdated();
    // 30分以内に作成か編集があったかを確認
    var time_diff0 = (now.getTime() - file_createdate.getTime()) / (60 * 1000);
    var time_diff1 = (now.getTime() - file_editdate.getTime()) / (60 * 1000);
    if (time_diff0 < INTERVAL_MINUTE || time_diff1 < INTERVAL_MINUTE) {
      tmp = {
        'file_name': file.getName(),
        'dir_id': dir.getId()
      };
      notify_files.push(tmp);
    }
  }
  return notify_files;
}


function sendSlack(text) {
    const user_name = '更新通知bot';

    const send_data = {
        'username': user_name,
        'text': text
    };

    const options = {
        'method': 'post',
        'contentType': 'application/json',
        'payload': JSON.stringify(send_data)
    };

    UrlFetchApp.fetch(post_url, options);
}
