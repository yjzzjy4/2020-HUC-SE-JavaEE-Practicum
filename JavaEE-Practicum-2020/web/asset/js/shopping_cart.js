import {setHeader, generateShoppingCart, setBookInfoModal} from "./base.js";
import {bindForCounterButtons, bindForCounter} from "./shopping_cart_module.js";
import {deleteAndCheckFuncWrapper, bindForEachPayButton, bindForPayButton} from "./shopping_cart_module.js";
import {bindForCheckAllButton, bindForDeleteSelectedButton} from "./shopping_cart_module.js";
import {isLogin} from "./base.js";

$().ready(function() {
    // 导入header;
    setHeader();

    // 导入详情的Modal;
    setBookInfoModal();

    if(isLogin()) {
        // 获取购物车的订单(前提是已登录);
        let cartItems = {};
        $.ajaxSettings.async = false;
        $.get("fetchShoppingCart",
            {},
            function(result) {
                if(!result["err_code"]) {
                    cartItems.items = result["items"];
                    cartItems.books = result["books"];
                }
            }, "json"
        );

        // 购物车项目数;
        let length = cartItems.items.length;

        // 动态生成购物车;
        $("#mainContainer").append(generateShoppingCart(cartItems));

        // 维护一个变量, 表示选中的购物车项目数;
        let totalChecked = 0;

        // 维护一个变量, 表示购物车当前还剩下的项目数;
        let currentItemNum = length;

        // 绑定各种购物车事件;
        function bindForShoppingCart(num) {
            bindForCounterButtons(num);
            bindForCounter(num);
            deleteAndCheckFuncWrapper(num, currentItemNum, totalChecked);
            bindForCheckAllButton(num);
            bindForDeleteSelectedButton(num);
            bindForEachPayButton(num);
            bindForPayButton(num);
        }
        bindForShoppingCart(length);
    }
    else {
        window.alert("请先登录!");
        location.href = "./login.html";
    }
});
