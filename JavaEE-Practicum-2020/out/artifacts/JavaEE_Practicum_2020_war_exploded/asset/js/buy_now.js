import {setHeader, generateShoppingCart} from "./base.js";
import {bindForCounterButtons, bindForCounter} from "./shopping_cart_module.js";
import {deleteAndCheckFuncWrapper, calculateSumPrice} from "./shopping_cart_module.js";
import {setBookInfoModal} from "./base.js";
import {isLogin} from "./base.js";

$().ready(function() {
    // 导入header;
    setHeader();

    // 导入详情的Modal;
    setBookInfoModal();

    if(isLogin()) {
        // 获取待付款的临时订单(前提是已登录);
        let cartItems = {};
        $.ajaxSettings.async = false;
        $.get("fetchTempOrders",
            {},
            function(result) {
                if(!result["err_code"]) {
                    cartItems.items = result["items"];
                    cartItems.books = result["books"];
                }
            }, "json"
        );

        // 当前临时订单项目数量;
        let length = cartItems.items.length;

        if(length === 0) {
            window.alert("请勿直接通过地址栏访问这个页面!");
            location.href = "./index.html";
        }

        // 动态生成临时订单;
        $("#mainContainer").append(generateShoppingCart(cartItems, "pay"));

        function bindForOrders(num) {
            // 一开始要计算一下所有的价格(确认订单界面默认都选上了);
            calculateSumPrice(num);
            bindForCounterButtons(num);
            deleteAndCheckFuncWrapper(num, num, num);
            bindForCounter(num);
        }
        bindForOrders(length);

        // 动态生成Modal窗体, 模拟付款;
        function generateConfirmModal() {
            let confirmModal = $(`<div id="confirmModal"></div>`);
            let modalContainer = $(`<div id="modalContainer"></div>`);
            let payMethods = $(`<div id="payMethods"></div>`);
            let byAliPay = $(`<input type="radio" name="payMethod" id="aliPay" value="aliPay" checked/><label for="aliPay">支付宝</label>`);
            let byWeChat = $(`<input type="radio" name="payMethod" id="weChat" value="weChat"/><label for="weChat">微信</label>`);
            let byUnionPay = $(`<input type="radio" name="payMethod" id="unionPay" value="unionPay"/><label for="unionPay">银联</label>`);
            let byVisa = $(`<input type="radio" name="payMethod" id="visa" value="visa"/><label for="visa">Visa</label>`);
            let modalButtonContainer = $(`<div id="modalButtonContainer"></div>`);
            let confirmButton = $(`<input type="submit" value="确定"/>`);
            let cancelButton = $(`<input type="button" value="取消"/>`);
            // 组装;
            modalButtonContainer.append(confirmButton, cancelButton);
            payMethods.append(byAliPay, byWeChat, byUnionPay, byVisa);
            modalContainer.append(payMethods, modalButtonContainer);
            return confirmModal.append(modalContainer);
        }
        $("#shoppingCart").append(generateConfirmModal());

        // 绑定购物车付款按钮事件;
        function bindForPayButton() {
            // 表单无法提交, 通过异步进行跳转;
            $("#shoppingCart").on("submit", function() {
                return false;
            });

            $("#payButton").on("click", function() {
                $("#confirmModal").css("display", "block");
            });
        }
        bindForPayButton();

        // 绑定Modal按钮事件;
        function bindForModal(num) {
            let confirmButton = $(`#modalButtonContainer > input[type="submit"]`);
            confirmButton.on("click", function() {
                let payMethod = $(`input[name="payMethod"]:checked`).val();
                let data = [];
                for(let i = 0; i < num; i++) {
                    let id = parseInt($(`input[name="id${i}"`).val());
                    let amount = parseInt($(`input[name="counter${i}"]`).val());
                    data[i] = {id: id, amount: amount};
                }
                let upload = {data: data, payMethod: payMethod};
                $.post("commitTempOrders",
                    {data: JSON.stringify(upload)},
                    function(result) {
                        if(!result["err_code"]) {
                            location.href = "./user-orders.html?page=1";
                        }
                    }, "json"
                );
            });

            let cancelButton = $(`#modalButtonContainer > input[type="button"]`);
            cancelButton.on("click", function() {
                $("#confirmModal").css("display", "none");
            });
        }
        bindForModal(length);
    }
    else {
        window.alert("请先登录!");
        location.href = "./login.html";
    }
});
