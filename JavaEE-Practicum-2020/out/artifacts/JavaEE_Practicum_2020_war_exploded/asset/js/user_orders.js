import {setHeader, isLogin, generateShoppingCart} from "./base.js";
import {generatePageDivider, getQueryString} from "./base.js";

$().ready(function() {
    // 导入header;
    setHeader();

    let cartItems = {};
    if(isLogin()) {
        // 当前页面中会用到的全局变量;
        let page = getQueryString("page");
        let pageSize = 3;
        let totalEntry = 0;
        let totalPage = 1;

        // 获取已付款的订单(前提是已登录);
        $.ajaxSettings.async = false;
        $.get("fetchPaidOrders",
            {page: page, size: pageSize},
            function(result) {
                if(!result["err_code"]) {
                    cartItems.items = result["items"];
                    cartItems.books = result["books"];
                }
            }, "json"
        );

        if(cartItems.items.length) {
            // 更新总记录条数和页数;
            totalEntry = cartItems.items[0].count;
            totalPage = Math.ceil(totalEntry / pageSize);
        }

        // 动态生成订单;
        $("#mainContainer").append(generateShoppingCart(cartItems, "order"));
        // 导入分页栏;
        $("#mainContainer").append(generatePageDivider(`./user-orders.html`, false, page, totalPage));
    }
    else {
        window.alert("请先登录!");
        location.href = "./login.html";
    }
});