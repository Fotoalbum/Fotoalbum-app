var _status;
var _user;

$(document).ready(function () {

    document.addEventListener("deviceready", onDeviceReady, true);

    _productID = localStorage.getItem("currentproductID");
    _album = JSON.parse(localStorage.getItem("currentAlbum"));
    _status = localStorage.getItem("status");
    
    //Check if the user is logged in allready and we have user information?
    createQuery("SELECT * FROM USER", qGetUserSuccess);


});

function qGetUserSuccess(tx, results) {
    
    var len = results.rows.length;
    
    if (len === 1) {
        
        //We have a user, select the information from the database and go to the ordernaw.html
        
        var _userdata = results.rows.item(0);
        _user = {id: _userdata.id, 
            email: _userdata.email, 
            password: _userdata.password, 
            firstname: _userdata.firstname, 
            lastname: _userdata.lastname, 
            adress: _userdata.adress, 
            housenr: _userdata.housenr, 
            zipcode: _userdata.zipcode, 
            city: _userdata.city, 
            country: _userdata.country, 
            delivery_name: _userdata.delivery_name,
            delivery_adress: _userdata.delivery_adress, 
            delivery_housenr: _userdata.delivery_housenr, 
            delivery_zipcode: _userdata.delivery_zipcode, 
            delivery_city: _userdata.delivery_city, 
            delivery_country: _userdata.delivery_country, 
            user_id: _userdata.user_id};
        
        localStorage.setItem("user", JSON.stringify(_user));
        
        window.location.href = "ordernaw.html";
        
    } else {
        
        $("#myloader").hide();
        
    }
}

function onDeviceReady() {

    window.screen.lockOrientation("landscape");
    AddEventListeners();
}

$(function () {
    $('#btnHome').click(function () {
        window.location.href = "index.html";
    });
});

$(function () {
    $('#btnRegisterNow').click(function () {

        //Register -> Store the confirmation and continue to NAW
        window.location.href = "ordernaw.html";

    });
});

$(function () {
    $('#btnResendLogin').click(function () {

        //Resend the passowrd

    });
});

$(function () {

    $(".loginform_input").on("input", function () {

        if ($("#email").val() === "" || $("#password").val() === "") {
            $('#btnOrderFormLogin').removeClass("disabled");
            $('#btnOrderFormLogin').addClass("disabled");
        } else {
            $('#btnOrderFormLogin').removeClass("disabled");
        }

    });
});

var _userdata;
$(function () {
    
    $('#btnOrderFormLogin').click(function () {

        //Login -> Store it and continue to NAW
        $.ajax({
            url: "http://enjoy.fotoalbum.nl/users/login.json",
            data: {
                "data[User][email]": $("#email").val(),
                "data[User][password]": $("#password").val(),
                "data[User][remember_me]": 0
            },
            type: "POST",
            cache: false,
            dataType: "json",
            success: function (response) {
                if (response.result === "OK") {
                    
                    //Set the user information
                    _userdata = response.data.User;
                    
                    //Delete the userinformation and fill it with the result from this one
                    createQuery("DELETE FROM USER WHERE email <> ''", qDeleteUserSuccess);

                    
                } else {
                    //Alert the user we can't go lower then the minpages
                    BootstrapDialog.show({
                        title: 'Probleem met inloggen',
                        message: "Je emailadres of wachtwoord wordt niet herkent. Probeer opnieuw",
                        buttons: [{
                                label: 'OK',
                                action: function (dialog) {
                                    dialog.close();
                                }
                            }]
                    });
                }
                console.log(response);
                //window.location.href = "ordernaw.html";
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
});

function qDeleteUserSuccess(tx, results) {
    
    _user = {id: generateUUID(), email: _userdata.email, password: $("#password").val(), firstname: _userdata.firstname, lastname: _userdata.lastname, user_id: _userdata.id};
    
    localStorage.setItem("user", JSON.stringify(_user));
    
    //Insert the new user into the database
    createQuery("INSERT INTO USER (id, email, password, firstname, lastname, user_id) VALUES(" +
            "'" + _user.id + "'," + 
            "'" + _user.email + "'," + 
            "'" + _user.password + "'," + 
            "'" + _user.firstname + "'," + 
            "'" + _user.lastname + "'," + 
            "'" + _user.user_id + "')",
            qAddUserSuccess);
    
}

function qAddUserSuccess(tx, results) {

    //User was added, now go to the ordernaw
    window.location.href = "ordernaw.html";
    
}

$(function () {
    
    $('#btnOrderFormLogoff').click(function () {

        //Login -> Store it and continue to NAW
        $.ajax({
            url: "http://enjoy.fotoalbum.nl/users/logout",
            data: {},
            type: "GET",
            cache: false,
            success: function (response) {
                
                console.log(response);
                
                
            },
            error: function (err) {
                console.log(err);
            }
        });
    });
});






