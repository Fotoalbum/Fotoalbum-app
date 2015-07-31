var _status;
var _currentImgSource;
var _selectedElement;
var _screenH;

$(document).ready(function () {

    document.addEventListener("deviceready", onDeviceReady, true);

    _productID = localStorage.getItem("currentproductID");
    _album = JSON.parse(localStorage.getItem("currentAlbum"));
    _status = localStorage.getItem("status");

    var w = $(window).width() - 30;
    var maxw = w / 8;
    _containerW = maxw;
    _containerH = maxw;

    screenH = $(window).height() - 50;

    //Get the photocollection from the database
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

    if (_status === "new") {

        CreateNewPages();

        localStorage.setItem("status", "created");
        _status = "created";

    } else { //status = created

        CreatePages();
    }

}

function onDeviceReady() {

    window.screen.lockOrientation("landscape");

    AddEventListeners();
}

function CreateNewPages() {

    $("#lstPages").empty();

    _numpages = _album.pages.length - 4;
    _photoindex = 0;

    for (i = 0; i < _album.pages.length; i++) {

        if (_album.pages[i].type === "coverfront") {

            if (_photoindex < _photocollection.length) {

                var li = "<li class='photoContainer'>";

                var photo = _photocollection[_photoindex];
                var element = {id: generateUUID(), refid: photo.id, thumb: photo.thumb, orig: photo.orig, origw: photo.origw, origh: photo.origh, boxw: 0, boxh: 0, rotation: 0, refw: 0, refh: 0, refx: 0, refy: 0, refscale: 1};
                _album.pages[i].elements.push(element);
                _photoindex++;

                li += "<div id='" + _album.pages[i].id + "' element_id='" + element.id + "' photo_id='" + element.refid + "' class='photoDiv front'><div class='pagelabel'>" + _album.pages[i].label + "</div></div>";

                li += "</li>";

                $("#lstPages").append(li);

                $("#" + _album.pages[i].id).css("width", _containerW + "px");
                $("#" + _album.pages[i].id).css("height", _containerH + "px");
                $("#" + _album.pages[i].id).css("background-image", "url('" + photo.origsrc + "')");

                $(".photoContainer").css("width", _containerW + "px");
                $(".photoContainer").css("height", _containerH + "px");
                
                //Update the thumb cover in the album
                _album.thumb = photo.origsrc;
            }

        }

        if (_album.pages[i].type === "page") {

            if (_photoindex < _photocollection.length) {

                var li = "<li class='photoContainer'>";

                var photo = _photocollection[_photoindex];
                var element = {id: generateUUID(), refid: photo.id, thumb: photo.thumb, orig: photo.orig, origw: photo.origw, origh: photo.origh, boxw: 0, boxh: 0, rotation: 0, refw: 0, refh: 0, refx: 0, refy: 0, refscale: 1};
                _album.pages[i].elements.push(element);
                _photoindex++;

                li += "<div id='" + _album.pages[i].id + "' element_id='" + element.id + "' photo_id='" + element.refid + "' class='photoDiv'><div class='pagelabel'>" + _album.pages[i].label + "</div></div>";

                li += "</li>";

                $("#lstPages").append(li);

                $("#" + _album.pages[i].id).css("width", _containerW + "px");
                $("#" + _album.pages[i].id).css("height", _containerH + "px");
                $("#" + _album.pages[i].id).css("background-image", "url('" + photo.origsrc + "')");

                $(".photoContainer").css("width", _containerW + "px");
                $(".photoContainer").css("height", _containerH + "px");
            }
        }

    }

    $("#lstPages").sortable({
        refreshPositions: true,
        containment: 'parent',
        placeholder: 'placeholder',
        tolerance: 'pointer',
        delay: 10,
        scroll: true,
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

    $('#lstPages li').on("click", function (event, ui) {

        $("#lstPages li").each(function () {
            $(this).css("outline", "none");
            $(this).css("outline-offset", "0px");
        });

        _selectedElement = event.currentTarget;

        //Set the selected element
        $(_selectedElement).css("outline", "1px solid #FFFF00");
        $(_selectedElement).css("outline-offset", "-1px");

        $("#btnDelete").removeClass("disabled");

    });

    $("#myloader").hide();

    UpdatePagesInDatabase(_album.guid);

}

function CreatePages() {

    $("#lstPages").empty();

    _numpages = _album.pages.length - 4;

    for (i = 0; i < _album.pages.length; i++) {

        if (_album.pages[i].type === "coverfront") {

            var element = _album.pages[i].elements[0];
            var photo = GetPhotoFromAlbum(element.refid);

            if (element) {

                var li = "<li class='photoContainer'>";

                li += "<div id='" + _album.pages[i].id + "' element_id='" + element.id + "' photo_id='" + element.refid + "' class='photoDiv front'><div class='pagelabel'>" + _album.pages[i].label + "</div></div>";

                li += "</li>";

                $("#lstPages").append(li);

                $("#" + _album.pages[i].id).css("width", _containerW + "px");
                $("#" + _album.pages[i].id).css("height", _containerH + "px");
                $("#" + _album.pages[i].id).css("background-image", "url('" + photo.origsrc + "')");

                $(".photoContainer").css("width", _containerW + "px");
                $(".photoContainer").css("height", _containerH + "px");
            }

        }

        if (_album.pages[i].type === "page") {

            var element = _album.pages[i].elements[0];
            var photo = GetPhotoFromAlbum(element.refid);

            if (element) {

                var li = "<li class='photoContainer'>";

                li += "<div id='" + _album.pages[i].id + "' element_id='" + element.id + "' photo_id='" + element.refid + "' class='photoDiv'><div class='pagelabel'>" + _album.pages[i].label + "</div></div>";

                li += "</li>";

                $("#lstPages").append(li);

                $("#" + _album.pages[i].id).css("width", _containerW + "px");
                $("#" + _album.pages[i].id).css("height", _containerH + "px");
                $("#" + _album.pages[i].id).css("background-image", "url('" + photo.origsrc + "')");

                $(".photoContainer").css("width", _containerW + "px");
                $(".photoContainer").css("height", _containerH + "px");
            }

        }
    }

    $("#lstPages").sortable({
        refreshPositions: true,
        containment: 'parent',
        placeholder: 'placeholder',
        tolerance: 'pointer',
        delay: 150,
        scroll: true,
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

    $('#lstPages li').click(function (event, ui) {

        $("#lstPages li").each(function () {
            $(this).css("outline", "none");
            $(this).css("outline-offset", "0px");
        });

        _selectedElement = event.currentTarget;

        //Set the selected element
        $(_selectedElement).css("outline", "1px solid #FFFF00");
        $(_selectedElement).css("outline-offset", "-1px");

        $("#btnDelete").removeClass("disabled");

    });

    $("#myloader").hide();

}

function UpdateTilePhotos(action) {

    var numpage = 1;
    var ref_arr = _album.pages;
    _album.pages = new Array();
    _coverbackFound = false;

    $("#lstPages li").each(function (index, element) {

        var div_id = $(element.innerHTML).attr("id");
        var element_id = $(element.innerHTML).attr("element_id");
        var photo_id = $(element.innerHTML).attr("photo_id");
        var pageDiv = $(element.firstChild);

        //Update album pages
        //console.log(index + " - div: " + div_id + " - element: " + element_id);

        //Get the id
        for (x = 0; x < ref_arr.length; x++) {

            if (ref_arr[x].type === "coverback") {

                var newpage = ref_arr[x];

                if (!_coverbackFound) {
                    _album.pages.push(newpage);
                    _coverbackFound = true;
                }

            } else {

                if (ref_arr[x].id === div_id) {

                    var newpage = ref_arr[x];

                    _album.pages.push(newpage);

                    if (_album.pages.length === 2) {

                        //This is the coverfront
                        newpage.label = "Voorkant";
                        newpage.type = "coverfront";

                        //Update the element
                        $(pageDiv).removeClass("front").addClass("front");
                        $(pageDiv).children()[0].innerHTML = newpage.label;

                        //Add an empty page as well
                        var page = {id: generateUUID(), type: "empty", side: "left", width: _album.pagewidth, height: _album.pageheight, bleed: _album.pagebleed, label: "", elements: new Array()};
                        _album.pages.push(page);
                        
                         //Update the thumb cover in the album
                         var photo = GetPhotoFromAlbum(photo_id);
                        _album.thumb = photo.origsrc;
                       
                    } else {

                        newpage.label = "p." + numpage;
                        newpage.type = "page";
                        if (numpage % 2 === 0) {
                            newpage.side = "left";
                        } else {
                            newpage.side = "right";
                        }
                        numpage++;
                        $(pageDiv).removeClass("front");
                        $(pageDiv).children()[0].innerHTML = newpage.label;
                    }
                    break;
                }
            }
        }
    });

    //Add one ore two blanc pages if the number of pages are uneven
    if (_album.pages[_album.pages.length - 1].side === "right") {
        var page = {id: generateUUID(), type: "page", side: "left", width: _album.pagewidth, height: _album.pageheight, bleed: _album.pagebleed, label: "p. " + numpage, elements: new Array()};
        _album.pages.push(page);
    }

    //Add the last empty page
    var page = {id: generateUUID(), type: "empty", side: "right", width: _album.pagewidth, height: _album.pageheight, bleed: _album.pagebleed, label: "", elements: new Array()};
    _album.pages.push(page);

    if (action) {
        UpdatePagesInDatabase(_album.guid, action);
    }
}

$(function () {
    $('#btnBackToAlbums').click(function () {

        $("#myloader").show();

        UpdatePagesInDatabase(_album.guid, "projects");

    });
});

$(function () {
    $('#btnDelete').click(function () {
        if (_selectedElement) {
            //Check minimum pages
            if (_photocollection.length > parseInt(_album.minpages) + 1) {
                //Delete the item
                BootstrapDialog.show({
                    title: 'Foto verwijderen',
                    message: "Weet je zeker dat je deze foto wilt verwijderen?",
                    buttons: [{
                            label: 'JA',
                            action: function (dialog) {
                                DeleteElement();
                                dialog.close();
                            }
                        }, {
                            label: 'NEE',
                            action: function (dialog) {
                                dialog.close();
                            }
                        }]
                });
            } else {
                //Alert the user we can't go lower then the minpages
                BootstrapDialog.show({
                    title: 'Foto verwijderen niet mogelijk',
                    message: "Het minimum aantal pagina's voor dit fotoalbum is " + _album.minpages + ". Als je deze foto wilt verwijderen, voeg dan eerst een nieuwe foto toe.",
                    buttons: [{
                            label: 'OK',
                            action: function (dialog) {
                                dialog.close();
                            }
                        }]
                });
            }
        }
    });
});

var startIndex = 0;
var newPageIndex = 0;

$(function () {
    $('#btnAddPhotos').click(function () {

        if (_album.pages.length < _album.maxpages) {

            startIndex = _photocollection.length;
            newPageIndex = _album.pages.length - 1;

            //Add photos
            window.imagePicker.getPictures(
                    function (photos) {

                        //Create additional pages if we have more photos
                        var diff = photos.length;
                        if (diff % 2 !== 0) {
                            //Add 1 extra page
                            diff++;
                        }

                        var side = "right";
                        for (var x = 0; x < diff; x++) {
                            if (side === "left") {
                                side = "right";
                            } else {
                                side = "left";
                            }
                            _numpages++;
                            var page = {id: generateUUID(), type: "page", side: side, width: _album.pagewidth, height: _album.pageheight, bleed: _album.pagebleed, label: "p. " + (_numpages), elements: new Array()};
                            _album.pages.splice(newPageIndex, 0, page);
                        }

                        for (var i = 0; i < photos.length; i++) {

                            var arr = photos[i].split(";");
                            var thumb = arr[0];
                            var orig = "file://" + arr[1];

                            var photo = {id: generateUUID(), thumb: thumb, orig: orig, origw: 0, origh: 0, origsrc: ""};
                            _photocollection.push(photo);

                        }

                        AddPhotoInformation(startIndex, newPageIndex);

                    }, function (error) {
                console.log('Error: ' + error);
                alert("Een van de foto's kon niet worden geladen. Probeer opnieuw.");
            }, {
                maximumImagesCount: _album.maxpages - (_album.pages.length - 3),
                minimumImagesCount: 1, //_numpages,
                width: Math.round(_album.pagewidth / 2),
                height: Math.round(_album.pageheight / 2)
            });
        } else {
            BootstrapDialog.show({
                title: "Foto's toevoegen niet mogelijk",
                message: "Het maximum aantal pagina's voor dit fotoalbum is " + _album.maxpages + ". Als je foto's wilt toevoegen, moet je eerst andere foto's verwijderen.",
                buttons: [{
                        label: 'OK',
                        action: function (dialog) {
                            dialog.close();
                        }
                    }]
            });
        }

    });
});

function AddPhotoInformation(index, pageindex) {

    var photo = _photocollection[index];
    var page = _album.pages[pageindex];
    var thumb = photo.thumb;
    var orig = photo.orig;

    loadImage.parseMetaData(orig, function (data) {
        options = {canvas: true};
        if (data.exif && data.exif.get('Orientation')) {
            options.orientation = data.exif.get('Orientation');
        }
        loadImage(
                thumb,
                function (img) {

                    //Set the image width and height
                    photo.origw = img.width;
                    photo.origh = img.height;

                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', thumb, true);
                    xhr.responseType = 'blob';
                    xhr.onloadend = function (e) {
                        var reader = new window.FileReader();
                        reader.readAsDataURL(this.response);
                        reader.onloadend = function () {
                            var base64data = reader.result;
                            photo.origsrc = base64data;

                            //Insert the photo in the database
                            createQuery("INSERT INTO PHOTOCOLLECTION (" +
                                    "id," +
                                    "album_id," +
                                    "thumb," +
                                    "orig," +
                                    "origw," +
                                    "origh," +
                                    "origsrc) VALUES (" +
                                    "'" + photo.id + "'," +
                                    "'" + _album.guid + "'," +
                                    "'" + photo.thumb + "'," +
                                    "'" + photo.orig + "'," +
                                    "'" + photo.origw + "'," +
                                    "'" + photo.origh + "'," +
                                    "'" + photo.origsrc + "')",
                                    [], succesSinglePhotoSave, errorCB);

                            var li = "<li class='photoContainer'>";

                            var element = {id: generateUUID(), refid: photo.id, thumb: photo.thumb, orig: photo.orig, origw: photo.origw, origh: photo.origh, boxw: 0, boxh: 0, rotation: 0, refw: 0, refh: 0, refx: 0, refy: 0, refscale: 1};
                            page.elements.push(element);

                            li += "<div id='" + page.id + "' element_id='" + element.id + "' photo_id='" + element.refid + "' class='photoDiv front'><div class='pagelabel'>" + page.label + "</div></div>";

                            li += "</li>";

                            $("#lstPages").append(li);

                            $("#" + page.id).css("width", _containerW + "px");
                            $("#" + page.id).css("height", _containerH + "px");
                            $("#" + page.id).css("background-image", "url('" + photo.origsrc + "')");

                            $(".photoContainer").css("width", _containerW + "px");
                            $(".photoContainer").css("height", _containerH + "px");

                            $('#lstPages li').click(function (event, ui) {

                                $("#lstPages li").each(function () {
                                    $(this).css("outline", "none");
                                    $(this).css("outline-offset", "0px");
                                });

                                _selectedElement = event.currentTarget;

                                //Set the selected element
                                $(_selectedElement).css("outline", "1px solid #FFFF00");
                                $(_selectedElement).css("outline-offset", "-1px");

                                $("#btnDelete").removeClass("disabled");

                            });

                            if (index === _photocollection.length - 1) {

                                localStorage.setItem("currentAlbum", JSON.stringify(_album));

                                //Refresh the current page
                                UpdateTilePhotos();

                            } else {

                                index++;
                                pageindex++;

                                AddPhotoInformation(index, pageindex);

                            }
                        };
                    };
                    xhr.send();
                },
                options
                );
    });
}
function succesSinglePhotoSave(tx, results) {
    console.log("single photo saved");
}

function DeleteElement() {

    if (_selectedElement) {

        var photo_id = $(_selectedElement.innerHTML).attr("photo_id");

        for (x = 0; x < _photocollection.length; x++) {
            if (_photocollection[x].id === photo_id) {
                _photocollection.splice(x, 1);
                break;
            }
        }

        //Remove the li;
        $("#lstPages li").each(function (index, element) {
            var div_id = $(element.innerHTML).attr("photo_id");
            if (div_id === photo_id) {
                $(element).remove();
            }
        });

        UpdateTilePhotos();

    }

}

$(function () {

    $('#btnGoEditPages').click(function () {

        //Check if we have empty pages
        if ($("#lstPages li").length % 2 === 0) {
            //Alert the user one more photo has to be added
            BootstrapDialog.show({
                title: "Lege pagina",
                message: "Met het huidige aantal foto's heeft u 1 lege pagina in uw fotoalbum. Voeg nog 1 foto toe en probeer opnieuw.",
                buttons: [{
                        label: 'OK',
                        action: function (dialog) {
                            dialog.close();
                        }
                    }]
            });
        } else {

            localStorage.setItem("currentAlbumID", _album.guid);
            localStorage.setItem("currentAlbum", JSON.stringify(_album));

            UpdateTilePhotos("editpages");

        }
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