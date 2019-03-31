window.onload = function () {
    var frm = $("#signup_frm");

    frm.validate({
        rules: {
            email: "required",
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