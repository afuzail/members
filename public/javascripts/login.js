window.onload = function () {
    var frm = $("#login_frm");

    frm.validate({
        rules: {
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minlength: 5
            }
        },
        messages: {
            email: {
                required: "Email is required"
            },
            password: {
                required: "Password is required"
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