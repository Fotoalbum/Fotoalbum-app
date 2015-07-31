$(document).ready(function () {

    document.addEventListener("deviceready", onDeviceReady, true);

    //CreateNavigation();

});

function onDeviceReady() {

    window.screen.lockOrientation("landscape");

    AddEventListeners();

    createQuery("SELECT id, guid, name, datecreated, price, pages, thumb FROM USERPRODUCTS ORDER BY datecreated DESC", qGetUserProductsSuccess);

}

$("#lstAlbums").on("touchmove", function (event) {
    event.preventDefault();
});

function qGetUserProductsSuccess(tx, results) {

    try {

        var len = results.rows.length;

        var _albumCollection = new Array();

        $("#lstAlbums").html("");

        for (var i = 0; i < len; i++) {

            //TODO create Album object
            _albumCollection.push(results.rows.item(i));
            
            //TODO Cover IMG "<img src='http://api.xhibit.com/v2/" + album.cover_img + "' style='width:80px;'>" +
            var _li = "<div id='" + results.rows.item(i).guid + "' class='myAlbumRow row'>" +
                    "<div class='myAlbumCol col-xs-9'>" +
                    "<div id='img" + results.rows.item(i).guid + "' class='myAlbumImage'></div>" +
                    "<div class='myAlbumInfo'>" +
                    "<div class='myAlbumCaption'>" + results.rows.item(i).name + "</div>" +
                    "<div class='myAlbumSub'>Datum aangemaakt: " + results.rows.item(i).datecreated + "</div>" +
                    "<div class='myAlbumPrice'>Prijs: € " + results.rows.item(i).price + "</div>" +
                    "</div>" + //end info
                    "</div>" + //end colums
                    "<div class='myAlbumSelector col-xs-3'>" +
                    "<span id='btnAlbumEdit' class='glyphicon glyphicon-chevron-right'></span>" +
                    "<span id='btnAlbumDelete' class='glyphicon glyphicon-remove-circle'></span>" +
                    "</div>" + //end column
                    "</div>"; //end row

            $("#lstAlbums").append(_li);
            
            var pages = jQuery.parseJSON(unescape(results.rows.item(i).pages));
            $("#img" + results.rows.item(i).guid).css("background-image", "url('" + results.rows.item(i).thumb + "')");
            
            var myElement = document.getElementById(results.rows.item(i).guid);

            var swipeFunc = {
                touches: {
                    "touchstart": {"x": -1, "y": -1},
                    "touchmove": {"x": -1, "y": -1},
                    "touchend": false,
                    "direction": "undetermined"
                },
                touchHandler: function (event) {
                    var touch;
                    if (typeof event !== 'undefined') {
                        event.preventDefault();
                        if (typeof event.touches !== 'undefined') {
                            touch = event.touches[0];
                            switch (event.type) {
                                case 'touchstart':

                                    if (event.target.id === "btnAlbumEdit") {

                                        //Show the loading screen
                                        $("#myloader").show();

                                        //Edit this album
                                        GetProjectFromDatabase(event.currentTarget.id);

                                    }

                                    if (event.target.id === "btnAlbumDelete") {

                                        _project_to_delete = event.currentTarget.id;

                                        BootstrapDialog.show({
                                            title: 'Project verwijderen',
                                            message: 'Weet je zeker dat je dit project wilt verwijderen?',
                                            buttons: [{
                                                    label: 'JA',
                                                    action: function (dialog) {
                                                        DeleteProjectFromDatabase(_project_to_delete);
                                                        dialog.close();
                                                    }
                                                }, {
                                                    label: 'NEE',
                                                    action: function (dialog) {
                                                        _project_to_delete = null;
                                                        dialog.close();
                                                    }
                                                }]
                                        });
                                    }
                                case 'touchmove':
                                    swipeFunc.touches[event.type].x = touch.pageX;
                                    swipeFunc.touches[event.type].y = touch.pageY;
                                    break;
                                case 'touchend':
                                    swipeFunc.touches[event.type] = true;

                                    if (swipeFunc.touches.touchstart.x > -1 && swipeFunc.touches.touchmove.x > -1) {

                                        swipeFunc.touches.direction = swipeFunc.touches.touchstart.x < swipeFunc.touches.touchmove.x ? "right" : "left";

                                        if (swipeFunc.touches.direction === "left") {
                                            //Show delete button
                                            if ((swipeFunc.touches.touchstart.x - swipeFunc.touches.touchmove.x) > 100) {
                                                $(this).find('#btnAlbumEdit').css("visibility", "hidden");
                                                $(this).find('#btnAlbumDelete').css("visibility", "visible");
                                                $(this).css("background-color", "#FF0000");
                                            }

                                        } else {
                                            if ((swipeFunc.touches.touchmove.x - swipeFunc.touches.touchstart.x) > 100) {
                                                $(this).find('#btnAlbumEdit').css("visibility", "visible");
                                                $(this).find('#btnAlbumDelete').css("visibility", "hidden");
                                                $(this).css("background-color", "#FFFFFF");
                                            }
                                        }

                                        swipeFunc.touches.touchstart.x = -1;
                                        swipeFunc.touches.touchmove.x = -1;


                                    }

                                default:
                                    break;
                            }
                        }
                    }
                },
                init: function () {
                    myElement.addEventListener('touchstart', swipeFunc.touchHandler, false);
                    myElement.addEventListener('touchmove', swipeFunc.touchHandler, false);
                    myElement.addEventListener('touchend', swipeFunc.touchHandler, false);
                }
            };
            swipeFunc.init();


        }
        
        $("#myloader").hide();

    } catch (err) {
        
        $("#myloader").hide();
        
        alert("Error: " + err);
    }
}