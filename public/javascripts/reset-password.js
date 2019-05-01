window.onload = function () {
    var frm = $("#reset_password_frm");

    frm.validate({
        rules: {
            password: {
                required: true,
                minlength: 5
            },
            confirm_password: {
                required: true,
                equalTo: "#password"
            }
        },
        messages: {
            password: {
                required: "Password is required",
            },
            confirm_password: {
                required: "Confirm password is required",
                equalTo: 'Please type same password again.'
            }
        },
        submitHandler: function (event) {
            if (frm.valid()) {
                return true;
            } else {
                return false;
            }
        }
    });
}