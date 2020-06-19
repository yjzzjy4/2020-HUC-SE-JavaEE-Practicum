// 工具函数, 用于设定提示的样式和状态;
export function setPromptInfo(selector, info, style) {
    selector.html(info);
    selector.attr("class", `promptInfo ${style}`);

}

// 刷新验证码;
export function refreshCaptcha(event) {
    event.data.captchaImage.attr("src", `generateCaptcha?timestamp=${new Date().valueOf()}`);
}

// 验证码输入提示;
export function captchaOnFocus(event) {
    setPromptInfo(event.data.captchaPrompt, "点击图片可以刷新验证码, 不区分大小写", "prompt");
}
