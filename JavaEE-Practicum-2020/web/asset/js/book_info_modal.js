$().ready(function() {
    // 关闭Modal按钮事件;
    $("#closeBookInfo").on("click", function() {
        $("#bookInfoModal").css("display", "none");
    });

    // 加购/立即购买之前, 要先确保用户已经登录;
    function ensureLogin() {
        let flag = false;
        $.ajaxSettings.async = false;
        $.get("validateLoginStatus",
            {},
            function(result) {
                if(!result["err_code"]) {
                    return flag = true;
                }
                else {
                    $("#bookInfoModal").css("display", "none");
                    $("#validateModal").css("display", "block");
                }
            }, "json"
        );
        return flag;
    }

    // 不管是加购物车/立即购买, 都要提取同样的商品信息;
    function getBookInfo() {
        let book = {};
        book.ISBN = $("#isbn").html();
        book.amount = 1;
        book.unitPrice = parseFloat($("#price").find(".priceNum").html());
        book.totalPrice = (book.amount * book.unitPrice).toFixed(2);
        return book;
    }

    $("#addToCart").on("click", null, function() {
        if(ensureLogin()) {
            let book = getBookInfo();
            console.log(book);
            $.ajaxSettings.async = false;
            $.get("addToShoppingCart",
                {ISBN: book.ISBN, amount: book.amount, unitPrice: book.unitPrice, totalPrice: book.totalPrice},
                function(result) {
                    if(!result["err_code"]) {
                        window.alert("加入购物车成功!");
                    }
                    else {
                        console.log(result["err_msg"]);
                    }
                }, "json"
            );
        }
    });

    $("#payNow").on("click", null, function() {
        if(ensureLogin()) {
            let book = getBookInfo();
            console.log(book);
            $.ajaxSettings.async = false;
            $.get("addToUserOrder",
                {ISBN: book.ISBN, amount: book.amount, unitPrice: book.unitPrice, totalPrice: book.totalPrice},
                function(result) {
                    if(!result["err_code"]) {
                        location.href = "./buy-now.html";
                    }
                    else {
                        console.log(result["err_msg"]);
                    }
                }, "json"
            );
        }
    });
});