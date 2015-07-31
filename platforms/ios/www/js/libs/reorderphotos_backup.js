var _status;
var _currentImgSource;

$(document).ready(function () {

    document.addEventListener("deviceready", onDeviceReady, true);

    _productID = localStorage.getItem("currentproductID");
    _album = JSON.parse(localStorage.getItem("currentAlbum"));
    _status = localStorage.getItem("status");

    _boxw = localStorage.getItem("boxw");
    _boxh = localStorage.getItem("boxh");
    _zoom = localStorage.getItem("zoom");

    var w = $(window).width();
    var maxw = (w - 40) / 4;
    _containerW = maxw;
    _containerH = (_album.pageheight * (maxw / _album.pagewidth)) + 20;
    _marginTop = (_containerH - _boxh) / 2;

    if (_status === "new") {
        CreateNewPages();
    } else {
        CreatePages();
    }

});
function onDeviceReady() {

    window.screen.lockOrientation("portrait");

    AddEventListeners();
}

function CreateNewPages() {

    $("#lstPages").empty();
    _numpages = _album.pages.length;
    _photocounter = 0;
    //Load all images now (last one first to stack)
    for (i = 0; i < _album.pages.length; i++) {

        var liStyle = "";
        if (i % 2 === 0) {
            liStyle = "floatRight";
        } else {
            liStyle = "floatLeft";
        }

        var li = "<li class='photoContainer";
        var isCover = false;
        var isEmpty = false;
        if (_album.pages[i].type === "coverback" ||
                _album.pages[i].type === "coverfront" ||
                _album.pages[i].type === "empty") {
            li += " disabled";
            if (_album.pages[i].type === "empty") {
                isEmpty = true;
            } else {
                isCover = true;
            }
        }

        li += "'>";
        if (!isEmpty && !isCover) {
            if (_photocounter < _album.photocollection.length) {
//Add the photo to the page elements
                var photo = _album.photocollection[_photocounter];
                var element = {id: generateUUID(), refid: photo.id, url: photo.url, origw: photo.origw, origh: photo.origh, imgw: 0, imgh: 0, offsetx: 0, offsety: 0, zoom: 1, rotation: 0};
                var imgSizeArr = calculateImageSize(_album.pagewidth, _album.pageheight, photo.origw, photo.origh);
                element.origw = photo.origw;
                element.origh = photo.origh;
                element.imgw = imgSizeArr[0];
                element.imgh = imgSizeArr[1];
                element.offsetx = imgSizeArr[2];
                element.offsety = imgSizeArr[3];
                element.zoom = 1;
                element.rotation = 0;

                if (!_album.pages[i].elements) {
                    _album.pages[i].elements = new Array();
                }
                _album.pages[i].elements.push(element);

                li += "<div id='" + _album.pages[i].id + "' class='photoDiv " + liStyle + "'>" +
                        "<img id='" + _album.pages[i].elements[0].id +
                        "' alt='" + _album.pages[i].elements[0].refid +
                        "' src='" + _album.pages[i].elements[0].url + "'></img></div>";
                _photocounter++;
            } else { //empty placeholder
                li += "<div id='" + _album.pages[i].id + "' class='photoDiv " + liStyle + "'>" +
                        "<div id='addPhoto'><span class='fa fa-plus-circle'></span></div>" +
                        "</div>";
            }
        } else {
//If this is a cover, then add a plus sign to add a photo
            if (isCover) {
                if (_album.pages[i].type === "coverback") {
                    li += "<div id='" + _album.pages[i].id + "' class='photoDiv coverback " + liStyle + "'>" +
                            "<img id='coverbackLogo' src='./assets/logo.jpg'></image>" +
                            "</div>";
                } else {
                    //Cover front
                    if (_photocounter < _album.photocollection.length) {
//Add the photo to the page elements
                        var photo = _album.photocollection[_photocounter];
                        var element = {id: generateUUID(), refid: photo.id, url: photo.url, origw: photo.origw, origh: photo.origh, imgw: 0, imgh: 0, offsetx: 0, offsety: 0, zoom: 1, rotation: 0};
                        var imgSizeArr = calculateImageSize(_album.pagewidth, _album.pageheight, photo.origw, photo.origh);
                        element.origw = photo.origw;
                        element.origh = photo.origh;
                        element.imgw = imgSizeArr[0];
                        element.imgh = imgSizeArr[1];
                        element.offsetx = imgSizeArr[2];
                        element.offsety = imgSizeArr[3];
                        element.zoom = 1;
                        element.rotation = 0;
                        if (!_album.pages[i].elements) {
                            _album.pages[i].elements = new Array();
                        }
                        _album.pages[i].elements.push(element);
                        li += "<div id='" + _album.pages[i].id + "' class='photoDiv " + liStyle + "'>" +
                                "<img id='" + _album.pages[i].elements[0].id +
                                "' alt='" + _album.pages[i].elements[0].refid +
                                "' src='" + _album.photocollection[_photocounter].url +
                                "'></img></div>";
                        _photocounter++;
                    } else { //empty placeholder
                        li += "<div id='" + _album.pages[i].id + "' class='photoDiv " + liStyle + "'>" +
                                "<div id='addPhoto'><span class='fa fa-plus-circle'></span></div>" +
                                "</div>";
                    }
                }

            } else {
                li += "<div id='" + _album.pages[i].id + "' class='photoDiv " + liStyle + " insideofcover'></div>";
            }
        }

        if (liStyle === "floatLeft") {
            li += "<div id='pageLabel' class='albumPageLabelLeft'>" + _album.pages[i].label + "</div>";
        } else {
            li += "<div id='pageLabel' class='albumPageLabelRight'>" + _album.pages[i].label + "</div>";
        }
        li += "</li>";
        $("#lstPages").append(li);

        $(".photoContainer").css("width", _containerW + "px");
        $(".photoContainer").css("height", _containerH + "px");

        $(".photoDiv").css("width", _boxw + "px");
        $(".photoDiv").css("height", _boxh + "px");
        $(".photoDiv").css("margin-top", _marginTop + "px");
        $(".photoDiv").css("background-color", "#D2D2D2");

        $(".coverback").css("width", _boxw + "px");
        $(".coverback").css("height", _boxh + "px");
        $(".coverback").css("margin-top", _marginTop + "px");
        $(".coverback").css("background-color", "#FFFFFF");

    }

    $("#lstPages").sortable({
        refreshPositions: true,
        scroll: true,
        containment: 'parent',
        placeholder: 'placeholder',
        tolerance: 'pointer',
        items: "li:not(.disabled)",
        change: function (event, ui) {
            //TODO: Update the dragged element
        },
        start: function (event, ui) {
            $(".placeholder").css("width", _containerW + "px");
            $(".placeholder").css("height", _containerH + "px");
            $(".placeholder").css("background-color", "#1483CC");
        },
        stop: function (event, ui) {
            UpdateTilePhotos();
        }
    }).disableSelection();

    UpdatePagesInDatabase(_album.id);
}

function CreatePages() {

    $("#lstPages").empty();
    _numpages = _album.pages.length;
    
    //Load all images now (last one first to stack)
    for (i = 0; i < _album.pages.length; i++) {

        var liStyle = "";
        var img = null;
        
        if (i % 2 === 0) {
            liStyle = "floatRight";
        } else {
            liStyle = "floatLeft";
        }

        var li = "<li class='photoContainer";
        var isCover = false;
        var isEmpty = false;
        if (_album.pages[i].type === "coverback" ||
                _album.pages[i].type === "coverfront" ||
                _album.pages[i].type === "empty") {
            li += " disabled";
            if (_album.pages[i].type === "empty") {
                isEmpty = true;
            } else {
                isCover = true;
            }
        }

        li += "'>";
        if (!isEmpty && !isCover) {

            if (_album.pages[i].elements) {

                if (_album.pages[i].elements.length > 0) {
                    img = _album.pages[i].elements[0];
                    li += "<div id='" + _album.pages[i].id + "' class='photoDiv " + liStyle + "'>" +
                            "<image id='" + img.id +
                            "' alt='" + img.refid +
                            "' src='" + img.url +
                            "'></img></div>";
                } else {
                    li += "<div id='" + _album.pages[i].id + "' class='photoDiv " + liStyle + "'>" +
                            "<div id='addPhoto'><span class='fa fa-plus-circle'></span></div>" +
                            "</div>";
                }
            } else { //empty placeholder
                li += "<div id='" + _album.pages[i].id + "' class='photoDiv " + liStyle + "'>" +
                        "<div id='addPhoto'><span class='fa fa-plus-circle'></span></div>" +
                        "</div>";
            }
        } else {
            //If this is a cover, then add a plus sign to add a photo
            if (isCover) {
                if (_album.pages[i].type === "coverback") {
                    li += "<div id='" + _album.pages[i].id + "' class='photoDiv coverback " + liStyle + "'>" +
                            "<img id='coverbackLogo' src='./assets/logo.jpg'></image>" +
                            "</div>";
                } else {
                    if (_album.pages[i].elements) {
                        if (_album.pages[i].elements.length > 0) {
                            img = _album.pages[i].elements[0];
                            li += "<div id='" + _album.pages[i].id + "' class='photoDiv " + liStyle + "'>" +
                                    "<image id='" + img.id +
                                    "' alt='" + img.refid +
                                    "' src='" + img.url +
                                    "'></img></div>";
                        } else {
                            li += "<div id='" + _album.pages[i].id + "' class='photoDiv " + liStyle + "'>" +
                                    "<div id='addPhoto'><span class='fa fa-plus-circle'></span></div>" +
                                    "</div>";
                        }
                    } else { //empty placeholder
                        li += "<div id='" + _album.pages[i].id + "' class='photoDiv " + liStyle + "'>" +
                                "<div id='addPhoto'><span class='fa fa-plus-circle'></span></div>" +
                                "</div>";
                    }
                }
            } else {
                li += "<div id='" + _album.pages[i].id + "' class='photoDiv " + liStyle + " insideofcover'></div>";
            }
        }
        
        if (liStyle === "floatLeft") {
            li += "<div id='pageLabel' class='albumPageLabelLeft'>" + _album.pages[i].label + "</div>";
        } else {
            li += "<div id='pageLabel' class='albumPageLabelRight'>" + _album.pages[i].label + "</div>";
        }
        li += "</li>";
        
        $("#lstPages").append(li);
        
        if (img) {
         
             var picture = $("#" + img.id);

             if (img.hasOwnProperty("refx")) {

                picture.guillotine({
                    width: img.refw,
                    height: img.refh,
                    eventOnChange: 'onChange',
                    init: {
                        x: img.refx,
                        y: img.refy,
                        scale: img.refscale,
                        angle: img.rotation
                    }
                });

            } else {

                picture.guillotine({
                    width: _containerW,
                    height: _containerH,
                    eventOnChange: 'onChange',
                    init: {
                        angle: img.rotation
                    }
                });

                picture.guillotine('center');
                picture.guillotine("fit");
            }

            var data = picture.guillotine('getData');
            img.refw = data.w;
            img.refh = data.h;
            img.refx = data.x;
            img.refy = data.y;
            img.refscale = data.scale;

            picture.on('onChange', function (ev, data, action) {
                img.refw = data.w;
                img.refh = data.h;
                img.refx = data.x;
                img.refy = data.y;
                img.refscale = data.scale;

                //TODO! Calculate real offset/width/height etc
                console.log(JSON.stringify(img));
            });
        }
        
        $(".photoContainer").css("width", _containerW + "px");
        $(".photoContainer").css("height", _containerH + "px");

        $(".photoDiv").css("width", _boxw + "px");
        $(".photoDiv").css("height", _boxh + "px");
        $(".photoDiv").css("margin-top", _marginTop + "px");
        $(".photoDiv").css("background-color", "#D2D2D2");

        $(".coverback").css("width", _boxw + "px");
        $(".coverback").css("height", _boxh + "px");
        $(".coverback").css("margin-top", _marginTop + "px");
        $(".coverback").css("background-color", "#FFFFFF");

    }

    $("#lstPages").sortable({
        refreshPositions: true,
        scroll: true,
        containment: 'parent',
        placeholder: 'placeholder',
        tolerance: 'pointer',
        items: "li:not(.disabled)",
        change: function (event, ui) {
            //TODO: Update the dragged element

        },
        start: function (event, ui) {

            $(".placeholder").css("width", _containerW + "px");
            $(".placeholder").css("height", _containerH + "px");
            $(".placeholder").css("background-color", "#1483CC");
        },
        stop: function (event, ui) {

            UpdateTilePhotos();
        }
    }).disableSelection();
    
}

function UpdateTilePhotos() {

    var numpage = 1;
    $("#lstPages li").each(function (index, element) {

        var imgid = $(element.innerHTML).find("img").attr("id");
        var refid = $(element.innerHTML).find("img").attr("alt");

        if (imgid) {

            _album.pages[index].elements = new Array();
            //Get the photo info
            var photo = GetPhotoFromAlbum(refid);
            //Update the specs
            var imgSizeArr = calculateImageSize(_album.pagewidth, _album.pageheight, photo.origw, photo.origh);
            var e = {id: imgid, refid: refid, url: photo.url, origw: photo.origw, origh: photo.origh, imgw: 0, imgh: 0, offsetx: 0, offsety: 0, zoom: 1, rotation: 0};
            e.origw = photo.origw;
            e.origh = photo.origh;
            e.imgw = imgSizeArr[0];
            e.imgh = imgSizeArr[1];
            e.offsetx = imgSizeArr[2];
            e.offsety = imgSizeArr[3];
            e.zoom = 1;
            e.rotation = 0;
            _album.pages[index].elements.push(e);
        } else {
            //Remove the image from the array
            if (_album.pages[index].elements) {
                _album.pages[index].elements = new Array();
            }
        }

        //Update the page numbers
        if (_album.pages[index].type !== "coverback" &&
                _album.pages[index].type !== "coverfront" &&
                _album.pages[index].type !== "empty") {

            _album.pages[index].label = "p. " + numpage;
            numpage++;

            //Update the photos if we have them


            //Update the label too
            element.lastChild.innerHTML = _album.pages[index].label;
            //Switch the class
            $(element.lastChild).removeClass();
            if (index % 2 === 0) {
                $(element.lastChild).addClass("albumPageLabelRight");
            } else {
                $(element.lastChild).addClass("albumPageLabelLeft");
            }

        }

        var insidecover = false;
        if ($(element.firstChild).attr("class").indexOf("insideofcover") > -1) {
            insidecover = true;
        }

        $(element.firstChild).removeClass();
        if (index % 2 === 0) {
            //Check if this page has an image or not
            if (!insidecover) {
                $(element.firstChild).addClass("photoDiv floatRight");
            } else {
                $(element.firstChild).addClass("photoDiv floatRight insideofcover");
            }
        } else {
            if (!insidecover) {
                $(element.firstChild).addClass("photoDiv floatLeft");
            } else {
                $(element.firstChild).addClass("photoDiv floatLeft insideofcover");
            }
        }

        //console.log(JSON.stringify(_album.pages));

    });

    UpdatePagesInDatabase(_album.id);
}

$(function () {
    $('#btnBack').click(function () {
        window.location.href = "myprojects.html";
    });
});

$(function () {
    $('#btnNext').click(function () {
        window.location.href = "myprojects.html";
    });
});

$(function () {
    $('#btnBackToAlbums').click(function () {
        window.location.href = "myprojects.html";
    });
});

$(function () {

    $('#btnGoEditPages').click(function () {

        localStorage.setItem("currentAlbumID", _album.id);
        localStorage.setItem("currentAlbum", JSON.stringify(_album));

        UpdatePagesInDatabase(_album.id);

        window.location.href = "editpage.html";
    });
});

function getOriginalWidthOfImg(img_element) {
    var t = new Image();
    t.src = (img_element.getAttribute ? img_element.getAttribute("src") : false) || img_element.src;
    return t.width;
}

function getOriginalHeightOfImg(img_element) {
    var t = new Image();
    t.src = (img_element.getAttribute ? img_element.getAttribute("src") : false) || img_element.src;
    return t.height;
}