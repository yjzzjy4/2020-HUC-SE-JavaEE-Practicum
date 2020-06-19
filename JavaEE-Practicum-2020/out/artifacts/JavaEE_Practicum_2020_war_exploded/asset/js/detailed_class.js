import {setHeader, bookOnClick, generateBookshelf, generatePageDivider} from "./base.js";
import {setValidateModal, setBookInfoModal, getQueryString} from "./base.js";

$().ready(function() {
    // 导入header;
    setHeader();

    // 导入验证的Modal;
    setValidateModal();

    // 导入详情的Modal;
    setBookInfoModal();

    // 当前页面中会用到的全局变量;
    let rankNum = 10;
    let typeId = getQueryString("typeId");
    let page = getQueryString("page");
    let pageSize = 8;
    let totalEntry = 0;
    let totalPage = 1;

    // 从数据库获取当前类别的一页书籍信息;
    let books = null;
    $.ajaxSettings.async = false;
    $.get("getBooksByTypeId",
        {typeId: typeId, page: page, size: pageSize},
        function(result) {
            if(!result["err_code"]) {
                books = result.data;
            }
        }, "json"
    );

    if(books.length) {
        // 更新总记录条数和页数;
        totalEntry = books[0].count;
        totalPage = Math.ceil(totalEntry / pageSize);
    }

    // 从数据库获取类别畅销榜单数据;
    let rankListData = null;
    $.ajaxSettings.async = false;
    $.get("getRankListByTypeId",
        {typeId: typeId, rankNum: rankNum},
        function(result) {
            if(!result["err_code"]) {
                rankListData = result.data;
            }
        }, "json"
    );

    // 动态生成类别畅销榜单;
    function generateRankList(num) {
        let rankListContainer = $(`<div id="rankListContainer">`);
        let rankListTitle = $(`<div id="rankListTitle">畅销榜单</div>`);
        rankListContainer.append(rankListTitle);

        // 用于生成畅销榜单列表项;
        function generateRankListItem(index, book) {
            let item = $(`<li></li>`);
            if(index === 1) {
                item.addClass("unfold");
            }
            else {
                item.addClass("fold");
            }
            if(index <= 3) {
                item.addClass("top3");
            }
            let rankNum = $(`<span class="rankNum">${index}</span>`);
            let rankContent = $(`<div class="rankContent"></div>`);
            let titleImage = $(`<a id="rankListTitleImage${index}" class="titleImage" href="#" title=${book.title}><img src="${book.cover}"/></a>`);
            let itemInfo = $(`<div class="itemInfo"></div>`);
            let title = $(`<a id="rankListTitle${index}" class="title" href="#" title=${book.title}>${book.title}</a>`);
            let price = $(`<span class='price'><span class='sign'>￥</span>${book.price}</span>`);
            let rankListIsbn = $(`<span id="rankListIsbn${index}" class="rankListIsbn">${book.ISBN}</span>`);
            // 组装之前绑定事件;
            titleImage.on("click", null, {book: book}, bookOnClick);
            title.on("click", null, {book: book}, bookOnClick);
            // 组装;
            itemInfo.append(title, price, rankListIsbn);
            rankContent.append(titleImage, itemInfo);
            return item.append(rankNum, rankContent);
        }

        let rankList = $(`<ul id="rankList">`);

        for(let i = 0; i < rankListData.length; i++) {
            rankList.append(generateRankListItem(i + 1, rankListData[i]));
        }
        return rankListContainer.append(rankList);
    }
    $("#leftContainer").append(generateRankList(10));

    // 生成一个书架;
    function getBookshelfContainer() {
        const bookshelfContainer = $(`<div id="bookshelfContainer"></div>`);
        return bookshelfContainer.append(generateBookshelf("", rankListData));
    }
    $("#mainContainer").append(getBookshelfContainer());

    // 给畅销榜的每个项目标签都绑定上触发事件;
    function bindForRankList(target) {
        target.on("mouseenter", function() {
            let lastActive = $("#rankList > li.unfold");
            lastActive.toggleClass("fold unfold");
            target.toggleClass("fold unfold");
        });
    }

    $("#rankList > li").each(function() {
        bindForRankList($(this));
    });

    // 将分页栏导入到页面中;
    $("#mainContainer").append(generatePageDivider(`./detailed-class.html?typeId=${typeId}`, true, page, totalPage));
});
