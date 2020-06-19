// 计算所有(选中)项目的总金额;
export function calculateSumPrice(num) {
    let sumPriceNum = $("#sumPrice").find(".priceNum");
    let sumPrice = 0.00;
    for(let i = 0; i < num; i++) {
        // 项目已被删除;
        if($(`#item${i}`) == null) {
            continue;
        }
        let totalPriceNum = $(`#totalPrice${i}`).find(".priceNum");
        let itemCheck = $(`#itemCheck${i}`);
        // 项目被选中;
        if(itemCheck.prop("checked") === true) {
            sumPrice += parseFloat(totalPriceNum.html());
        }
    }
    sumPriceNum.html(sumPrice.toFixed(2));
}

// 如果所有项目都被删除, 触发这个函数;
function emptyShoppingCart() {
    // TO DO: 显示购物车空空如也;
    console.log("All Deleted!");
    $("#checkAll").prop("checked", false);
}

// 计数器加减按钮事件;
export function bindForCounterButtons(num) {
    for(let i = 0; i < num; i++) {
        let counterAdd = $(`#counterAdd${i}`);
        let counterMinus = $(`#counterMinus${i}`);
        let counter = $(`input[name="counter${i}"]`);

        counterAdd.on("click", function() {
            let value = parseInt(counter.val());
            // 避免多次访问数据库(然而没有更新发生);
            if(value < 999) {
                counter.val(++value);
                counter.change();
            }
        });

        counterMinus.on("click", function() {
            // 避免多次访问数据库(然而没有更新发生);
            let value = parseInt(counter.val());
            if(value > 1) {
                counter.val(--value);
                counter.change();
            }
        });
    }
}

// 计数器内容改变事件;
export function bindForCounter(num) {
    for(let i = 0; i < num; i++) {
        let id = $(`input[name="id${i}"]`).val();
        let counter = $(`input[name="counter${i}"]`);
        let itemCheck = $(`#itemCheck${i}`);
        let priceNum = $(`#price${i}`).find(".priceNum");
        let totalPriceNum = $(`#totalPrice${i}`).find(".priceNum");

        counter.on("change", function() {
            let pattern = /^[1-9][0-9]{0,2}$/g;
            if(!counter.val().match(pattern)) {
                counter.val("1");
            }
            let value = parseInt(counter.val());
            totalPriceNum.html((parseFloat(priceNum.html()) * value).toFixed(2));
            // 如果当前项被选中, 别忘了更新所有项的总金额;
            if(itemCheck.prop("checked") === true) {
                calculateSumPrice(num);
            }
            // 异步更新数据库;
            $.get("updateShoppingCartItemAmount",
                {id: id, amount: value},
                function(result) {
                    if(!result["err_code"]) {
                        console.log("success!");
                    }
                }, "json"
            );
        });
    }
}

// 因为选中和删除两个事件以来同一套系统环境变量值, 而这两个函数都写在模块里,
// 所以要这么写, 用闭包解决更新的环境变量不同步的问题;
export function deleteAndCheckFuncWrapper(num, currentItemNum, totalChecked) {
    // 项目删除事件;
    function bindForDeleteButton() {
        for(let i = 0; i < num; i++) {
            let deleteCartItem = $(`#deleteCartItem${i}`);
            let id = $(`input[name="id${i}"]`).val();
            deleteCartItem.on("click", function() {
                // 若要删除的项目当前被选中;
                if($(`#itemCheck${i}`).prop("checked") === true) {
                    totalChecked--;
                    let selectedCounterNum = $("#selectedCounter").find(".selectedCounterNum");
                    selectedCounterNum.html(parseInt(selectedCounterNum.html()) - 1);
                }
                $(`#item${i}`).remove();
                // 最后一个项目也删除了;
                if(!--currentItemNum) {
                    emptyShoppingCart();
                }
                console.log("totalChecked: " + totalChecked);
                console.log("currentItemNum: " + currentItemNum);
                // 重新计算所有选中项目的总金额;
                calculateSumPrice(num);
                // 从数据库异步删除订单;
                $.get("deleteOrderById",
                    {id: id},
                    function(result) {
                        if(!result["err_code"]) {
                            console.log("success!");
                        }
                    }, "json"
                );
            });
        }
    }
    bindForDeleteButton();

    // 购物车项目选中事件;
    function bindForItemCheck() {
        for(let i = 0; i < num; i++) {
            let itemCheck = $(`#itemCheck${i}`);
            let totalPriceNum = $(`#totalPrice${i}`).find(".priceNum");

            itemCheck.on("change", null, {totalChecked: totalChecked}, function() {
                let sumPriceNum = $("#sumPrice").find(".priceNum");
                let originalNum = parseFloat(sumPriceNum.html());
                let increment = parseFloat(totalPriceNum.html());
                let selectedCounter = $("#selectedCounter").find(".selectedCounterNum");
                let selectedCounterNum = parseInt(selectedCounter.html());

                if(itemCheck.prop("checked") === true) {
                    sumPriceNum.html((originalNum + increment).toFixed(2));
                    selectedCounter.html(selectedCounterNum + 1);
                    // 表示已全部选上;
                    if(++totalChecked === currentItemNum) {
                        $("#checkAll").prop("checked", true);
                    }
                }
                else {
                    sumPriceNum.html((originalNum - increment).toFixed(2));
                    selectedCounter.html(selectedCounterNum - 1);
                    totalChecked--;
                    // 只要有没有选中的项目, 全选按钮就处于非勾选状态;
                    $("#checkAll").prop("checked", false);
                }
                console.log("totalChecked: " + totalChecked);
            });
        }
    }
    bindForItemCheck();
}

// 购物车全选事件;
export function bindForCheckAllButton(num) {
    let checkAllButton = $("#checkAll");
    checkAllButton.on("change", function() {
        if(checkAllButton.prop("checked") === true) {
            for(let i = 0; i < num; i++) {
                // 项目已被删除;
                if($(`#item${i}`) == null) {
                    continue;
                }
                let itemCheck = $(`#itemCheck${i}`);
                if(itemCheck.prop("checked") === false) {
                    itemCheck.prop("checked", true);
                    itemCheck.change();
                }
            }
        }
        else {
            for(let i = 0; i < num; i++) {
                let itemCheck = $(`#itemCheck${i}`);
                // 项目已被删除;
                if(itemCheck != null) {
                    itemCheck.prop("checked", false);
                    itemCheck.change();
                }
            }
        }
    });
}

// 删除选中事件;
export function bindForDeleteSelectedButton(num) {
    let deleteSelected = $("#deleteSelected");
    deleteSelected.on("click", function() {
        for(let i = 0; i < num; i++) {
            let itemCheck = $(`#itemCheck${i}`);
            let deleteCartItem = $(`#deleteCartItem${i}`);
            // 没有删除的项目 && 项目被选中;
            if(itemCheck != null && itemCheck.prop("checked") === true) {
                deleteCartItem.click();
            }
        }
    });
}

// 工具函数, 用于向数据库提交购物车项目;
function commitShoppingCartItem(data) {
    $.post("commitShoppingCartItem",
        {data: JSON.stringify(data)},
        function(result) {
            if(!result["err_code"]) {
                location.href = "./buy-now.html";
            }
        }, "json"
    );
}

// 提交单个购物车项目事件;
export function bindForEachPayButton(num) {
    for(let i = 0; i < num; i++) {
        $(`#payForCartItem${i}`).on("click", function() {
            let data = [];
            let id = parseInt($(`input[name="id${i}"`).val());
            let amount = parseInt($(`input[name="counter${i}"]`).val());
            data.push({id: id, amount: amount});
            commitShoppingCartItem(data);
        });
    }
}

// 提交整个购物车选中的项目事件;
export function bindForPayButton(num) {
    $("#shoppingCart").on("submit", function() {
        let data = [];
        for(let i = 0; i < num; i++) {
            let itemCheck = $(`#itemCheck${i}`);
            if(itemCheck != null && itemCheck.prop("checked") === true) {
                let id = parseInt($(`input[name="id${i}"`).val());
                let amount = parseInt($(`input[name="counter${i}"]`).val());
                data[i] = {id: id, amount: amount};
            }
        }
        commitShoppingCartItem(data);
        return false;
    });
}
