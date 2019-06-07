function newRow(name, phrase){
  var row = $('<div class="row"></div>')
        .append($("<div></div>").append($('<input class="nick_name" type="text">').val(name)))
        .append($("<div></div>").append($('<textarea class="fixed_phrase">').val(phrase)));
  return row;
}

$(function(){

  // オプション画面の初期値を設定する
  chrome.storage.sync.get("backlog_fixed_phrase", function (value) {
    var d = value.backlog_fixed_phrase;
    for(var i in d) {
      $(".fixed_phrase_list").append(newRow(d[i].nick_name, d[i].fixed_phrase));
    }
  });
  
});

// セーブボタンが押されたら、
// ローカルストレージに保存する。
$(document).on("click", "#save", function () {
  
  var data = [];
  $(".fixed_phrase_list div.row").each(function(i, elem) {
    var n = $(elem).find("input.nick_name").first().val();
    var p = $(elem).find(".fixed_phrase").first().val();
    if(n && p) {
      data.push({nick_name: n, fixed_phrase: p});
    }
  });
  
  chrome.storage.sync.set({"backlog_fixed_phrase": data} , function(){});
});

$(document).on("click", "#add_row", function () {
  $(".fixed_phrase_list").append(newRow("", ""));
});