$(document).ready(function () {

    document.addEventListener("deviceready", onDeviceReady, true);

    var appStarted = localStorage.getItem("appStarted");

    if (appStarted === "true") {
        db = window.openDatabase("Fotoalbum", "", "Fotoalbum DB", 1000000);
        console.log(db.version);
    }
    
    //CreateNavigation();
    $(".banner").css("height", window.screen.height + "px");
    $(".banner").css("background-size", "100% " + window.screen.height + "px");
});

function onDeviceReady() {

    window.screen.lockOrientation("landscape");

    if (window.device.platform === 'iOS') {

        StatusBar.hide();
    }

    AddEventListeners();

    //window.addEventListener("batterylow", onDeviceBatteryLow, false);
    //window.addEventListener("batterycritical", onDeviceBatteryCritical, false);
    
    //Create Database or open it
    db = window.openDatabase("Fotoalbum", "", "Fotoalbum DB", 1000000);

    if (db.version < "2.4") {
        db.transaction(populateDB, errorCB, successCB);
        db.changeVersion(db.version, "2.4");
    }
    
    //db.transaction(populateDB, errorCB, successCB); //DEBUG!!!

    //db.transaction(populateDB, errorCB, successCB);
    localStorage.setItem("appStarted", "true");

    checkConnection();

    var _user = JSON.parse(localStorage.getItem("user"));
    
    if (!_user) {
        CheckLoggedIn();
    }
    
   
    
    
    //GetConfig();

}

function getRecords(tx) {

    tx.executeSql("SELECT * FROM USERPRODUCTS ORDER BY datecreated DESC LIMIT 2", [], qGetUserProductsSuccess, errorCB);
    tx.executeSql("SELECT * FROM ORDERS ORDER BY orderdate DESC LIMIT 2", [], qGetOrdersSuccess, errorCB);
}

//Get config if we have a internet connection
var networkState;
function checkConnection() {

    networkState = navigator.connection.type;
    console.log('Connection type: ' + networkState);
}

function GetConfig() {

    if (networkState === Connection.UNKNOWN || networkState === Connection.NONE) {

        alert("Op dit moment heeft u geen internetverbinding.");

    } else {

        $.ajax({
            type: "POST",
            url: "http://api.xhibit.com/v2/softwares/api_getConfig/new/nld/json.json",
            data: {},
            dataType: "json",
            success: function (obj) {

                //Set the configuration
                console.log("GetConfig result");

                _platform = obj[0].platform;
                _base_url = obj[0].xhibit_base_url;
                _cover_upload_url = obj[0].xhibit_cover_upload_url;
                _photo_upload_url = obj[0].xhibit_photo_upload_url;
                _preview_upload_url = obj[0].xhibit_preview_upload_url;
                _register_url = obj[0].xhibit_register_url;
                _serverid = obj[0].xhibit_server_id;
                _serverip = obj[0].xhibit_server_ip;
                _servername = obj[0].xhibit_server_name;
                _shoppingcart_url = obj[0].xhibit_shoppingcart_url;
                _site_url = obj[0].xhibit_site_url;

                //alert("Success : " + response[0].xhibit_base_url);
                CheckLoggedIn();

            },
            error: function (response) {

            }
        });

    }
}

function CheckLoggedIn() {

    createQuery("SELECT * FROM USER", qGetUserLoginSuccess);
}

function qGetUserLoginSuccess(tx, results) {

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

    } else {

        //We don't have a user!

    }
}

function populateDB(tx) {

    tx.executeSql('DROP TABLE IF EXISTS USER');

    tx.executeSql("CREATE TABLE IF NOT EXISTS USER (id unique," +
            "email," +
            "password," +
            "firstname," +
            "lastname," +
            "adress," +
            "housenr," +
            "zipcode," +
            "city," +
            "country," +
            "delivery_name," +
            "delivery_adress," +
            "delivery_housenr," +
            "delivery_zipcode," +
            "delivery_city," +
            "delivery_country," +
            "user_id)");

    tx.executeSql('DROP TABLE IF EXISTS PRODUCTS');

    var productid = 330;
    var productdata = "{\"id\":\"330\",\"parent_id\":\"0\",\"category_id\":\"5368d3ad-a1a4-4be4-8bf6-40160a01bb0e\",\"name\":\"Fotoalbum 131 x 100 mm Geniet Mat MC\",\"preview\":\"\",\"cover\":true,\"bblock\":true,\"start_with\":\"spread\",\"use_spread\":true,\"min_page\":\"24\",\"max_page\":\"70\",\"stepsize\":\"4\",\"weight\":\"500\",\"page_width\":\"131\",\"page_height\":\"100\",\"page_depth\":\"-1\",\"page_crosscut\":\"-1\",\"page_bleed\":\"3\",\"paper_name\":\"Hoogglans\",\"product_paperweight_id\":\"12\",\"product_papertype_id\":\"3\",\"product_cover_id\":\"41\",\"product_color_id\":\"0\",\"product_size_id\":\"0\",\"product_shape_id\":\"0\",\"status\":\"A\",\"created\":\"2014-07-02 11:25:52\",\"modified\":\"2014-07-15 15:08:34\",\"ParentProduct\":{\"id\":null,\"parent_id\":null,\"category_id\":null,\"name\":null,\"preview\":null,\"cover\":null,\"bblock\":null,\"start_with\":null,\"use_spread\":null,\"min_page\":null,\"max_page\":null,\"stepsize\":null,\"weight\":null,\"page_width\":null,\"page_height\":null,\"page_depth\":null,\"page_crosscut\":null,\"page_bleed\":null,\"paper_name\":null,\"product_paperweight_id\":null,\"product_papertype_id\":null,\"product_cover_id\":null,\"product_color_id\":null,\"product_size_id\":null,\"product_shape_id\":null,\"status\":null,\"created\":null,\"modified\":null},\"ProductPaperweight\":{\"id\":\"12\",\"printer_id\":\"68\",\"name\":\"170 grs\",\"title\":\"170 grs\",\"description\":null,\"image\":null,\"code\":\"170 grs\",\"api_code\":\"170\",\"created\":null,\"modified\":null},\"ProductPapertype\":{\"id\":\"3\",\"printer_id\":\"68\",\"name\":\"Machine coated\",\"title\":\"Machine coated\",\"description\":\"Machine coated\",\"image\":\"\",\"code\":\"MC\",\"created\":\"2013-12-02 14:45:02\",\"modified\":\"2014-05-28 13:02:41\"},\"ProductCover\":{\"id\":\"41\",\"printer_id\":\"68\",\"name\":\"131 x 100 mm Geniet Mat\",\"title\":\"Geniet mat\",\"width\":\"131.00\",\"height\":\"100.00\",\"bleed\":\"3.00\",\"wrap\":\"0.00\",\"product_paperweight_id\":\"12\",\"product_papertype_id\":\"3\",\"product_finish_id\":\"1\",\"created\":\"2014-07-02 12:53:12\",\"modified\":\"2014-07-02 12:53:12\"},\"ProductColor\":{\"id\":null,\"printer_id\":null,\"name\":null,\"title\":null,\"description\":null,\"image\":null,\"code\":null,\"created\":null,\"modified\":null},\"ProductShape\":{\"id\":null,\"printer_id\":null,\"name\":null,\"title\":null,\"description\":null,\"image\":null,\"code\":null,\"created\":null,\"modified\":null},\"ProductSize\":{\"id\":null,\"printer_id\":null,\"name\":null,\"title\":null,\"description\":null,\"image\":null,\"code\":null,\"created\":null,\"modified\":null},\"PrinterProduct\":[{\"id\":\"86\",\"name\":\"Fotoalbum 131 x 100 mm Geniet Mat MC\",\"xml_name\":\"FA1310ST24LNM\",\"product_id\":\"330\",\"printer_id\":\"68\",\"product_cover_id\":\"41\",\"printer_product_cover_id\":\"13\",\"status\":\"A\",\"created\":\"2014-07-02 13:46:23\",\"modified\":\"2014-09-29 16:04:59\"}],\"ProductSingle\":[],\"ChildProduct\":[],\"Category\":[]}";
    var productthumb = "./assets/schriftje.png";

    tx.executeSql("CREATE TABLE IF NOT EXISTS PRODUCTS (id unique," +
            "thumb," +
            "data)");

    tx.executeSql("INSERT INTO PRODUCTS (id, thumb, data) VALUES(" +
            "'" + productid + "','" + productthumb + "','" + escape(productdata) + "')");

    tx.executeSql('DROP TABLE IF EXISTS USERPRODUCTS');

    tx.executeSql("CREATE TABLE IF NOT EXISTS USERPRODUCTS (id unique," +
            "guid," +
            "name," +
            "datecreated," +
            "productid," +
            "pagewidth," +
            "pageheight," +
            "pagebleed," +
            "usecover," +
            "coverwidth," +
            "coverheight," +
            "coverwrap," +
            "coverbleed," +
            "coverspine," +
            "minpages," +
            "maxpages," +
            "numpages," +
            "coverimg," +
            "price," +
            "pages," +
            "userProductID," + 
            "thumb)");
    
    tx.executeSql('DROP TABLE IF EXISTS PHOTOCOLLECTION');

    tx.executeSql("CREATE TABLE IF NOT EXISTS PHOTOCOLLECTION (id unique," +
            "guid," +
            "album_id," +
            "thumb," +
            "orig," +
            "origw," +
            "origh," +
            "origsrc)");
    
    tx.executeSql('DROP TABLE IF EXISTS ORDERS');

    tx.executeSql("CREATE TABLE IF NOT EXISTS ORDERS (id unique," +
            "userproductid," +
            "album_id," +
            "productname," +
            "producttitle," +
            "numpages," +
            "orderdate," +
            "orderstatus," +
            "albumprice," +
            "extrapagesprice," +
            "subtotal," +
            "shipping," +
            "totalprice," +
            "thumb)");

    /*
     tx.executeSql("INSERT INTO ORDERS (id, userproductid, productname, producttitle, numpages, orderdate, orderstatus, albumprice, extrapagesprice, subtotal, shipping, totalprice) VALUES(" +
     "'" + generateUUID() + "','1','Fotoboekje (15x15)','Mijn fotoalbum 1',24,'2014/10/09','verzonden','125.00','12.00','137.00','100.00','237.00')");
     
     tx.executeSql("INSERT INTO ORDERS (id, userproductid, productname, producttitle, numpages, orderdate, orderstatus, albumprice, extrapagesprice, subtotal, shipping, totalprice) VALUES(" +
     "'" + generateUUID() + "','2','Fotoboekje (10x15)','Mijn fotoalbum 2',24,'2014/10/04','in productie','99.95','0.00','99.95','10.00','109.95')");
     */
}

$(function () {
    $("#vieworders").click(function () {
        window.location.href = "myorders.html";
    });
});

$(function () {
    $("#openalbums").on("click", function () {
        window.location.href = "myprojects.html";
    });
});

$(function () {
    $("#createnewalbum").on("click", function () {
        window.location.href = "albumcreate.html";
    });
});