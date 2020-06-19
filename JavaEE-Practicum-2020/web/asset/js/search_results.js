import {setHeader, generateBookshelf} from "./base.js";
import {setBookInfoModal, setValidateModal} from "./base.js";
import {getQueryString, generatePageDivider} from "./base.js";

$().ready(function() {
    // 导入header;
    setHeader();

    // 导入验证的Modal;
    setValidateModal();

    // 导入详情的Modal;
    setBookInfoModal();

    // 当前页面中会用到的全局变量;
    let keyword = getQueryString("keyword");
    let page = getQueryString("page");
    let pageSize = 2;
    let totalEntry = 0;
    let totalPage = 1;

    // 从数据库获取当前搜索关键字结果集中一页的信息;
    let books = null;
    $.ajaxSettings.async = false;
    $.get("getBooksByKeyword",
        {keyword: keyword, page: page, size: pageSize},
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

    // 生成一个书架;
    function getBookshelfContainer() {
        const bookshelfContainer = $("<div>", {id: "bookshelfContainer"});
        return bookshelfContainer.append(generateBookshelf("", books));
    }
    $("#mainContainer").append(getBookshelfContainer());
    $("#mainContainer").append(generatePageDivider(`./search-results.html?keyword=${keyword}`, true, page, totalPage));
});
