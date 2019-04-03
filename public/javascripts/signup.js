window.onload = function () {
    var frm = $("#signup_frm");

    frm.validate({
        rules: {
            name: "required",
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
            name: "Name is required",
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