import {generateBookshelf, setHeader} from "./base.js";
import {setValidateModal, setBookInfoModal} from "./base.js";

$().ready(function() {
    // 导入header;
    function setHeaderWrapper() {
        setHeader();
    }
    setHeaderWrapper();

    // 导入验证的Modal;
    setValidateModal();

    // 导入详情的Modal;
    setBookInfoModal();

    // 获取所有的图书类别;
    let classes = null;
    $.ajaxSettings.async = false;
    $.get("getBookTypes",
        {},
        function(result) {
            if(!result["err_code"]) {
                classes = result.data;
            }
        }, "json"
    );

    // 动态生成图书类别栏;
    function generateClassList() {
        let classListContainer = $(`<div id="classListContainer"></div>`);
        let classListTitle = $(`<div id="classListTitle">图书分类</div>`);
        classListContainer.append(classListTitle);
        let classList = $(`<ul id="classList">`);
        for(let i = 0; i < classes.length; i++) {
            let classListItem = $(`<li></li>`);
            let classTitle = $(`<a id="classTitle${i}" href="./detailed-class.html?typeId=${classes[i].id}&page=1" title="${classes[i].name}">${classes[i].name}</a>`);
            classListItem.append(classTitle);
            classList.append(classListItem);
        }
        return classListContainer.append(classList);
    }
    $("#leftFrame").append(generateClassList());

    // 动态生成类别横向导航条;
    function generateClassNav() {
        let classNav = $(`<ul id="classNav">`);
        let prefix = "classTitle";
        for(let i = 0; i < classes.length; i++) {
            if(i === 0) {
                classNav.append($(`<li class="${prefix}0 on"><span>${classes[i].name}</span></li>`));
            }
            else {
                classNav.append($(`<li class="${prefix}${i} off"><span>${classes[i].name}</span></li>`));
            }
        }
        return classNav;
    }
    $("#mainContainer").append(generateClassNav());

    // 动态生成多个书架;
    function generateMultiBookshelf() {
        let prefix = "classShelf";
        const bookshelfContainer = $(`<div id="bookshelfContainer"></div>`);

        for(let i = 0; i < classes.length; i++) {
            // 获取每个类别指定数量的书籍, 供首页展示用;
            let books = null;
            $.ajaxSettings.async = false;
            $.get("getBooksByTypeId",
                {typeId: classes[i].id, page: 1, size: 10},
                function(result) {
                    if(!result["err_code"]) {
                        books = result.data;
                    }
                }, "json"
            );

            if(i === 0) {
                bookshelfContainer.append(generateBookshelf(`${prefix}0 display`, books));
            }
            else {
                bookshelfContainer.append(generateBookshelf(`${prefix}${i} hidden`, books));
            }
        }
        return bookshelfContainer;
    }
    $("#mainContainer").append(generateMultiBookshelf());

    // 给导航栏的每个类别标签都绑定上触发事件;
    function bindForClassNav(trigger, target) {
        trigger.on("mouseenter", function() {
            let lastTrigger = $("#classNav li.on");
            let lastActive = $("ul.bookshelf.display");
            lastTrigger.toggleClass("on off");
            trigger.toggleClass("on off");
            lastActive.toggleClass("display hidden");
            target.toggleClass("display hidden");
        });
    }

    $("#classNav > li").each(function(index) {
        bindForClassNav($(this), $(`ul.classShelf${index}`));
    });
});