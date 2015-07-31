var _user;

$(document).ready(function () {

    document.addEventListener("deviceready", onDeviceReady, true);

    _user = JSON.parse(localStorage.getItem("user"));

});

function onDeviceReady() {

    window.screen.lockOrientation("landscape");

    AddEventListeners();

    var networkState = navigator.connection.type;

    if (networkState === Connection.UNKNOWN || networkState === Connection.NONE) {

        alert("Op dit moment heeft u geen internetverbinding.");

    } else {

        if (_user) {

            //Try to log in
            $.ajax({
                url: "http://enjoy.fotoalbum.nl/users/login.json",
                data: {
                    "data[User][email]": _user.email,
                    "data[User][password]": _user.password,
                    "data[User][remember_me]": 0
                },
                type: "POST",
                cache: false,
                dataType: "json",
                success: function (response) {

                    //Get the orders from the server
                    $.ajax({
                        type: "GET",
                        url: "http://enjoy.fotoalbum.nl/mijn-bestellingen.json",
                        data: {},
                        dataType: "json",
                        success: function (result) {

                            //Fill the ordertable
                            var len = result.orders.length;
                            var _orderCollection = new Array();

                            $("#lstOrders").html("");

                            for (var i = 0; i < len; i++) {

                                //TODO create Album object
                                var order = result.orders[i];
                                var orderinfo = order.Order;
                                var orderitems = order.OrderItem;

                                var ordername = "";
                                var orderprice = 0;

                                if (orderitems.length > 0) {
                                    ordername = orderitems[0].name;
                                    for (var x = 0; x < orderitems.length; x++) {
                                        orderprice += parseFloat(orderitems[x].price);
                                    }
                                } else {
                                    ordername = "Fotoalbum";
                                    orderprice = "0.00";
                                }

                                _orderCollection.push(order);

                                //TODO Cover IMG "<img src='http://api.xhibit.com/v2/" + album.cover_img + "' style='width:80px;'>" +
                                var _li = "<div class='myOrderRow row'>" +
                                        "<div class='myOrderCol col-xs-10'>" +
                                        "<img class='myOrderImage' data-src='holder.js/100%x180' alt='myImage'>" +
                                        "<div class='myOrderInfo'>" +
                                        "<div class='myOrderCaption'>" + ordername + "</div>" +
                                        "<div class='myOrderStatus'>Orderstatus: " + orderinfo.pdf_engine_status + "</div>" +
                                        "<div class='myOrderSub'>Besteld op: " + orderinfo.nice_date + "</div>" +
                                        "<div class='myOrderPrice'>Prijs: € " + orderprice + "</div>" +
                                        "</div>" + //end info
                                        "</div>" + //end colums
                                        "<div class='myOrderSelector col-xs-2'>" +
                                        "<span class='glyphicon glyphicon-chevron-right'></span>" +
                                        "</div>" + //end column
                                        "</div>"; //end row

                                $("#lstOrders").append(_li);

                            }

                        },
                        error: function (err) {
                            console.log(err);
                            //User is not logged in, so let them login first
                            $("#loginform").removeClass("hidden");
                        }
                    });
                },
                error: function (err) {
                    console.log(err);
                    $("#loginform").removeClass("hidden");
                }
            });

        } else {

            $("#loginform").removeClass("hidden");

        }
    }
}

$(function () {
    $(".myOrderRow .row").on("click", function (obj) {
        console.log(obj);
    });
});

/*
 function getRecords(tx) {
 
 tx.executeSql("SELECT * FROM ORDERS ORDER BY orderdate DESC", [], qGetOrdersSuccess, errorCB);
 }
 
 function qGetOrdersSuccess(tx, results) {
 
 var len = results.rows.length;
 var _orderCollection = new Array();
 
 $("#lstOrders").html("");
 
 for (var i = 0; i < len; i++) {
 
 //TODO create Album object
 _orderCollection.push(results.rows.item(i));
 
 //TODO Cover IMG "<img src='http://api.xhibit.com/v2/" + album.cover_img + "' style='width:80px;'>" +
 var _li = "<div class='myOrderRow row'>" +
 "<div class='myOrderCol col-xs-10'>" +
 "<img class='myOrderImage' data-src='holder.js/100%x180' alt='myImage'>" +
 "<div class='myOrderInfo'>" +
 "<div class='myOrderCaption'>" + results.rows.item(i).productname + "</div>" +
 "<div class='myOrderStatus'>Orderstatus: " + results.rows.item(i).orderstatus + "</div>" +
 "<div class='myOrderSub'>Besteld op: " + results.rows.item(i).orderdate + "</div>" +
 "<div class='myOrderPrice'>Prijs: € " + results.rows.item(i).totalprice + "</div>" +
 "</div>" + //end info
 "</div>" + //end colums
 "<div class='myOrderSelector col-xs-2'>" +
 "<span class='glyphicon glyphicon-chevron-right'></span>" +
 "</div>" + //end column
 "</div>"; //end row
 
 $("#lstOrders").append(_li);
 
 }
 
 }
 */