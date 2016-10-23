var viewer;
(function () {
    window.addEventListener("DOMContentLoaded", function() {
       viewer = new Cesium.Viewer('cesiumContainer', {
           terrainProviderViewModels : [], //Disable terrain changing
           infoBox : false, //Disable InfoBox widget
           selectionIndicator : false //Disable selection indicator
       });




        initPanel();

   }, false);
}());

function aux1(ourarr){

    var positions=Cesium.Cartesian3.fromDegreesArray(ourarr);

    var redWall = viewer.entities.add({
        name : 'Red wall at height',
        polyline : {
            positions : positions,
            minimumHeights : [100000.0, 100000.0],
            material : Cesium.Color.RED
        }
    });
}

// for webpage panel
var selectIdx = [];
var selectPrf = [];

// todo: get prefix and idx from server
function initPanel() {
    $.ajax({
        type: 'GET',
        url: 'http://192.241.130.219:8080/as/' ,
        success: function(res) {
            for (i=0; i<res.length; i++) {
                var obj = document.querySelector('#route-panel');
                var newObj = document.createElement('div');
                newObj.className = 'panel-item';
                newObj.dataset.idx = res[i].number;
                newObj.innerHTML = res[i].number;
                newObj.onclick = function() {
                    select(this)
                };
                obj.appendChild(newObj)
            }
        } ,
        dataType: 'json'
    });
    $.ajax({
        type: 'GET',
        url: 'http://192.241.130.219:8080/prefix/' ,
        success: function(res) {
            for (i=0; i<res.length; i++) {
                var obj = document.querySelector('#prefix-panel');
                var newObj = document.createElement('div');
                newObj.className = 'panel-item';
                newObj.dataset.prefix = res[i].prefix;
                newObj.innerHTML = res[i].prefix;
                newObj.onclick = function() {
                    select(this)
                };
                obj.appendChild(newObj)
            }
        } ,
        dataType: 'json'
    });

    $('#prefix-filter').bind('keyup', function(event) {
        if (event.keyCode == "13") {

            filterPanel();
        }
    });
}


function select(obj) {
    obj.classList.add('active');
    if (!!obj.dataset.idx) selectIdx.push(obj.dataset.idx);
    if (!!obj.dataset.prefix) selectPrf.push(obj.dataset.prefix);
}

function unSelectAll() {
    $('.active').removeClass('active');
    selectIdx = [];
}

function save() {
    var dataObj = {
        'as_path' : selectIdx,
        prefixes : selectPrf
    };
    var url = 'http://192.241.130.219:8080/updates/?as_paths=[' + dataObj.as_path.join(', ') + ']&prefixes=[' + dataObj.prefixes.join(', ') + ']';

    $.ajax({
        type: 'GET',
        url: url ,
        success: function(res) {
            console.log(res);
            var pathArr = [];
            for (var i=0; i<res.length; i++) {
                pathArr = [];
                var path = res[i].paths;
                for (var j=0; j<path.length; j++) {
                    pathArr.push(path[j].latitude);
                    pathArr.push(path[j].longitude);
                }
                console.log(pathArr);
                // clean the map
                viewer.entities.removeAll();
                aux1(pathArr);

            }
        } ,
        dataType: 'json'
    });
}

function filterPanel() {
    var qs = $('#prefix-filter').val();
    var items = $('.panel-item');
    for (var i=0; i<items.length; i++) {
        var thisPrefix = $(items[i]).data('prefix');
        if (!!thisPrefix && thisPrefix.indexOf(qs) < 0) {
            $(items[i]).hide();
        } else {
            $(items[i]).show();
        }
    }
}


