// 格式化时间戳;
export function dateFormat(timestamp) {
    let date = new Date(timestamp);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    // let hours = date.getHours();
    // let minutes = date.getMinutes();
    // let seconds = date.getSeconds();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    // hours = hours < 10 ? `0${hours}` : hours;
    // minutes = minutes < 10 ? `0${minutes}` : minutes;
    // seconds = seconds < 10 ? `0${seconds}` : seconds;
    // return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return `${year}-${month}-${day}`;
}

// 获取url参数的工具函数;
export function getQueryString(name) {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    let r   = window.location.search.substr(1).match(reg);
    if (r != null) {
        // 解码URL;
        return decodeURI(r[2]);
    }
    return null;
}

// 判断用户是否登录;
export function isLogin() {
    let flag = false;
    $.ajaxSettings.async = false;
    $.get("validateLoginStatus",
        {},
        function(result) {
            if(!result["err_code"]) {
                flag = true;
            }
        }, "json"
    );
    return flag;
}

// 动态装载某个页面组件;
export function loadComponent(pageInputContainer, url, func) {
    $.ajaxSettings.async = false;
    $(pageInputContainer).load(url, func);
}

export function setStyle(pageInputContainer, url) {
    let style = $("<link>", {
        type: "text/css",
        rel: "stylesheet",
        href: url
    });
    pageInputContainer.append(style);
}

export function retrieveScript(pageInputContainer, url) {
    let sc = $("<script>", {
        type: "module",
        src: url
    });
    pageInputContainer.append(sc);
}

// 根据type, 设置登录/注册的输入框;
// type === "register" || type === "login", 其余情况非法;
// 规定在任何页面中, 只有div#validateBoxContainer才能是validateBox的容器;
export function setValidateBox(type) {
    const validateBoxContainer = $("#validateBoxContainer");
    loadComponent(validateBoxContainer, `./component/${type}-box.html`, function() {
        setStyle(validateBoxContainer, "../asset/css/component/validate_box.css");
        retrieveScript(validateBoxContainer, `../asset/js/${type}_check.js`);
    });
}

// 设置Header;
// 规定在任何页面中, 只有div#headerContainer才能是header的容器;
export function setHeader() {
    const headerContainer = $("#headerContainer");
    loadComponent(headerContainer, "./component/header.html", function() {
        setStyle(headerContainer, "../asset/css/component/header.css");
        retrieveScript(headerContainer, "../asset/js/header.js");
    });
}

// 设置登录/注册的Modal窗体;
// 规定在任何页面中, 只有div#alidateModalContainer才能是header的容器;
export function setValidateModal() {
    const validateModalContainer = $("#validateModalContainer");
    loadComponent(validateModalContainer, "./component/validate-modal.html", function() {
        setStyle(validateModalContainer, "../asset/css/component/validate_modal.css");
        retrieveScript(validateModalContainer, "../asset/js/validate_modal.js");
    });
}

// 设置书详情的Modal窗体;
// 规定在任何页面中, 只有div#bookInfoModalContainer才能是header的容器;
export function setBookInfoModal() {
    const validateModalContainer = $("#bookInfoModalContainer");
    loadComponent(validateModalContainer, "./component/book-info-modal.html", function() {
        setStyle(validateModalContainer, "../asset/css/component/book_info_modal.css");
        retrieveScript(validateModalContainer, "../asset/js/book_info_modal.js");
    });
}

// 生成分页栏按钮;
function generatePageButtons(url, hasParameter, page, totalPage) {
    // 防止越界;
    page = Math.max(1, page);
    page = Math.min(page, totalPage);
    // 以当前页面为轴, 标记左右两侧是否有折叠;
    let foldLeft = true;
    let foldRight = true;
    if(page - 1 <= 3) {
        foldLeft = false;
    }
    if(totalPage - page <= 3) {
        foldRight = false;
    }
    let pageButtons = $(`<ul id="pageButtons"></ul>`);

    // 工具函数, 用于生成一个分页按钮;
    function generatePageButton(hasParameters, page, isDisabled = false, isCurrent = false) {
        if(isDisabled) {
            return $(`<li class="disabled"><a href="javascript:void(0)">...</a></li>`);
        }
        else if(isCurrent) {
            return $(`<li class="current"><a href="javascript:void(0)">${page}</a></li>`);
        }
        let pageButton;
        if(hasParameter) {
            pageButton = $(`<li><a href="${url}&page=${page}">${page}</a></li>`);
        }
        else {
            pageButton = $(`<li><a href="${url}?page=${page}">${page}</a></li>`);
        }
        return pageButton;
    }

    // 生成左侧按钮;
    if(!foldLeft) {
        // 左侧不折叠, 则依次顺序生成按钮;
        for(let i = 1; i < page; i++) {
            pageButtons.append(generatePageButton(hasParameter, i));
        }
    }
    else {
        // 否则进行折叠;
        pageButtons.append(generatePageButton(hasParameter, 1));
        pageButtons.append(generatePageButton(hasParameter, page, true));
        for(let i = page - 2; i <= page - 1; i++) {
            pageButtons.append(generatePageButton(hasParameter, i));
        }
    }
    pageButtons.append(generatePageButton(hasParameter, page, false, true));
    // 生成右侧按钮;
    if(!foldRight) {
        // 右侧不折叠, 则依次顺序生成按钮;
        for(let i = page + 1; i <= totalPage; i++) {
            pageButtons.append(generatePageButton(hasParameter, i));
        }
    }
    else {
        // 否则进行折叠;
        for(let i = page + 1; i <= page + 2; i++) {
            pageButtons.append(generatePageButton(hasParameter, i));
        }
        pageButtons.append(generatePageButton(hasParameter, page, true));
        pageButtons.append(generatePageButton(hasParameter, totalPage));
    }
    return pageButtons;
}

// 生成分页栏输入跳转功能区;
function generatePageForm(url, hasParameter, page, totalPage) {
    let pageInputContainer = $(`<div id="pageInputContainer"></div>`);
    let firstLabel = $(`<label for="page">跳转至</label>`);
    let pageInput = $(`<input type="text" id="page" name="page" value="${page}" autocomplete="off"/>`);
    let lastLabel = $(`<label for="page">/ ${totalPage} 页</label>`);
    let pageButton = $(`<button>确定</button>`);

    // 绑定输入框事件, 只能输入数字, 且不可越界;
    pageInput.on("change", function() {
        let pattern = /^[1-9][0-9]*$/g;
        if(!$(this).val().match(pattern)) {
            $(this).val("1");
        }
        let value = parseInt($(this).val());
        $(this).val(Math.min(value, totalPage));
    });

    // 点击按钮, 进行跳转;
    pageButton.on("click", function() {
        if(hasParameter) {
            location.href = `${url}&page=${pageInput.val()}`;
        }
        else {
            location.href = `${url}?page=${pageInput.val()}`;
        }
    });

    return pageInputContainer.append(firstLabel, pageInput, lastLabel, pageButton);
}

// 组装分页栏按钮到分页栏容器里;
export function generatePageDivider(url, hasParameter, page, totalPage) {
    let pageDivider = $(`<div id="pageDivider"></div>`);
    pageDivider.append(generatePageButtons(url, hasParameter, page, totalPage));
    pageDivider.append(generatePageForm(url, hasParameter, page, totalPage));
    return pageDivider;
}

// 书架上每一本书的点击事件(Modal查看详情);
export function bookOnClick(event) {
    let book = event.data.book;
    $("#cover").attr("src", book.cover);
    $("#title").html(book.title);
    $("#author").html(book.author);
    $("#isbn").html(book.ISBN);
    $("#price").find(".priceNum").html(book.price);
    $("#sales").html(book.sales);
    $("#press").html(book.press);
    $("#publicationDate").html(book.publicationDate);
    $("#type").html(book.type);
    $("#brief").html(book.brief);
    $("#bookInfoModal").css("display", "block");
}

// 生成书架;
export function generateBookshelf(additionalClasses, books) {
    // 生成一本书;
    function generateBook(i, book) {
        let bookContainer = $(`<li class="bookContainer"></li>`);
        let cover = $(`<a id="book${i}" href="#" title="${book.title}"><img class="cover" src="${book.cover}" alt="${book.title}"/></a>`);
        let title = $(`<span class="title">${book.title}</span>`);
        let author = $(`<span class="author">${book.author}</span>`);
        let price = $(`<span class="price"><span class="sign">￥</span>${book.price}</span>`);
        let isbn = $(`<span id="isbn${i}" class="isbn">${book.ISBN}</span>`);

        // 组装之前, 绑定事件;
        cover.on("click", null, {book: book}, bookOnClick);

        // 组装;
        return bookContainer.append(cover, title, author, price, isbn);
    }

    let bookshelf = $("<ul>", {class: `bookshelf ${additionalClasses}`});

    for (let i = 0; i < books.length; i++) {
        bookshelf.append(generateBook(i, books[i]));
    }
    return bookshelf;
}

// 生成购物车顶部信息栏;
export function generateInfoTray(type = "shoppingCart") {
    let infoTray = $(`<div id="infoTray" class="shoppingCartItem"></div>`);
    let fakeCheck = $(`<input type="checkbox" name="check" id="fakeCheck"/>`);
    let itemContent = $(`<div class="itemContent">`);
    let fakeTitleImage = $(`<div id="fakeTitleImage" class="titleImage"></div>`);
    let titleLabel = $(`<div id="titleLabel" class="title">商品名称</div>`);
    let priceLabel = $(`<span id="priceLabel" class="price">单价</span>`);
    let numberCounterLabel = $(`<div id="numberCounterLabel" class="counterContainer">数量</div>`);
    let totalPriceLabel = $(`<span id="totalPriceLabel" class="totalPrice">金额</span>`);
    let operationLabel = $(`<div id="operationLabel" class="operationContainer">操作</div>`);
    if (type === "order") {
        fakeCheck = null;
        operationLabel = $(`<div id="operationLabel" class="operationContainer">创建时间</div>`);
    }
    // 组装;
    itemContent.append(fakeTitleImage, titleLabel, priceLabel, numberCounterLabel, totalPriceLabel, operationLabel);
    return infoTray.append(fakeCheck, itemContent);
}

// 生成购物车项;
export function generateShoppingCartItem(i, item, book, type = "shoppingCart") {
    let cartItem = $(`<div id="item${i}" class="shoppingCartItem"></div>`);
    let check = $(`<input type="checkbox" name="check" id="itemCheck${i}"/>`);
    let itemContent = $(`<div class="itemContent"></div>`);
    let isbn = $(`<input type="hidden" name="ISBN${i}" value="${item.ISBN}"/>`);
    let id = $(`<input type="hidden" name="id${i}" value="${item.id}"/>`);
    let titleImage = $(`<a id="titleImage${i}" class="titleImage" href="#" title="${book.title}"><img src="${book.cover}"/></a>`);
    let title = $(`<a id="title${i}" class="title" href="#" title="${book.title}">${book.title}</a>`);
    let priceLabel = $(`<div id="price${i}" class="price"><span class="sign">￥</span><span class="priceNum">${item.unitPrice}</span></div>`);
    let counterContainer = $(`<div class="counterContainer"></div>`);
    let counterMinus = $(`<span id="counterMinus${i}" class="counterMinus">-</span>`);
    let counter = $(`<input type="text" name="counter${i}" class="counter" value="${item.amount}" maxlength="3"/>`);
    let counterAdd = $(`<span id="counterAdd${i}" class="counterAdd">+</span>`);
    let totalPriceLabel = $(`<div id="totalPrice${i}" class="totalPrice"><span class="sign">￥</span><span class="priceNum">${item.totalPrice}</span></div>`);
    let operationContainer = $(`<div class="operationContainer"></div>`);
    let deleteCartItem = $(`<span id="deleteCartItem${i}" class="deleteCartItem">删除</span>`);
    let payForCartItem = $(`<a id="payForCartItem${i}" class="payForCartItem" href="#">立即付款</a>`);
    if (type === "pay") {
        check = $(`<input type="checkbox" name="check" id="itemCheck${i}" checked/>`);
        payForCartItem = null;
    } else if (type === "order") {
        check = payForCartItem = counterMinus = counterAdd = null;
        counter = $(`<span id="counter${i}" class="counter">${item.amount}</span>`);
        deleteCartItem = $(`<span id="itemCreateTime{i}" class="itemCreateTime">${dateFormat(item.payDate)}</span>`);
    }
    // 组装;
    counterContainer.append(counterMinus, counter, counterAdd);
    operationContainer.append(deleteCartItem, payForCartItem);
    itemContent.append(isbn, id, titleImage, title, priceLabel, counterContainer, totalPriceLabel, operationContainer);
    return cartItem.append(check, itemContent);
}

// 生成购物车底部操作栏;
export function generateConfirmPanel(type = "shoppingCart") {
    let confirmPanel = $(`<div id="confirmPanel">`);
    let checkAll = $(`<label><input type="checkbox" name="checkAll" id="checkAll"/>全选</label>`);
    let deleteSelected = $(`<span id="deleteSelected">删除选中</span>`);
    let selectedCounter = $(`<div id="selectedCounter">已选<span class="selectedCounterNum">0</span>项</div>`);
    let sumPrice = $(`<div id="sumPrice"><span class="sign">￥</span><span class="priceNum">0.00</span></div>`);
    let payButton = $(`<input type="submit" value="去付款" id="payButton"/>`);
    if (type === "pay") {
        checkAll = deleteSelected = selectedCounter = null;
        payButton = $(`<input type="button" value="确认付款" id="payButton"/>`);
    }
    // 组装;
    return confirmPanel.append(checkAll, deleteSelected, selectedCounter, sumPrice, payButton);
}

// 生成购物车, 要求给购物车项目数量, 类型(默认是购物车)和提交目标;
export function generateShoppingCart(cartItems, type = "shoppingCart") {
    // 生成容器和顶栏;
    let shoppingCartContainer = $(`<div id="shoppingCartContainer"></div>`);
    shoppingCartContainer.append(generateInfoTray(type));
    // 生成购物车主体;
    let shoppingCart = $(`<form id="shoppingCart" action="#" method="post">`);
    for (let i = 0; i < cartItems.items.length; i++) {
        shoppingCart.append(generateShoppingCartItem(i, cartItems.items[i], cartItems.books[i], type));
    }
    // 生成底栏, 查看订单页不需要底栏;
    if (type !== "order") {
        shoppingCart.append(generateConfirmPanel(type));
    }
    return shoppingCartContainer.append(shoppingCart);
}

