import {isLogin, setHeader, setValidateBox} from "./base.js";
import {loadComponent, setStyle, retrieveScript} from "./base.js";

$().ready(function() {
    // 导入header;
    setHeader();

    if(isLogin()) {
        // 获取用户信息(前提是已登录);
        let user = null;
        $.ajaxSettings.async = false;
        $.get("fetchUserInfo",
            {},
            function(result) {
                if(!result["err_code"]) {
                    user = result["user"];
                }
            }, "json"
        );
        $("#userInfo").find("img").attr("src", user.avatar);
        $("#username").find(".value").html(user.username);
        $("#phoneNumber").find(".value").html(user.phoneNumber);
        if(user.gender === "male") {
            $("#gender").find(".value").html("男");
        }
        else if(user.gender === "female") {
            $("#gender").find(".value").html("女");
        }
    }
    // else {
    //     window.alert("请先登录!");
    //     location.href = "./login.html";
    // }
});
