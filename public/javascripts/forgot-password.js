window.onload = function () {
    var frm = $("#forgot_password_frm");

    frm.validate({
        rules: {
            email: {
                required: true,
                email: true
            }
        },
        messages: {
            email: {
                required: "Email is required"
            }
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