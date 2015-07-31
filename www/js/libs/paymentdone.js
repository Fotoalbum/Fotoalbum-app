var _status;
$(document).ready(function () {

    document.addEventListener("deviceready", onDeviceReady, true);

    _productID = localStorage.getItem("currentproductID");
    _album = JSON.parse(localStorage.getItem("currentAlbum"));

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
    $('#btnBackToOrder').click(function () {
        window.location.href = "orderpage.html";
    });
});

$(function () {
    $('#btnCreateZIP').click(function () {

        //Create a zip file with the xml and images
        $("#orderstatus").html("Fotoalbum klaarzetten...");

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
    });
});

var filecount = 0;
var currentphoto = 0;
function gotFS(fileSystem) {

    //Create a zip file containing the original photos (with id)
    currentphoto = 0;
    filecount = _photocollection.length;

    var image = _photocollection[currentphoto];
    var filePath = image.orig;

    window.resolveLocalFileSystemURL(filePath, gotFileEntry, fail);
}

var gotFileEntry = function (fileEntry) {

    //console.log("got image file entry: " +  fileEntry.fullPath);

    try {
        fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function (evt) {

                //console.log("Read complete!");
                //var imgfolder = zip.folder("images");
                //imgfolder.file(fileEntry.name, , {base64: true, binary: true, compression: "DEFLATE"});

                zipBlob(fileEntry.name, evt.target.result, function (zippedBlob) {
                    // unzip the first file from zipped data stored in zippedBlob
                    unzipBlob(zippedBlob, function (unzippedBlob) {
                        // logs the uncompressed Blob
                        console.log(unzippedBlob);
                    });
                });

                filecount--;

                if (filecount === 0) {

                    $("#orderstatus").html("Foto's zijn geladen. Bestelling wordt gemaakt...");

                    //Upload the zipfile now!
                    //var content = zip.generate({type: "arraybuffer"});

                    //if content is done, upload the file to the server
                    $("#orderstatus").html("Bestelling klaar. We gaan nu uploaden...");

                    /*
                     var fd = new FormData();
                     var filename = generateUUID() + ".zip";
                     fd.append('fname', filename);
                     fd.append('file', content);
                     $.ajax({
                     type: 'POST',
                     url: "http://api.xhibit.com/v2/softwares/upload_and_unzip_file",
                     data: fd,
                     processData: false,
                     contentType: false
                     }).done(function (data) {
                     
                     //Inform the user that the order was processed
                     $("#orderstatus").html("Bestelling is geupload. Kijk op de orderpagina om uw bestelling te volgen.");
                     });
                     */
                } else {

                    currentphoto++;

                    var image = _photocollection[currentphoto];
                    var filePath = image.orig;

                    $("#orderstatus").html("Foto's klaarzetten (" + (currentphoto + 1) + " van " + _photocollection.length + ")");

                    window.resolveLocalFileSystemURL(filePath, gotFileEntry, fail);
                }
            };
            reader.readAsArrayBuffer(file);
        }, fail);
    } catch (err) {
        filecount--;
    }
};

function fail(evt) {
    console.log(evt);
}

function zipBlob(filename, blob, callback) {

    // use a zip.BlobWriter object to write zipped data into a Blob object
    zip.createWriter(new zip.BlobWriter("application/zip"), function (zipWriter) {
        // use a BlobReader object to read the data stored into blob variable
        zipWriter.add(filename, new zip.BlobReader(blob), function () {
            // close the writer and calls callback function
            zipWriter.close(callback);
        });
    }, onerror);
}
function unzipBlob(blob, callback) {
    // use a zip.BlobReader object to read zipped data stored into blob variable
    zip.createReader(new zip.BlobReader(blob), function (zipReader) {
        // get entries from the zip file
        zipReader.getEntries(function (entries) {
            // get data from the first file
            entries[0].getData(new zip.BlobWriter("text/plain"), function (data) {
                // close the reader and calls callback function with uncompressed data as parameter
                zipReader.close();
                callback(data);
            });
        });
    }, onerror);
}

function onerror(message) {
    console.error(message);
}






