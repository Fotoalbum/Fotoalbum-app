var db;
var _album;
var _project_to_delete;
var _boxw = 0;
var _boxh = 0;
var _zoom = 0;
var _userLoggedIn = false;
var _menuopen = 0;
var _query = "";
var _onsucces;
var _platform = "";
var _base_url = "";
var _cover_upload_url = "";
var _photo_upload_url = "";
var _preview_upload_url = "";
var _register_url = "";
var _serverid = "";
var _serverip = "";
var _servername = "";
var _shoppingcart_url = "";
var _site_url = "";
var _photocollection;
var _numpages = 0;
var _productID;
var _minphotos;

function onDevicePause() {

}

function onDeviceResume() {

}

function onDeviceOnline() {
    //alert("Je internetverbinding is online.");
}

function onDeviceOffline() {
    //alert("Je internetverbinding is offline. Probeer opnieuw of wacht tot de verbinding is hersteld.");
}

function onDeviceBackbutton() {

    history.back();
}

function onDeviceMenuButton() {

}

function onDeviceBatteryLow() {
    //alert("Je batterij is bijna leeg. Sla je project op en sluit een lader aan.");
}

function onDeviceBatteryCritical() {
    //alert("Je batterij is nu helemaal leeg. Sla je project snel op en sluit een lader aan.");
}

function createQuery(query, onSuccess) {

    _query = query;
    _onsucces = onSuccess;

    var db = window.openDatabase("Fotoalbum", "", "Fotoalbum DB", 1000000);
    db.transaction(runQuery);

}

function runQuery(tx) {
    tx.executeSql(_query, [], _onsucces, errorCB);
    _query = "";
    _onsucces = null;
}

function errorCB(err) {
    alert("Error processing SQL: " + err.code);
}

function AddEventListeners() {

    if (window.device.platform === 'Android') {
        document.addEventListener("menubutton", onDeviceMenuButton, false);
        document.addEventListener("backbutton", onDeviceBackbutton, false);
    }

    document.addEventListener("pause", onDevicePause, false);
    document.addEventListener("resume", onDeviceResume, false);
    document.addEventListener("online", onDeviceOnline, false);
    document.addEventListener("offline", onDeviceOffline, false);
}

function CreateNavigation() {

    $('#push').click(function () {

        var val = "0px";
        if (_menuopen === 1) {
            _menuopen = 0;
            val = "0px";

        } else {
            _menuopen = 1;
            val = '250px';
        }

        $('#slide-menu').animate({
            left: val
        }, 300);
        $('#page-content').animate({
            left: val
        }, 300);
    });
}

function successCB() {
    console.log("success!");
}

// Create new album menu click
$(function () {
    $('#btnHome').click(function () {
        window.location.href = "index.html";
    });
});

// Create new album menu click
$(function () {
    $('#btnCreateAlbum').click(function () {
        window.location.href = "albumcreate.html";
    });
});

$(function () {
    $('#btnCloseApp').click(function () {
        navigator.app.exitApp();
    });
});

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
}

function CalculatePrice(_price_method, _shop_product_price, _shop_page_price, _minPages, _numPages) {

    /* Price methods
     
     1 Fixed price (product_price)
     2 Numpages * page_price
     3 Variabel // not used 
     4 Salesprice (product_price) + ((numpages - min_page) * page_price)
     5 
     ++ HANDLING (handling_price);
     */

    var result = "";
    switch (_price_method) {
        case "1":
            result = _shop_product_price.toString();
            break;
        case "2":
            var pageprice = parseFloat(_shop_page_price);
            var totalPrice = (_numPages * pageprice) + (_price_handling * _var_rate);
            result = totalPrice.toString();
            break;
        case "3":
            //--
            break;
        case "4":
            var extra_pages = _numPages - _minPages;
            var extra_price = extra_pages * parseFloat(_shop_page_price);
            totalPrice = parseFloat(_shop_product_price) + extra_price;
            result = totalPrice.toString();
            break;
    }


    return result;

}

function DeleteProjectFromDatabase(guid) {

    createQuery("DELETE FROM USERPRODUCTS WHERE guid='" + guid + "'", onDeleteSucces);
}

function onDeleteSucces(result) {

    console.log(result);

    //Remove the item from the list
    if (_project_to_delete) {
        $("#" + _project_to_delete).remove();
        _project_to_delete = null;
    }

}

function GetProjectFromDatabase(guid) {

    createQuery("SELECT * FROM USERPRODUCTS WHERE guid='" + guid + "'", onGetProjectSuccess);
}

function onGetProjectSuccess(tx, results) {

    var item = results.rows.item(0);

    _album = new Album();

    _album.setProps(item.id,
            item.guid,
            item.name, //name
            item.datecreated, // date created
            item.productid, //Product ID
            item.pagewidth, // Width
            item.pageheight, // Height
            item.pagebleed, //Bleed
            item.usecover, //useCover
            item.coverwidth, //Cover width
            item.coverheight, //Cover height
            item.coverwrap, //Cover wrap
            item.coverbleed, //Cover bleed
            item.coverspine, //Spine width TODO!!
            item.minpages, //min pages
            item.maxpages, //max pages
            item.numpages, //numpages
            "", //CoverIMG
            item.price,
            jQuery.parseJSON(unescape(item.pages)),
            item.userProductID,
            item.thumb);

    localStorage.setItem("currentAlbumID", item.guid);
    localStorage.setItem("userProductID", item.userProductID);
    localStorage.setItem("currentAlbum", JSON.stringify(_album));
    localStorage.setItem("status", "created");

    var w = $(window).width();

    var maxw = (w - 70) / 4;

    _boxw = maxw;
    _zoom = maxw / _album.pagewidth;
    _boxh = _album.pageheight * _zoom;

    localStorage.setItem("boxw", _boxw);
    localStorage.setItem("boxh", _boxh);
    localStorage.setItem("zoom", _zoom);

    window.location.href = "reorderphotos.html";
}

$(function () {
    $("#btnMyProjects").on("click", function () {
        window.location.href = "myprojects.html";
    });
});

var _action = "";
function UpdatePagesInDatabase(album_id, action) {

    if (_album) {
        
        if (action) {
            _action = action;
        } else {
            _action = "";
        }
        
        var pg = escape(JSON.stringify(_album.pages, null, 2));
        createQuery("UPDATE USERPRODUCTS SET pages='" + pg + "', thumb='" + _album.thumb + "' WHERE guid='" + _album.guid + "'", onUpdateProjectSuccess);

    }
}

function onUpdateProjectSuccess(tx, results) {
    
    console.log("Album saved");
    
    //Save the album again
    localStorage.setItem("currentAlbumID", _album.guid);
    localStorage.setItem("currentAlbum", JSON.stringify(_album));
        
    switch (_action) {
        case "projects":
            _action = "";
            window.location.href = "myprojects.html";
            break;
        case "editpages":
            _action = "";
            window.location.href = "editpage.html";
            break;
    }
}

function GetPhotoFromAlbum(id) {

    var photo;

    if (_photocollection) {
        for (var i = 0; i < _photocollection.length; i++) {
            if (_photocollection[i].id === id) {
                //Found it, return the photo info
                photo = _photocollection[i];
                break;
            }
        }
    }

    return photo;
}

function calculateImageSize(boxW, boxH, imageW, imageH) {

    var found = false;
    var scale = 0;
    var newW, newH, offsetX, offsetY;
    while (!found) {
        newW = scale * imageW;
        newH = scale * imageH;
        if (newW >= boxW && newH >= boxH) {
            if (newW >= newH) {
                newH = boxH;
                newW = (newH / imageH) * imageW;
            } else {
                newW = boxW;
                newH = (newW / imageW) * imageH;
            }
            offsetX = (boxW - newW) / 2;
            offsetY = (boxH - newH) / 2;
            found = true;
        }
        scale += .001;
    }

    return new Array(newW, newH, offsetX, offsetY);
}