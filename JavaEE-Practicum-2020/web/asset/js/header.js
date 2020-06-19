import {isLogin} from "./base.js";

// 根据用户的登录状态, 决定显示的内容;
function toggleUserPanel() {
    let user = $("#user");
    let loginButton = $("#loginButton");
    let registerButton = $("#registerButton");
    // 判断用户是否登录;
    if(isLogin()) {
        user.css("display", "inline-block");
        loginButton.css("display", "none");
        registerButton.css("display", "none");
    }
    else {
        user.css("display", "none");
        loginButton.css("display", "inline-block");
        registerButton.css("display", "inline-block");
    }
}
toggleUserPanel();

// 购物车图标跳转;
$("#cartIcon").on("click", function() {
    location.href = "./shopping-cart.html";
});

// 输入提示;
$(`input[name="keyword"]`).on("focus", function() {
    $(this).attr("placeholder", "请在这里输入要查找的关键字");
});

// 表单验证;
$("#searchForm").on("submit", function() {
    const inputBox = $(`input[name="keyword"]`);
    let keyword = inputBox.val();
    if(keyword === "") {
        inputBox.attr("placeholder", "请输入关键字!");
        return false;
    }
    return true;
});

// 用户注销;
$("#logoutButton").on("click", function() {
    $.get("logout");
    location.href = "./index.html";
});
