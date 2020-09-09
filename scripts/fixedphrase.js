// TODO 通知ユーザー選択のドロップダウンはこんなかんじのタグなので、これを選択時に定型文を入れれるようにする
// <ul class="at-mention-list comment-editor__emoticon-support-panel"

var fixedPhraseMap = {};

var itemCount = 0;
const observer = new MutationObserver(function(mutations) {
    $.each(mutations, function(i, mutation) {
      var target = $(mutation.target);
      
      var newItemCount = target.find('li.select2-search-choice div span.select2-icon-text').length;
      
      if($("input.is_comment-all-collapsed").length == 0){
        if (newItemCount > itemCount) {
          var username = target.find('li.select2-search-choice div span.select2-icon-text').last().text();
          
          var fixedPhrase = fixedPhraseMap[username];
          
          if(fixedPhrase) {
            var textArea = document.getElementById('leftCommentContent');
            var p = textArea.selectionStart;
            textArea.value = textArea.value.substr(0, p) + fixedPhrase + textArea.value.substr(p);
          
            textArea.focus();
            var caretPos = p + fixedPhrase.indexOf("]") + 1; // 最初の閉じカッコの次にキャレットを移動
            textArea.setSelectionRange(caretPos, caretPos);
          }
        }
      }
      
      itemCount = newItemCount;
    });
  });

var retryCounter = 0;
var setIntervalId = null;

// 要素が生成されるまで待ってから、イベントの追加を行う
function findTargetElement() {
 if(setIntervalId) {
   if(document.getElementById('notifiedUsersLeft')) {
     try {
       const target = document.getElementById('notifiedUsersLeft').querySelector('ul.select2-choices');
       observer.observe(target, {childList: true});
       clearInterval(setIntervalId);
     } catch (e) {
     }
   } else if (retryCounter > 10) {
     clearInterval(setIntervalId);
   }
   retryCounter++;
 }
}
  
(function(){
  setIntervalId = setInterval(findTargetElement, 1000);
  
  chrome.storage.sync.get("backlog_fixed_phrase", function (value) {
    var d = value.backlog_fixed_phrase;
    setFixedPhraseMap(d);
  });
})();

function setFixedPhraseMap(value) {
  fixedPhraseMap = {};
  
  for (var i in value) {
    fixedPhraseMap[value[i].nick_name] = value[i].fixed_phrase;
  }
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace == "sync") {
    if (changes.backlog_fixed_phrase) {
      setFixedPhraseMap(changes.backlog_fixed_phrase.newValue);
    }
  }
});