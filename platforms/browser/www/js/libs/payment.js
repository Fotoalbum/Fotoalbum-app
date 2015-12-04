var _status;
var _userfolderGUID;
var _userfolderNAME;
var _userproductID;
var filecount = 0;
var currentphoto = 0;
var fileSystem;
var progressbar;
var paymentresult = false;
var paymentmsg = "";
var paymentbody = "";
var uploaddone = false;
var win;

$(document).ready(function () {

    document.addEventListener("deviceready", onDeviceReady, true);

});

function onDeviceReady() {

    window.screen.lockOrientation("landscape");

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

    AddEventListeners();

    _productID = localStorage.getItem("currentproductID");
    _album = JSON.parse(localStorage.getItem("currentAlbum"));
    _user = JSON.parse(localStorage.getItem("user"));
    _userfolderGUID = generateUUID();
    _userfolderNAME = "Mobile uploads";

    $("#loadermsg").html("Je fotoalbum wordt opgeslagen...");
    
    _photocollection = new Array();

    createQuery("SELECT * FROM PHOTOCOLLECTION WHERE album_id='" + _album.guid + "'", qGetPhotosSuccess);

}

function qGetPhotosSuccess(tx, results) {

    var len = results.rows.length;

    for (var i = 0; i < len; i++) {
        var p = results.rows.item(i);
        var photo = {id: p.id, thumb: p.thumb, orig: p.orig, origw: p.origw, origh: p.origh, origsrc: p.origsrc};
        _photocollection.push(photo);
    }
    
    //Create a userproduct (if it does not excist yet?)
    SaveUserProduct();
    
    console.log("_photocollection: " + _photocollection.length);

}

function SaveUserProduct() {

    var photo_xml = "<root>";
    for (var x = 0; x < _photocollection.length; x++) {
        var p = _photocollection[x];
        var photo = "<photo id='" + p.id + "' " +
                "name='" + p.orig + "' " +
                "status='done' " +
                "folderID='" + _userfolderGUID + "' " +
                "folderName='" + _userfolderNAME + "' " +
                "origin='mobile' " +
                "userID='" + _user.user_id + "' " +
                "lowres='' " +
                "lowres_url='' " +
                "thumb='' " +
                "thumb_url='' " +
                "hires='' " +
                "hires_url='' " +
                "path='' " +
                "dateCreated='' " +
                "timeCreated='' " +
                "bytesize='' " +
                "fullPath='' " +
                ">" +
                "<exif/></photo>";
        photo_xml += photo;
    }
    photo_xml += "</root>";
    var pages_xml = "<root>";
    var spreadID;
    var spread;
    for (var i = 0; i < _album.pages.length; i++) {

        var page = _album.pages[i];
        var element;
        var nextpage = _album.pages[i + 1];
        var previouspage = _album.pages[i - 1];
        if (page.elements.length > 0) {
            element = page.elements[0];
        }

        switch (page.type) {
            case "coverback":
                spreadID = generateUUID();
                spread = "<spread " +
                        "spreadID='" + spreadID + "' " +
                        "width='" + (((parseFloat(_album.coverwidth) + parseFloat(_album.coverbleed)) * 2) + parseFloat(_album.spinewidth)) + "' " +
                        "height='" + (parseFloat(_album.coverheight) + (parseFloat(_album.coverbleed) * 2)) + "' " +
                        "totalWidth='" + (((parseFloat(_album.coverwidth) + parseFloat(_album.coverbleed)) * 2) + parseFloat(_album.spinewidth)) + "' " +
                        "totalHeight='" + (parseFloat(_album.coverheight) + (parseFloat(_album.coverbleed) * 2)) + "' " +
                        "singlepage='false' " +
                        "backgroundColor='-1' " +
                        "backgroundAlpha='1' " +
                        "version='1.0' " +
                        "platform='mobile' " +
                        "<pages><page pageID='" + page.id + "' " +
                        "spreadID='" + spreadID + "' " +
                        "width='" + page.width + "' " +
                        "height='" + page.height + "' " +
                        "pageType='" + page.type + "' " +
                        "type='" + page.type + "' " +
                        "pageWidth='" + page.width + "' " +
                        "pageHeight='" + page.height + "' " +
                        "horizontalBleed='" + page.bleed + "' " +
                        "verticalBleed='" + page.bleed + "' " +
                        "horizontalWrap='0' " +
                        "verticalWrap='0' " +
                        "pageNumber='" + page.label + "' " +
                        "backgroundColor='-1' " +
                        "backgroundAlpha='1' " +
                        "pageLeftRight='" + page.type + "' " +
                        "singlepage='false' " +
                        "singlepageFirst='false' " +
                        "singlepageLast='false' " +
                        "side=''>";
                if (element) {

                    spread += "<background id='" + generateUUID() + "' " +
                            "bytesize='' " +
                            "path='' " +
                            "fullPath='' " +
                            "origin='mobile' " +
                            "origin_type='' " +
                            "origin_ref='" + element.refid + "' " +
                            "originalWidth='" + element.origw + "' " +
                            "originalHeight='" + element.origh + "' " +
                            "x='" + element.refx + "' " +
                            "y='" + element.refy + "' " +
                            "width='" + element.refw + "' " +
                            "height='" + element.refh + "' " +
                            "hires='" + element.orig + "' " +
                            "hires_url='" + element.orig + "' " +
                            "lowres='' " +
                            "lowres_url='' " +
                            "thumb='' " +
                            "thumb_url='' " +
                            "fliphorizontal='0' " +
                            "imageFilter='' " +
                            "imageRotation='" + element.rotation + "' " +
                            "status='done'>" +
                            "<exif/></background></page>";
                } else {

                    spread += "</page>";
                }

//Add an empty spine page
                spread += "<page pageID='" + generateUUID() + "' " +
                        "spreadID='" + spreadID + "' " +
                        "width='" + _album.spinewidth + "' " +
                        "height='" + _album.coverheight + "' " +
                        "pageType='coverspine' " +
                        "type='coverspine' " +
                        "pageWidth='" + _album.spinewidth + "' " +
                        "pageHeight='" + _album.coverheight + "' " +
                        "horizontalBleed='0' " +
                        "verticalBleed='" + page.bleed + "' " +
                        "horizontalWrap='0' " +
                        "verticalWrap='0' " +
                        "pageNumber='coverspine' " +
                        "backgroundColor='-1' " +
                        "backgroundAlpha='1' " +
                        "pageLeftRight='coverspine' " +
                        "singlepage='false' " +
                        "singlepageFirst='false' " +
                        "singlepageLast='false' " +
                        "side=''>";
                break;
            case "coverfront":

                spread += "<page pageID='" + page.id + "' " +
                        "spreadID='" + spreadID + "' " +
                        "width='" + page.width + "' " +
                        "height='" + page.height + "' " +
                        "pageType='" + page.type + "' " +
                        "type='" + page.type + "' " +
                        "pageWidth='" + page.width + "' " +
                        "pageHeight='" + page.height + "' " +
                        "horizontalBleed='" + page.bleed + "' " +
                        "verticalBleed='" + page.bleed + "' " +
                        "horizontalWrap='0' " +
                        "verticalWrap='0' " +
                        "pageNumber='" + page.label + "' " +
                        "backgroundColor='-1' " +
                        "backgroundAlpha='1' " +
                        "pageLeftRight='" + page.type + "' " +
                        "singlepage='false' " +
                        "singlepageFirst='false' " +
                        "singlepageLast='false' " +
                        "side=''>" +
                        "<background id='" + generateUUID() + "' " +
                        "bytesize='' " +
                        "path='' " +
                        "fullPath='' " +
                        "origin='mobile' " +
                        "origin_ref='" + element.refid + "'",
                        "origin_type='' " +
                        "originalWidth='" + element.origw + "' " +
                        "originalHeight='" + element.origh + "' " +
                        "x='" + element.refx + "' " +
                        "y='" + element.refy + "' " +
                        "width='" + element.refw + "' " +
                        "height='" + element.refh + "' " +
                        "hires='" + element.orig + "' " +
                        "hires_url='" + element.orig + "' " +
                        "lowres='' " +
                        "lowres_url='' " +
                        "thumb='' " +
                        "thumb_url='' " +
                        "fliphorizontal='0' " +
                        "imageFilter='' " +
                        "imageRotation='" + element.rotation + "' " +
                        "status='done'>" +
                        "<exif/></background></page>" +
                        "</pages></elements></spread>";
                //Add the spread to the pages_xml
                pages_xml += spread;
                break;
            case "empty":

                if (page.side === "left") {
//Start a new spread
                    spreadID = generateUUID();
                    spread = "<spread " +
                            "spreadID='" + spreadID + "' " +
                            "width='" + (parseFloat(_album.pagewidth) + (parseFloat(_album.pagebleed) * 2)) + "' " +
                            "height='" + (parseFloat(_album.pageheight) + (parseFloat(_album.pagebleed) * 2)) + "' " +
                            "totalWidth='" + (parseFloat(_album.pagewidth) + (parseFloat(_album.pagebleed) * 2)) + "' " +
                            "totalHeight='" + (parseFloat(_album.pageheight) + (parseFloat(_album.pagebleed) * 2)) + "' " +
                            "singlepage='true' " +
                            "backgroundColor='-1' " +
                            "backgroundAlpha='1' " +
                            "version='1.0' " +
                            "platform='mobile' " +
                            "<pages>";
                } else {
//Last empty page, finish the pages_xml
                    pages_xml += "</root>";
                }
                break;
            case "page":

                if (page.side === "left") {

//Start a new spread
                    spreadID = generateUUID();
                    var singlepage = "false";
                    if (nextpage) {
                        if (nextpage.type === "empty") {
//lastpage
                            spread = "<spread " +
                                    "spreadID='" + spreadID + "' " +
                                    "width='" + (parseFloat(_album.pagewidth) + (parseFloat(_album.pagebleed) * 2)) + "' " +
                                    "height='" + (parseFloat(_album.pageheight) + (parseFloat(_album.pagebleed) * 2)) + "' " +
                                    "totalWidth='" + (parseFloat(_album.pagewidth) + (parseFloat(_album.pagebleed) * 2)) + "' " +
                                    "totalHeight='" + (parseFloat(_album.pageheight) + (parseFloat(_album.pagebleed) * 2)) + "' " +
                                    "singlepage='true' ";
                            singlepage = "true";
                        } else {
                            spread = "<spread " +
                                    "spreadID='" + spreadID + "' " +
                                    "width='" + ((parseFloat(_album.pagewidth) + parseFloat(_album.pagebleed)) * 2) + "' " +
                                    "height='" + (parseFloat(_album.pageheight) + (parseFloat(_album.pagebleed) * 2)) + "' " +
                                    "totalWidth='" + ((parseFloat(_album.pagewidth) + parseFloat(_album.pagebleed)) * 2) + "' " +
                                    "totalHeight='" + (parseFloat(_album.pageheight) + (parseFloat(_album.pagebleed) * 2)) + "' " +
                                    "singlepage='false' ";
                            singlepage = "false";
                        }
                    }

                    spread += "backgroundColor='-1' " +
                            "backgroundAlpha='1' " +
                            "version='1.0' " +
                            "platform='mobile' " +
                            "<pages><page pageID='" + page.id + "' " +
                            "spreadID='" + spreadID + "' " +
                            "width='" + page.width + "' " +
                            "height='" + page.height + "' " +
                            "pageType='" + page.type + "' " +
                            "type='" + page.type + "' " +
                            "pageWidth='" + page.width + "' " +
                            "pageHeight='" + page.height + "' " +
                            "horizontalBleed='" + page.bleed + "' " +
                            "verticalBleed='" + page.bleed + "' " +
                            "horizontalWrap='0' " +
                            "verticalWrap='0' " +
                            "pageNumber='" + page.label + "' " +
                            "backgroundColor='-1' " +
                            "backgroundAlpha='1' " +
                            "pageLeftRight='" + page.type + "' " +
                            "singlepage='" + singlepage + "' " +
                            "singlepageFirst='false' " +
                            "singlepageLast='" + singlepage + "' " +
                            "side=''>" +
                            "<background id='" + generateUUID() + "' " +
                            "bytesize='' " +
                            "path='' " +
                            "fullPath='' " +
                            "origin='mobile' " +
                            "origin_ref='" + element.refid + "'",
                            "origin_type='' " +
                            "originalWidth='" + element.origw + "' " +
                            "originalHeight='" + element.origh + "' " +
                            "x='" + element.refx + "' " +
                            "y='" + element.refy + "' " +
                            "width='" + element.refw + "' " +
                            "height='" + element.refh + "' " +
                            "hires='" + element.orig + "' " +
                            "hires_url='" + element.orig + "' " +
                            "lowres='' " +
                            "lowres_url='' " +
                            "thumb='' " +
                            "thumb_url='' " +
                            "fliphorizontal='0' " +
                            "imageFilter='' " +
                            "imageRotation='" + element.rotation + "' " +
                            "status='done'>" +
                            "<exif/></background></page>";
                } else {

                    var singlepage = "false";
                    if (previouspage) {
                        if (previouspage.type === "empty") {
                            singlepage = "true";
                        }
                    }

                    spread += "<page pageID='" + page.id + "' " +
                            "spreadID='" + spreadID + "' " +
                            "width='" + page.width + "' " +
                            "height='" + page.height + "' " +
                            "pageType='" + page.type + "' " +
                            "type='" + page.type + "' " +
                            "pageWidth='" + page.width + "' " +
                            "pageHeight='" + page.height + "' " +
                            "horizontalBleed='" + page.bleed + "' " +
                            "verticalBleed='" + page.bleed + "' " +
                            "horizontalWrap='0' " +
                            "verticalWrap='0' " +
                            "pageNumber='" + page.label + "' " +
                            "backgroundColor='-1' " +
                            "backgroundAlpha='1' " +
                            "pageLeftRight='" + page.type + "' " +
                            "singlepage='" + singlepage + "' " +
                            "singlepageFirst='" + singlepage + "' " +
                            "singlepageLast='false' " +
                            "side=''>" +
                            "<background id='" + generateUUID() + "' " +
                            "bytesize='' " +
                            "path='' " +
                            "fullPath='' " +
                            "origin='mobile' " +
                            "origin_ref='" + element.refid + "'",
                            "origin_type='' " +
                            "originalWidth='" + element.origw + "' " +
                            "originalHeight='" + element.origh + "' " +
                            "x='" + element.refx + "' " +
                            "y='" + element.refy + "' " +
                            "width='" + element.refw + "' " +
                            "height='" + element.refh + "' " +
                            "hires='" + element.orig + "' " +
                            "hires_url='" + element.orig + "' " +
                            "lowres='' " +
                            "lowres_url='' " +
                            "thumb='' " +
                            "thumb_url='' " +
                            "fliphorizontal='0' " +
                            "imageFilter='' " +
                            "imageRotation='" + element.rotation + "' " +
                            "status='done'>" +
                            "<exif/></background></page>" +
                            "</pages></elements></spread>";
                    pages_xml += spread;
                }
                break;
        }
    }

    var userprodid;

    if (_album.userProductID !== -1) {
        userprodid = _album.userProductID;
    }

    var postdata = {"UserProduct": {
            "id": userprodid,
            "pages_xml": pages_xml,
            "photo_xml": photo_xml,
            "user_id": _user.user_id,
            "product_id": _album.productid,
            "numpages": _album.numpages,
            "name": _album.name,
            "platform": "mobile",
            "shop_price": _album.price,
            "folder_data": "{guid:'" + _userfolderGUID + "',name:'" + _userfolderNAME + "'}"
        }
    };

    $.ajax({
        url: "http://api.xhibit.com/v2/softwares/api_saveUserProductById.json",
        data: postdata,
        type: "POST",
        cache: false,
        dataType: "json",
        success: function (response) {

            if (response.UserProduct) {

                //Update the _album with the userproduct_id from the server
                if (!userprodid) {

                    _album.userProductID = response.UserProduct.id;

                    localStorage.setItem("userProductID", _album.userProductID);
                    //Save the album
                    createQuery("UPDATE USERPRODUCTS SET " +
                            "userProductID=" + _album.userProductID +
                            " WHERE id='" + _album.id + "'",
                            qUpdateAlbumSuccess
                            );
                } else {

                    StartUpload();
                }


            } else {
                alert("Fout bij opslaan, probeer opnieuw of neem contact op met de helpdesk");
            }
        },
        error: function (err) {
            alert("Fout bij opslaan, probeer opnieuw of neem contact op met de helpdesk");
        }
    });
}

function qUpdateAlbumSuccess(tx, results) {

    console.log(results);

    StartUpload();

}

var paymentresult = false;
function LoadStart(event) {

    console.log(event.url);

}
function LoadStop(event) {

    var result = event.url.toString();

    if (result.indexOf("pay_result") !== -1) {

        win.executeScript({
            code: "document.querySelector('.PaymentResult').innerHTML;"
        }, function (values) {
            //Show the payment result

            if (values) {

                //Read the result of the payment
                var r = JSON.parse(values);
                paymentresult = r.panel_status;
                paymentmsg = r.panel_heading;
                paymentbody = r.panel_body;
                
                win.removeEventListener("loadstop", LoadStop);
                win.removeEventListener("exit", LoadExit);

                //Check if uploading allready was finished
                if (uploaddone) {
                    
                    $("#myloader_msg").html(paymentbody);
                    
                    if (paymentresult === "success") {
                        window.location.href = "myorders.html";
                    } else {
                        //Wait a bit longer, but also show a button to do it again if the payment has failed
                        if (paymentresult === "error") {
                            //Show the button
                            $("btnPayment").removeClass("hidden");
                        }
                    }
                } else {
                    if (paymentresult === "success") {
                        $("#myloader_msg").html(paymentbody + " Nog even wachten tot de upload klaar is...");
                    } else {
                        //Wait a bit longer, but also show a button to do it again if the payment has failed
                        if (paymentresult === "error") {
                            //Show the button
                            $("#myloader_msg").html(paymentbody + " (Wel even wachten tot upload klaar is...)");
                            $("btnPayment").removeClass("hidden");
                        }
                    }
                }

                win.close();
            }
        });
    }
}

function LoadExit(event) {
    /*
     if (win) {
     win.removeEventListener("loadstop", LoadStop);
     win.removeEventListener("exit", LoadExit);
     win.close();
     }
     */
}

function StartUpload() {

    //Start the upload now
    currentphoto = 0;
    filecount = _photocollection.length;

    var image = _photocollection[currentphoto];
    var filePath = image.orig;

    $("btnWaitForNetwork").removeClass("hidden");
    $("btnWaitForNetwork").addClass("hidden");

    //TODO CHECK FOR WIFI!!
    var network = navigator.connection.type;

    if (network !== "wifi" && network !== "ethernet" && network !== "4g") {

        if (network === "unknown" || network === "none") {
            network = "niet verbonden";
        }
        
        BootstrapDialog.show({
            title: "Trage internetverbinding",
            message: "Je verbinding met internet is op dit moment: " + network + ".<br/>Dit kan voor hoge kosten zorgen en bovendien erg langzaam werken.<br/>Wil je wachten met uploaden tot je een wifi of LAN verbinding hebt?",
            buttons: [{
                    label: 'JA',
                    action: function (dialog) {
                        WaitForWifiConnection();
                        dialog.close();
                    }
                }, {
                    label: 'NEE',
                    action: function (dialog) {
                        ContinueUploadAndPayment(filePath);
                        dialog.close();
                    }
                }]
        });

    } else {

        ContinueUploadAndPayment(filePath);
    }


}

function WaitForWifiConnection() {

    //Show a button to continue the upload when we have wifi or ethernet
    $("btnWaitForNetwork").removeClass("hidden");

}

$(function () {
    $('#btnWaitForNetwork').click(function () {
        StartUpload();
    });
});


function ContinueUploadAndPayment(filePath) {

    $("#myloader_msg").html("Je foto's worden nu geupload...");

    $("#myloader_progress").removeClass("hidden");

    $(".progress-bar").css("width", "0%").attr("aria-valuenow", 0).html("0%");

    window.resolveLocalFileSystemURL(filePath, gotFileEntry, fail);
    var d = new Date();
    var n = d.getTime();

    win = window.open("http://new.xhibit.com/shop/add/" + _album.userProductID + "/" + _user.user_id + "?time=" + n, "_blank", "location=no,toolbar=no");
    win.addEventListener("loadstop", LoadStop);
    win.addEventListener("exit", LoadExit);
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

function gotFS(_fileSystem) {

    fileSystem = _fileSystem;
}

var gotFileEntry = function (fileEntry) {

    //console.log("got image file entry: " + fileEntry.fullPath);

    var photo = _photocollection[currentphoto];

    var xhr = new XMLHttpRequest();
    xhr.open('GET', fileEntry.nativeURL, true);
    xhr.responseType = 'blob';
    xhr.onloadend = function (e) {
        _doUpload(this.response, photo.id, fileEntry);
    };
    xhr.send();
};

function _doUpload(f, guid, file)
{

    //Upload the file
    var photo = _photocollection[currentphoto];

    var data = {
        dbid: false,
        guid: guid,
        guid_folder: _userfolderGUID,
        name_folder: _userfolderNAME,
        user_id: _user.user_id,
        dir_array: _user.user_id + "/" + _userfolderGUID,
        platform: "mobile",
        source: file.name,
        bytesize: f.size,
        width: photo.origw,
        height: photo.origh,
        exif_info: "<exif/>",
        mirrorit: false,
        rotateit: 0
    };

    var fd = new FormData();
    fd.append('file', f);
    fd.append('data', JSON.stringify(data));

    $.ajax({
        url: "http://api.xhibit.com/v2/softwares/upload_file_html.json",
        type: "POST",
        data: fd,
        // options to tell jQuery not to process data or worry about content-type
        cache: false,
        contentType: false,
        processData: false,
        crossDomain: true,
        // image is uploaded
        success: function (res) {

            if (res.Document.result === 'OK') {

                filecount--;

                if (filecount === 0) {

                    uploaddone = true;

                    $("#myloader_progress").addClass("hidden");

                    $("#myloader_msg").html("Uploaden is klaar.<br/>Wachten op status betaling...");

                    //Check the status of the payment
                    //If it is done, then proceed to the orderpage
                    if (paymentresult === "success") {
                        $("#myloader_msg").html(paymentbody);
                        window.location.href = "myorders.html";
                    } else {
                        //Wait a bit longer, but also show a button to do it again if the payment has failed
                        if (paymentresult === "error") {
                            //Show the button
                            $("#myloader_msg").html(paymentbody);
                            $("btnPayment").removeClass("hidden");
                        } else if (paymentresult === "pending") {
                            $("#myloader_msg").html(paymentbody);
                            window.location.href = "myorders.html";
                        }
                    }

                } else {

                    currentphoto++;

                    var image = _photocollection[currentphoto];
                    var filePath = image.orig;

                    var percentage = Math.round((parseFloat(currentphoto) / parseFloat(_photocollection.length)) * 100);
                    $(".progress-bar").css("width", percentage + "%").attr("aria-valuenow", percentage).html(percentage + "%");

                    window.resolveLocalFileSystemURL(filePath, gotFileEntry, fail);

                }
            }
        },
        // something went horribly wrong
        error: function (jqXHRdata, textStatusdata, errorThrowndata) {

            console.log('Connection lost, reconnecting...');

            //$("#upload-progress .progress-bar").addClass('progress-bar-danger');
            // image not uploaded, add to queue
            //uploadQueue.push(guid);
            //uploadImages(user_id, platform);
        }
    });
}
;

$(function () {
    $('#btnPayment').click(function () {

        paymentresult = "initialize";

        $("btnPayment").removeClass("hidden");
        $("btnPayment").addClass("hidden");

        $("#myloader_msg").html("Uploaden is klaar.<br/>Wachten op status betaling...");

        var d = new Date();
        var n = d.getTime();

        win = window.open("http://new.xhibit.com/shop/add/" + _album.userProductID + "/" + _user.user_id + "?time=" + n, "_blank", "location=no,toolbar=no");
        win.addEventListener("loadstop", LoadStop);
        win.addEventListener("exit", LoadExit);

    });
});

function fail(evt) {
    console.log(evt);
}

function onerror(message) {
    console.error(message);
}






