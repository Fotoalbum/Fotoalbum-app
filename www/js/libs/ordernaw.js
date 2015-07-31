var _status;
var _productID;
var _album;
var _user;

$(document).ready(function () {

    document.addEventListener("deviceready", onDeviceReady, true);

    _productID = localStorage.getItem("currentproductID");
    _album = JSON.parse(localStorage.getItem("currentAlbum"));
    _user = JSON.parse(localStorage.getItem("user"));

    //Fill the forms if we have data
    $("#name").html(_user.firstname + " " + _user.lastname);
    $("#email").html(_user.email);

    //Check if the last time an adress was stored
    /*
     if (_user.adress) {
     
     $("#adress").val(_user.adress);
     $("#housenr").val(_user.housenr);
     $("#zipcode").val(_user.zipcode);
     $("#city").val(_user.city);
     $("#country").val(_user.country);
     
     if (_user.adress !== _user.delivery_adress) {
     
     $("#invoicesameadress").prop("checked", false);
     $("#deliveryadress").removeClass("hidden");
     
     $("#delivery_name").val(_user.delivery_name);
     $("#delivery_adress").val(_user.delivery_adress);
     $("#delivery_housenr").val(_user.delivery_housenr);
     $("#delivery_zipcode").val(_user.delivery_zipcode);
     $("#delivery_city").val(_user.delivery_city);
     $("#delivery_country").val(_user.delivery_country);
     
     } else {
     
     $("#delivery_name").val(_user.firstname + " " + _user.lastname);
     
     }
     
     }
     */

    $("#myloader").hide();

});

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
    $('#btnBackToOrder').click(function () {
        window.location.href = "orderpage.html";
    });
});

$(function () {

    $('#btnGoPayment').click(function () {

        $("#myloader").show();

        /*
         var adress = $("#adress").val();
         var housenr = $("#housenr").val();
         var zipcode = $("#zipcode").val();
         var city = $("#city").val();
         var country = $("#country").val();
         
         var delivery_name;
         var delivery_adress;
         var delivery_housenr;
         var delivery_zipcode;
         var delivery_city;
         var delivery_country;
         
         if ($("#invoicesameadress").prop("checked") === true) {
         delivery_name = _user.firstname + " " + _user.lastname;
         delivery_adress = adress;
         delivery_housenr = housenr;
         delivery_zipcode = zipcode;
         delivery_city = city;
         delivery_country = country;
         } else {
         delivery_name = $("#delivery_name").val();
         delivery_adress = $("#delivery_adress").val();
         delivery_housenr = $("#delivery_housenr").val();
         delivery_zipcode = $("#delivery_zipcode").val();
         delivery_city = $("#delivery_city").val();
         delivery_country = $("#delivery_country").val();
         }
         
         _user.adress = adress;
         _user.housenr = housenr;
         _user.zipcode = zipcode;
         _user.city = city;
         _user.country = country;
         _user.delivery_name = delivery_name;
         _user.delivery_adress = delivery_adress;
         _user.delivery_housenr = delivery_housenr;
         _user.delivery_zipcode = delivery_zipcode;
         _user.delivery_city = delivery_city;
         _user.delivery_country = delivery_country;
         
         //Store the delivery information
         createQuery("UPDATE USER SET " +
         "adress='" + adress + "'," +
         "housenr='" + housenr + "'," +
         "zipcode='" + zipcode + "'," +
         "city='" + city + "'," +
         "country='" + country + "'," +
         "delivery_name='" + delivery_name + "'," +
         "delivery_adress='" + delivery_adress + "'," +
         "delivery_housenr='" + delivery_housenr + "'," +
         "delivery_zipcode='" + delivery_zipcode + "'," +
         "delivery_city='" + delivery_city + "'," +
         "delivery_country='" + delivery_country + "'" +
         " WHERE id='" + _user.id + "'",
         qUpdateUserSuccess
         );
         */

        localStorage.setItem("user", JSON.stringify(_user));

        //Call the ayden payment tool with settings
        window.location.href = "payment.html";
    });
});

function qUpdateUserSuccess(tx, results) {


    localStorage.setItem("user", JSON.stringify(_user));

    //Call the ayden payment tool with settings
    window.location.href = "payment.html";
}

$(function () {
    
    $("#invoicesameadress").change(function (evt) {
        //Set the delivery adress visible or not
        if ($("#invoicesameadress").prop("checked") === true) {

            $("#deliveryadress").removeClass("hidden");
            $("#deliveryadress").addClass("hidden");

        } else {

            $("#deliveryadress").removeClass("hidden");

            if ($("#delivery_name").val() === "") {
                $("#delivery_name").val(_user.firstname + " " + _user.lastname);
            }

        }
    });
});

$(function () {

    $("#btnSwitchUser").click(function () {

        //Login -> Store it and continue to NAW
        $.ajax({
            url: "http://enjoy.fotoalbum.nl/users/logout",
            data: {},
            type: "GET",
            cache: false,
            success: function (response) {

                console.log("logged off");

                //Remove the current user from the database
                createQuery("DELETE FROM USER WHERE id='" + _user.id + "'",
                        qDeleteUserSuccess
                        );
            },
            error: function (err) {
                alert("Probleem met uitloggen, probeer opnieuw");
            }
        });

    });
});

function qDeleteUserSuccess(tx, results) {

    window.location.href = "orderpage.html";
}








