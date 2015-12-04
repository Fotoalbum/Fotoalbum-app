var _status;
var _containerW;
var _containerH;
var _cscreenw;
var _cscreenh;
var _currentPage = 0;
var dest_width = 0;
var dest_height = 0;
var canvas;
var context;
var _rotation = 0;
var _zoom = 1;
var _photocounter = 0;
var _currentOrientation = "portrait";
var _currentPageLeft = 0;
var _currentPageRight = 0;
var _currentImgSource = null;
var _manualupdate = false;

$(document).ready(function () {

    document.addEventListener("deviceready", onDeviceReady, true);

    _productID = localStorage.getItem("currentproductID");
    
    _album = JSON.parse(localStorage.getItem("currentAlbum"));
    _status = localStorage.getItem("status");
    _currentPage = 0;

    $("#btnPreviousPage").prop("disabled", true);
    
    _photocollection = new Array();

    createQuery("SELECT * FROM PHOTOCOLLECTION WHERE album_id='" + _album.guid + "'", qGetPhotosSuccess);

});

function qGetPhotosSuccess(tx, results) {

    var len = results.rows.length;

    for (var i = 0; i < len; i++) {
        var p = results.rows.item(i);
        var photo = {id: p.id, thumb: p.thumb, orig: p.orig, origw: p.origw, origh: p.origh, origsrc: p.origsrc};
        _photocollection.push(photo);
    }

    console.log("_photocollection: " + _photocollection.length);

}

function DrawPage() {

    $("#pagebypage").empty();
    
    $("#pagenumberleft").html("");
    $("#pagenumberright").html("");
    
    //Check if the _currentPage is a left or a right page
    if (_currentPage % 2 === 1) {
        //This is a right page
        if (_currentPage - 1 === 0) {
            _currentPageLeft = null;
        } else {
            _currentPageLeft = _currentPage - 1;
        }
        _currentPageRight = _currentPage;
    } else { //This is a left page
        if (_currentPage === 0) {
            _currentPageLeft = null;
        } else {
            _currentPageLeft = _currentPage;
        }
        _currentPageRight = _currentPage + 1;
    }

    var pageholderLeft = "<div class='pageholderLeft'></div>";
    var pageholderRight = "<div class='pageholderRight'></div>";
    var spread = "<div class='spread'>";
    spread += pageholderLeft + pageholderRight + "</div>";
    
    $("#pagebypage").append(spread);
    
    $(".spread").css("width", dest_width * 2 + "px");
    $(".spread").css("height", dest_height + "px");
    $(".spread").css("margin-left", "auto");
    $(".spread").css("margin-right", "auto");
    
    $(".pageholderLeft").css("width", dest_width + "px");
    $(".pageholderLeft").css("height", dest_height + "px");
    $(".pageholderRight").css("width", dest_width + "px");
    $(".pageholderRight").css("height", dest_height + "px");
    
    var imgsourceLeft = null;
    var imgsourceRight = null;
    if (!_currentPageLeft) { // This is the coverback,

        $(".pageholderLeft").css("background-color", "#FFFFFF");
        //Add the fotoalbum logo
        var fa = new Image();
        fa.id = "coverbackLogo";
        fa.src = "./assets/logo.jpg";
        $(".pageholderLeft").append(fa);
        $("#coverbackLogo").css("width", dest_width / 4);
        $("#coverbackLogo").css("height", dest_width / 4);
        
    } else {

        if (_album.pages[_currentPageLeft].elements &&
                _album.pages[_currentPageLeft].elements.length > 0 &&
                _album.pages[_currentPageLeft].type !== "empty") {

            imgsourceLeft = _album.pages[_currentPageLeft].elements[0];
            var photo = GetPhotoFromAlbum(_album.pages[_currentPageLeft].elements[0].refid);
            var imgLeft = new Image();
            imgLeft.id = imgsourceLeft.id;
            imgLeft.src = photo.origsrc;
            $(".pageholderLeft").append(imgLeft);
            
        } else {

            //Check if this is an empty page
            if (_album.pages[_currentPageLeft].type === "empty") {
                $(".pageholderLeft").css("background-color", "#EAEAEA");
                $(".pageholderLeft").html("Binnenzijde omslag");
            } else {
                //TODO Show an empty page with ADD PHOTO button

            }
        }

        if (!imgsourceLeft) {

            //Remove the selection from this page and add Add Photo button
            $(".pageholderLeft").css("border", "2px #D2D2D2 dashed");
            $(".pageholderLeft").css("outline", "none");
            
        } else {

            var pictureLeft = $("#" + imgsourceLeft.id);
            pictureLeft.guillotine({
                width: dest_width,
                height: dest_height,
                eventOnChange: 'onChange',
                init: {
                    x: imgsourceLeft.refx,
                    y: imgsourceLeft.refy,
                    scale: imgsourceLeft.refscale,
                    angle: imgsourceLeft.rotation
                }
            });
            pictureLeft.on('onChange', function (ev, data, action) {

                if (_manualupdate === false) {

                    imgsourceLeft.refw = data.w;
                    imgsourceLeft.refh = data.h;
                    imgsourceLeft.refx = data.x;
                    imgsourceLeft.refy = data.y;
                    imgsourceLeft.refscale = data.scale;
                    imgsourceLeft.rotation = data.angle;

                    _currentImgSource = imgsourceLeft;

                    //Set selection to this page
                    $(".pageholderLeft").css("border", "none");
                    $(".pageholderLeft").css("outline", "2px #FFFF00 solid");
                    $(".pageholderRight").css("border", "2px #D2D2D2 dashed");
                    $(".pageholderRight").css("outline", "none");

                    UpdatePagesInDatabase(_album.guid);

                }
            });
        }
    }

    if (_album.pages[_currentPageRight].elements &&
            _album.pages[_currentPageRight].elements.length > 0 &&
            _album.pages[_currentPageRight].type !== "empty") {

        imgsourceRight = _album.pages[_currentPageRight].elements[0];
        var photo = GetPhotoFromAlbum(_album.pages[_currentPageRight].elements[0].refid);
        var imgRight = new Image();
        imgRight.id = imgsourceRight.id;
        imgRight.src = photo.origsrc;
        $(".pageholderRight").append(imgRight);
    } else {

        //Check if this is an empty page
        if (_album.pages[_currentPageRight].type === "empty") {
            $(".pageholderRight").css("background-color", "#EAEAEA");
            $(".pageholderRight").html("Binnenzijde omslag");
        } else {
            //TODO Show an empty page with ADD PHOTO button

        }

    }

    if (!imgsourceRight) {

        //Remove the selection from this page and add Add Photo button
        $(".pageholderRight").css("border", "2px #D2D2D2 dashed");
        $(".pageholderRight").css("outline", "none");
        if (imgsourceLeft) {
            //Set the selection to the left image
            $(".pageholderLeft").css("border", "none");
            $(".pageholderLeft").css("outline", "2px #FFFF00 solid");
        }

    } else {

        var pictureRight = $("#" + imgsourceRight.id);
        pictureRight.guillotine({
            width: dest_width,
            height: dest_height,
            eventOnChange: 'onChange',
            init: {
                x: imgsourceRight.refx,
                y: imgsourceRight.refy,
                scale: imgsourceRight.refscale,
                angle: imgsourceRight.rotation
            }
        });
        pictureRight.on('onChange', function (ev, data, action) {

            if (_manualupdate === false) {

                imgsourceRight.refw = data.w;
                imgsourceRight.refh = data.h;
                imgsourceRight.refx = data.x;
                imgsourceRight.refy = data.y;
                imgsourceRight.refscale = data.scale;

                _currentImgSource = imgsourceRight;
                //Set selection to this page
                $(".pageholderRight").css("border", "none");
                $(".pageholderRight").css("outline", "2px #FFFF00 solid");
                $(".pageholderLeft").css("border", "2px #D2D2D2 dashed");
                $(".pageholderLeft").css("outline", "none");

                UpdatePagesInDatabase(_album.guid);
            }
        });
    }

    $("#btnNextPage").css("top", 30 + (dest_height / 2) + "px");
    $("#btnPreviousPage").css("top", 30 + (dest_height / 2) + "px");
    
    $("#btnNextPage").prop("disabled", false);
    $("#btnPreviousPage").prop("disabled", false);
    
    var labelLeft = "";
    var labelRight = "";
    if (_currentPageLeft) {
        labelLeft = _album.pages[_currentPageLeft].label;
    } else {
        labelLeft = "Achterkant";
    }

    if (_currentPageRight) {
        labelRight = _album.pages[_currentPageRight].label;
    }
    
    $("#pagenumberlabels").css("width", (dest_width * 2) + "px");
    $("#pagenumberlabels").css("margin-left", "auto");
    $("#pagenumberlabels").css("margin-right", "auto");
    
    $("#pagenumberleft").html(labelLeft);
    $("#pagenumberright").html(labelRight);
    
    if (_currentPage === 0) {
        $("#btnPreviousPage").prop("disabled", true);
    }

    if (_currentPage === _album.pages.length - 2) {
        $("#btnNextPage").prop("disabled", true);
    }

    if (imgsourceRight) {
        _currentImgSource = imgsourceRight;
    } else {
        _currentImgSource = imgsourceLeft;
    }

}

function onDeviceReady() {

    //window.screen.unlockOrientation();
    window.screen.lockOrientation("landscape");
    _currentOrientation = "landscape";
    // Listen for orientation changes
    /*
     window.addEventListener("orientationchange", function () {
     
     //console.log(window.screen.orientation);
     
     switch (window.screen.orientation) {
     case "portrait":
     if (_currentOrientation !== "portrait") {
     _currentOrientation = "portrait";
     setTimeout("SetView()", 100);
     }
     break;
     case "portrait-primary":
     if (_currentOrientation !== "portrait") {
     _currentOrientation = "portrait";
     setTimeout("SetView()", 100);
     }
     break;
     case "portrait-secondary":
     if (_currentOrientation !== "portrait") {
     _currentOrientation = "portrait";
     setTimeout("SetView()", 100);
     }
     break;
     case "landscape":
     if (_currentOrientation !== "landscape") {
     _currentOrientation = "landscape";
     setTimeout("SetView()", 100);
     }
     break;
     case "landscape-primary":
     if (_currentOrientation !== "landscape") {
     _currentOrientation = "landscape";
     setTimeout("SetView()", 100);
     }
     break;
     case "landscape-secondary":
     if (_currentOrientation !== "landscape") {
     _currentOrientation = "landscape";
     setTimeout("SetView()", 100);
     }
     break;
     }
     }, false);
     */

    setTimeout("SetView()", 500);
    
    AddEventListeners();
}

function SetView() {

    //console.log(window.screen.width + " | " + window.screen.height);

    switch (_currentOrientation) {

        case "portrait":

            dest_width = window.screen.width - 40;
            _zoom = dest_width / _album.pagewidth;
            dest_height = _album.pageheight * _zoom;
            $("#pagebypage").width = window.screen.width;
            $("#pagebypage").height = window.screen.height - 120;
            $("#pagebypage").css("width", window.screen.width + "px");
            $("#pagebypage").css("height", (window.screen.height - 120) + "px");
            break;

        case "landscape":

            if (window.device.platform === 'Android') {

                dest_height = window.screen.height - 140;
                _zoom = dest_height / _album.pageheight;
                dest_width = _album.pagewidth * _zoom;
                $("#pagebypage").width = window.screen.width;
                $("#pagebypage").height = window.screen.height - 80;
                $("#pagebypage").css("width", window.screen.width + "px");
                $("#pagebypage").css("height", (window.screen.height - 80) + "px");
            } else {

                dest_height = window.screen.width - 140;
                _zoom = dest_height / _album.pageheight;
                dest_width = _album.pagewidth * _zoom;
                $("#pagebypage").width = window.screen.height;
                $("#pagebypage").height = window.screen.width - 80;
                $("#pagebypage").css("width", window.screen.height + "px");
                $("#pagebypage").css("height", (window.screen.width - 80) + "px");
            }
            break;
    }

    //console.log("dest: " + dest_width + " | " + dest_height);
    CheckSizeAndPosition();
}

function CheckSizeAndPosition() {

    var saverequired = false;
    for (var x = 0; x < _album.pages.length; x++) {

        $("#calcdiv").empty();
        var page = _album.pages[x];
        if (page.elements && page.elements.length > 0) {
            var element = page.elements[0];
            if (element.boxw === 0) {

                saverequired = true;
                element.boxw = dest_width;
                element.boxh = dest_height;
                var img = new Image();
                img.id = "calc" + element.id;
                var photo = GetPhotoFromAlbum(element.refid);
                img.src = photo.origsrc;
                $("#calcdiv").append(img);
                var refimg = $("#calc" + element.id);
                refimg.guillotine({
                    width: dest_width,
                    height: dest_height
                });
                refimg.guillotine("center");
                refimg.guillotine("fit");
                var data = refimg.guillotine('getData');
                element.refw = data.w;
                element.refh = data.h;
                element.refx = data.x;
                element.refy = data.y;
                element.refscale = data.scale;
                //console.log(element);
            }
        }
    }

    $("#calcdiv").empty();
    if (saverequired) {
        UpdatePagesInDatabase(_album.guid);
    }

    $("#myloader").hide();

    DrawPage();
}

$(function () {
    $("#btnBackToOrder").click(function () {
        
        $("#myloader").show();
        
        window.location.href = "reorderphotos.html";
    });
});
$(function () {
    $("#btnOrder").click(function () {
        
        $("loadermsg").html("Je fotoalbum wordt toegevoegd aan de winkelwagen...");
        $("#myloader").show();
        
        window.location.href = "orderpage.html";
    });
});
$(function () {
    $("#btnPreviousPage").click(function () {

        if (_currentPage > 0) {

            if (_currentPage % 2 === 1) {
                _currentPage--;
            } else {
                _currentPage -= 2;
            }
            DrawPage();
        }
    });
});
$(function () {
    $("#btnNextPage").click(function () {

        if (_currentPage < _album.pages.length - 1) {

            if (_currentPage % 2 === 1) {
                _currentPage++;
            } else {
                _currentPage += 2;
            }
            DrawPage();
        }
    });
});
$(function () {
    $("#btnRotate").click(function () {

        _manualupdate = true;

        var picture = $("#" + _currentImgSource.id);
        picture.guillotine("rotateRight");
        picture.guillotine("fit");
        picture.guillotine("center");
        
        var data = picture.guillotine("getData");
        _currentImgSource.refx = data.x;
        _currentImgSource.refy = data.y;
        _currentImgSource.refw = data.w;
        _currentImgSource.refh = data.h;
        _currentImgSource.refscale = data.scale;
        
        UpdatePagesInDatabase(_album.guid);

        _manualupdate = false;

    });
});
$(function () {
    $("#btnZoomOut").click(function () {

        _manualupdate = true;

        var picture = $("#" + _currentImgSource.id);
        picture.guillotine("zoomOut");
        
        var data = picture.guillotine("getData");
        _currentImgSource.refx = data.x;
        _currentImgSource.refy = data.y;
        _currentImgSource.refw = data.w;
        _currentImgSource.refh = data.h;
        _currentImgSource.refscale = data.scale;
       
        UpdatePagesInDatabase(_album.guid);
       
        _manualupdate = false;

    });
});
$(function () {
    $("#btnZoomIn").click(function () {

        _manualupdate = true;

        var picture = $("#" + _currentImgSource.id);
        picture.guillotine("zoomIn");
        
        var data = picture.guillotine("getData");
        _currentImgSource.refx = data.x;
        _currentImgSource.refy = data.y;
        _currentImgSource.refw = data.w;
        _currentImgSource.refh = data.h;
        _currentImgSource.refscale = data.scale;
        
        UpdatePagesInDatabase(_album.guid);
        
        _manualupdate = false;

    });
});
$(function () {
    $("#btnReset").click(function () {

        _manualupdate = true;

        var picture = $("#" + _currentImgSource.id);
        picture.guillotine("fit");
        picture.guillotine("center");
        
        var data = picture.guillotine("getData");
        _currentImgSource.refx = data.x;
        _currentImgSource.refy = data.y;
        _currentImgSource.refw = data.w;
        _currentImgSource.refh = data.h;
        _currentImgSource.refscale = data.scale;
        
        UpdatePagesInDatabase(_album.guid);
        
        _manualupdate = false;

    });
});
