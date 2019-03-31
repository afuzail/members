window.onload = function () {
    var frm = $("#login_frm");

    frm.validate({
        rules: {
            username: "required",
            password: "required"
        },
        submitHandler: function (event) {
            if (frm.valid()){
                return true;
            }else{
                return false;
            }
        }
    });
}