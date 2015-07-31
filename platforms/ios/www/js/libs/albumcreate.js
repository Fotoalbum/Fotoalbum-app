var _currentphoto = 0;

$(document).ready(function () {

    document.addEventListener("deviceready", onDeviceReady, true);

    createQuery("SELECT * FROM PRODUCTS", qGetProductsSuccess);
    //CreateNavigation();

});

function onDeviceReady() {

    window.screen.lockOrientation("landscape");

    AddEventListeners();

}

function qGetProductsSuccess(tx, results) {

    var len = results.rows.length;
    //console.log("PRODUCTS table: " + len + " rows found.");

    $("#lstProducts").html("");

    for (var i = 0; i < len; i++) {

        var product = results.rows.item(i);
        var product_data = jQuery.parseJSON(unescape(product.data));

        var _li = "<div class='myProductRow row'>" +
                "<div id='" + product.id + "' class='myProductCol col-xs-10'>" +
                "<img class='myProductImage' src='" + product.thumb + "' alt='myImage'>" +
                "<div class='myProductInfo'>" +
                "<div class='myProductCaption'>" + product_data.name + "</div>" +
                "<div class='myProductSub'>Papiersoort: " + product_data.paper_name + "</div>" +
                "<div class='myProductPrice'>Prijs vanaf: € 59.95</div>" +
                "</div>" + //end info
                "</div>" + //end colums
                "<div class='myProductSelector col-xs-2'>" +
                "<span id='btnProductEdit' class='glyphicon glyphicon-chevron-right'></span>" +
                "</div>" + //end column
                "</div>"; //end row

        $("#lstProducts").append(_li);

        // product selection
        $(function () {
            $("#" + product.id).on("click", function () {

                localStorage.setItem("currentproductID", product.id);
                GetProduct(product.id, product_data);

            });
        });

        $("#myloader").hide();

    }

}

function GetProduct(productID, data) {

    //Load product info
    //console.log(productID + " | " + data);

    var usecover = data.cover;
    _numpages = 4; //parseInt(data.min_page);
    _minphotos = _numpages + 1;

    var coverwidth = mm2pt(data.ProductCover.width);
    var coverheight = mm2pt(data.ProductCover.height);
    var coverwrap = mm2pt(data.ProductCover.wrap);
    var coverbleed = mm2pt(data.ProductCover.bleed);

    var coverspine = mm2pt(5); //TODO!!

    var pagewidth = mm2pt(data.page_width);
    var pageheight = mm2pt(data.page_height);
    var pagebleed = mm2pt(data.page_bleed);

    //Create a new Album
    var pages = new Array();

    //Create cover first
    var page = {id: generateUUID(), type: "coverback", width: coverwidth, height: coverheight, wrap: coverwrap, bleed: coverbleed, label: "Achterkant", elements: new Array()};
    pages.push(page);
    //Spine
    //page = {id: generateUUID(), type: "coverspine", width: coverwidth, height: coverheight, wrap: coverwrap, bleed: coverbleed, label: "spine"};
    //pages.push(page);
    //Frontpage
    page = {id: generateUUID(), type: "coverfront", width: coverwidth, height: coverheight, wrap: coverwrap, bleed: coverbleed, label: "Voorkant", elements: new Array()};
    pages.push(page);

    //Binnenwerk
    var side = "left";

    //First empty left page -> inside cover
    page = {id: generateUUID(), type: "empty", side: side, width: pagewidth, height: pageheight, bleed: pagebleed, label: "", elements: new Array()};
    pages.push(page);

    for (var x = 0; x < _numpages; x++) {
        if (side === "left") {
            side = "right";
        } else {
            side = "left";
        }
        page = {id: generateUUID(), type: "page", side: side, width: pagewidth, height: pageheight, bleed: pagebleed, label: "p. " + (x + 1), elements: new Array()};
        pages.push(page);
    }

    var d = new Date();
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var datecreated = d.getFullYear() + '/' +
            (('' + month).length < 2 ? '0' : '') + month + '/' +
            (('' + day).length < 2 ? '0' : '') + day;

    _album = new Album();
    var guid = generateUUID();

    var price = CalculatePrice("4", "99.95", "1.00", "0", data.min_page, data.min_page);
    _album.setProps(-1,
            guid,
            "Mijn nieuwe fotoalbum", //name
            datecreated, // date created
            productID, //Product ID
            pagewidth, // Width
            pageheight, // Height
            pagebleed, //Bleed
            usecover, //useCover
            coverwidth, //Cover width
            coverheight, //Cover height
            coverwrap, //Cover wrap
            coverbleed, //Cover bleed
            coverspine, //Spine width TODO!!
            data.min_page, //min pages
            data.max_page, //max pages
            data.min_page, //numpages
            "", //CoverIMG
            price,
            pages); //pages

    localStorage.setItem("status", "new");

    $("#myloader").show();

    //Selectphotos
    GetPhotos();

}

function GetPhotos() {

    if (!_photocollection) {
        _photocollection = new Array();
    }

    window.imagePicker.getPictures(
            function (results) {

                if (results.length < _minphotos) { // < numpages

                    $("#remark").text("Je hebt te weinig foto's geselecteerd (" + results.length + "). Selecteer er minimaal " + _minphotos);

                } else {

                    //Create additional pages if we have more photos
                    if (results.length > _minphotos) {
                        var diff = results.length - _minphotos;
                        if (diff % 2 === 0) {
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
                            _album.pages.push(page);
                        }
                    }

                    //Last empty page
                    page = {id: generateUUID(), type: "empty", side: "right", width: _album.pagewidth, height: _album.pageheight, bleed: _album.pagebleed, label: "", elements: new Array()};
                    _album.pages.push(page);

                    for (var i = 0; i < results.length; i++) {

                        var arr = results[i].split(";");
                        var thumb = arr[0];
                        var orig = "file://" + arr[1];

                        var photo = {id: generateUUID(), thumb: thumb, orig: orig, origw: 0, origh: 0, origsrc: ""};
                        _photocollection.push(photo);
                    }

                    SetPhotoInformation(0);

                }
            }, function (error) {
        console.log('Error: ' + error);
        alert("Een van de foto's kon niet worden geladen. Probeer opnieuw.");
        $("#myloader").hide();

    }, {
        maximumImagesCount: _album.maxpages + 1,
        minimumImagesCount: _minphotos, //_minphotos
        width: Math.round(_album.pagewidth / 2),
        height: Math.round(_album.pageheight / 2)
    });
}

function SetPhotoInformation(index) {

    var photo = _photocollection[index];
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
                        };
                    };
                    xhr.send();

                    if (index === _photocollection.length - 1) {

                        //Now save the new album to the database
                        var db = window.openDatabase("Fotoalbum", "", "Fotoalbum DB", 1000000);
                        db.transaction(SaveNewAlbum, errorCB);

                    } else {

                        index++;

                        SetPhotoInformation(index);

                    }

                },
                options
                );
    });
}

function SaveNewAlbum(tx) {

    //Store the album in the local database
    tx.executeSql("INSERT INTO USERPRODUCTS (" +
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
            "pages) VALUES (" +
            "'" + _album.guid + "'," +
            "'" + _album.name + "'," +
            "'" + _album.datecreated + "'," +
            "'" + _album.productid + "'," +
            "'" + _album.pagewidth + "'," +
            "'" + _album.pageheight + "'," +
            "'" + _album.pagebleed + "'," +
            "'" + _album.usecover + "'," +
            "'" + _album.coverwidth + "'," +
            "'" + _album.coverheight + "'," +
            "'" + _album.coverwrap + "'," +
            "'" + _album.coverbleed + "'," +
            "'" + _album.spinewidth + "'," +
            "'" + _album.minpages + "'," +
            "'" + _album.maxpages + "'," +
            "'" + _album.numpages + "'," +
            "''," +
            "'" + _album.price + "'," +
            "'" + escape(JSON.stringify(_album.pages, null, 2)) + "')",
            [], successAlbumSave, errorCB);

}

var albumid;
function successAlbumSave(tx, results) {

    console.log("New album saved with id " + results.insertId);

    localStorage.setItem("currentAlbumID", _album.guid);
    localStorage.setItem("currentAlbum", JSON.stringify(_album));
    localStorage.setItem("status", "new");

    currentphoto = 0;

    SavePhotos(tx);
}

function SavePhotos(tx) {

    var photo = _photocollection[currentphoto];

    tx.executeSql("INSERT INTO PHOTOCOLLECTION (" +
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
            [], succesPhotoSave, errorCB);
}

function succesPhotoSave(tx, results) {
    
    currentphoto++;

    console.log("currentphoto: " + currentphoto);

    if (currentphoto < _photocollection.length) {
        SavePhotos(tx);
    } else {
        setTimeout(function () {
            window.location.href = "reorderphotos.html";
        }, 500);
    }
}
