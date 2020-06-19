import {setValidateBox} from "./base.js";

$().ready(function() {
    setValidateBox("login");

    $("#closeValidateModal").on("click", function() {
        $("#validateModal").css("display", "none");
    });
});