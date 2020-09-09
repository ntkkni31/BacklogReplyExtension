var ISSUE_URL = /[/]view[/]([A-Z_0-9]+[-][0-9]+)([#]comment-([0-9]+))?/;

(function(w)  {
    var currentTooltip;
    var repositioned = false;

    var onOpened = function (tooltip) {
        currentTooltip = tooltip;
    };
    var onClosed = function () {
        currentTooltip = null;
        repositioned = false;
    };

    var reRegExp = /[\\^$.*+?()[\]{}|]/g,
    reHasRegExp = new RegExp(reRegExp.source);

    function escapeRegExp(string) {
        return (string && reHasRegExp.test(string))
            ? string.replace(reRegExp, '\\$&')
            : string;
    }

    w.escapeRegExp = escapeRegExp;

    const langSetting = document.getElementsByTagName("html")[0].getAttribute("lang");

    const replyExtentionTarget = document.getElementsByTagName("body")[0];

    const replyExtentionObserver = new MutationObserver(function(mutations) {
        var currentUrl = document.URL.split("#")[0];
        var replyCommentRegex = new RegExp("^" + escapeRegExp(currentUrl + "#comment-" ) + "\\d+$");
        var result = ISSUE_URL.exec(currentUrl);
        if(!result || result.length < 2) return;

        var issueKey = result[1];

        $.each(mutations, function(i, mutation) {
            var target = $(mutation.target);
            var commentItems = target.find('div.comment-item'); // コメントセクション
            commentItems.each(function(i1, e) {
                var commentId = $(e).attr('id');

                // Replyボタンの追加
                var actionContainer = $(e).find('div.comment-item__actions');
                if(actionContainer.length > 0) {
                    if(actionContainer.first().find('button.reply_button').length == 0) {
                        var svg = $('<svg role="image" class="icon -medium"></svg>');

                        actionContainer.first().prepend(
                            $('<button type="button" class="icon-button icon-button--default -with-text reply_button"></button>')
                            .append(svg)
                            .append($('<span class="_assistive-text">' + (langSetting == 'ja' ? '返信' : 'Reply') + '</span>'))
                        );

                        // なんかよくわからんけど、あとから追加することでsvgが表示されるみたいだ。
                        // xlink:hrefのハッシュ部分には/images/svg/sprite.symbol.svgのsymbolのidを指定する。
                        svg[0].innerHTML = '<use xlink:href="/images/svg/sprite.symbol.svg#icon_comment"></use>';
                    }
                }

                // Reply有無の表示の追加
                // まず現在のURLの課題中のコメントへのリンクのaタグがあるかを探す
                var replyCommentTags = $(e).find('div > p > a.loom-link-another').filter(function (index) { 
                    if($(this).attr('href')) {
                        return $(this).attr('href').match(replyCommentRegex);
                    } else {
                        return false;
                    }
                });
                
                replyCommentTags.each(function(i2, tag) {
                    var replyCommentId = $(tag).attr('href').split('#')[1]; // コメント先のコメントID

                    target.find('div.comment-item[id="' + replyCommentId + '"]').each(function(i3, refCommentDiv) {
                        // 返信アイコン表示用のセクションがなければ追加
                        var replyIconContainer = $(refCommentDiv).find('div.comment-replies-container');
                        if(replyIconContainer.length == 0) {
                            var newDiv = $('<div class="comment-replies-container">');
                            replyIconContainer.push(newDiv);

                            $(refCommentDiv).find('div.comment-item__inner').first().append(newDiv);
                        }

                        // 返信アイコンを追加。(同一コメントtoコメントでは一つだけ)
                        var iconId = commentId + "_to_" + replyCommentId;

                        if(target.find('div[id="' + iconId + '"]').length == 0) {
                            var replyIconDiv = $('<div class="comment-reply"></div>').attr('id', iconId).attr('data-ref', commentId);
                            var a = $('<a rel="noopener noreferrer" class="loom-link-another tooltipstered backlog-card-checked"></a>');
                            a.attr('href', currentUrl + "#" + commentId);

                            var embedUrl = "/view/embed/" + issueKey + "/comment/" + commentId.split("-")[1];
                            var html = '<span class="loading--circle -small _mg-t-15 js-loading"></span>' + '<iframe src="' + embedUrl + '"></iframe>';
                            a.tooltipster({
                                content: html,
                                contentAsHTML: true,
                                interactive: true,
                                animationDuration: 0,
                                delay: [0, 300],
                                position: "right",
                                theme: "tooltipster-backlog",
                                functionBefore: onOpened,
                                functionAfter: onClosed
                            });

                            var svg = $('<svg role="image" class="icon -medium"></svg>');

                            replyIconDiv.append(a.append(svg));
                            $(replyIconContainer[0]).append(replyIconDiv);
                            
                            svg[0].innerHTML = '<use xlink:href="/images/svg/sprite.symbol.svg#icon_comment"></use>';
                        }
                    });
                });
            });
        });
    });

    replyExtentionObserver.observe(replyExtentionTarget, {childList: true, subtree: true});
})(window);

$(document).on('mouseover', 'div.comment-reply', function() {
    var replyCommentId = $(this).attr('data-ref');
    $('div.comment-item[id="' + replyCommentId + '"]').addClass('comment-reply-highlight');
});

$(document).on('mouseout', 'div.comment-reply', function() {
    var replyCommentId = $(this).attr('data-ref');
    $('div.comment-item[id="' + replyCommentId + '"]').removeClass('comment-reply-highlight');
});

$(document).on('mouseover', 'div.comment-item div.comment-item__container a', function() {
    var commentUrl = $(this).attr('href');

    var result1 = ISSUE_URL.exec(document.URL);
    if(!result1 || result1.length < 2) return;

    var result2 = ISSUE_URL.exec(commentUrl);
    if(!result2 || result2.length < 3) return;

    var issueKey = result2[1];
    if (issueKey != result1[1]) return;

    var replyCommentId = result2[2].replace('#', '');

    $('div.comment-item[id="' + replyCommentId + '"]').addClass('comment-reply-highlight');
});

$(document).on('mouseout', 'div.comment-item div.comment-item__container a', function() {
    var commentUrl = $(this).attr('href');

    var result1 = ISSUE_URL.exec(document.URL);
    if(!result1 || result1.length < 2) return;

    var result2 = ISSUE_URL.exec(commentUrl);
    if(!result2 || result2.length < 3) return;

    var issueKey = result2[1];
    if (issueKey != result1[1]) return;

    var replyCommentId = result2[2].replace('#', '');

    $('div.comment-item[id="' + replyCommentId + '"]').removeClass('comment-reply-highlight');
});

$(document).on('click', 'button.reply_button', function() {
    $('#leftCommentContent').focus();
    var commentDiv = $(this).closest('div.comment-item');
    var commentId = commentDiv.attr('id');

    var replayIntroduction = "Re: " + document.URL.split("#")[0] + "#" + commentId + "\n";

    // ユーザーのアイコンに<a href="/user/kanai"... みたいに入っているので、ここからユーザーIDを無理矢理切り出す
    var userHref = commentDiv.find('.comment-item__header .user-icon-set a.comment-item__user-icon').first().attr('href');
    var userId;
    if(userHref){
        userId = userHref.replace(/^\/user\//g, '');
        if(userId && userHref != userId) {
            replayIntroduction += '@' + userId + '\n';
        }
    }

    $('#leftCommentContent').focus();
    var txt = $('#leftCommentContent').val();
    $('#leftCommentContent').val(txt + replayIntroduction);

});