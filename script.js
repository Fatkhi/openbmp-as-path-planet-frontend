(function () {
    window.addEventListener("DOMContentLoaded", function() {
       var viewer = new Cesium.Viewer('cesiumContainer', {
           terrainProviderViewModels : [], //Disable terrain changing
           infoBox : false, //Disable InfoBox widget
           selectionIndicator : false //Disable selection indicator
       });




       //Enable lighting based on sun/moon positions
       viewer.scene.globe.enableLighting = true;

       //Use STK World Terrain
    //    viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
    //        url : 'https://assets.agi.com/stk-terrain/world',
    //        requestWaterMask : true,
    //        requestVertexNormals : true
    //    });

       //Enable depth testing so things behind the terrain disappear.
       viewer.scene.globe.depthTestAgainstTerrain = true;

       //Set the random number seed for consistent results.
       Cesium.Math.setRandomNumberSeed(3);

       //Set bounds of our simulation time
       var start = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
       var stop = Cesium.JulianDate.addSeconds(start, 360, new Cesium.JulianDate());

       //Make sure viewer is at the desired time.
       viewer.clock.startTime = start.clone();
       viewer.clock.stopTime = stop.clone();
       viewer.clock.currentTime = start.clone();
       viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
       viewer.clock.multiplier = 10;

       //Set timeline to simulation bounds
       viewer.timeline.zoomTo(start, stop);

       //Generate a random circular pattern with varying heights.
       function computeCirclularFlight(ourarr,ourstart) {
           var newstart=ourstart;
           var property = new Cesium.SampledPositionProperty();
           for (var i = 0; i < ourarr.length; i += 1) {
               var radians = Cesium.Math.toRadians(i);
               var time=newstart;

               newstart = Cesium.JulianDate.addSeconds(newstart, 5, new Cesium.JulianDate());



               var position = Cesium.Cartesian3.fromDegrees(ourarr[i][0],ourarr[i][1],ourarr[i][2]);
               property.addSample(time, position);

               //Also create a point for each sample we generate.
               viewer.entities.add({
                   position : position,
                   point : {
                       pixelSize : 8,
                       color : Cesium.Color.TRANSPARENT,
                       outlineColor : Cesium.Color.YELLOW,
                       outlineWidth : 3
                   }
               });
           }
           return property;
       }
       var arr1=[[-112.110693, 36.0994841,200000.0],[-105.110693, 36.0994841,200000.0]];


       function aux1(ourarr,ourstart,ourstop){

       //Compute the entity position property.
       var position = computeCirclularFlight(ourarr,ourstart);

       //Actually create the entity
       var entity = viewer.entities.add({

           //Set the entity availability to the same interval as the simulation time.
           availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
               start : ourstart,
               stop : ourstop
           })]),

           //Use our computed positions
           position : position,

           //Automatically compute orientation based on position movement.
           orientation : new Cesium.VelocityOrientationProperty(position),

           //Load the Cesium plane model to represent the entity
           point : {
               pixelSize : 10,
               color : Cesium.Color.RED,
               outlineColor : Cesium.Color.BLACK,
               outlineWidth : 1
           },

           //Show the path as a pink line sampled in 1 second increments.
           path : {
               resolution : 1,
               material : new Cesium.PolylineGlowMaterialProperty({
                   glowPower : 0.1,
                   color : Cesium.Color.YELLOW
               }),
               width : 10
           }
       });
       }


       function aux2(ourarr,ourstart,ourstop){

           var newstart=ourstart;
           var rr=ourarr.length;
           rr=rr-1;
           while(newstart < ourstop){
               var newstop=Cesium.JulianDate.addSeconds(newstart, rr*5, new Cesium.JulianDate());

               aux1(ourarr,newstart,newstop);

               newstart=newstop;

           }
       }

        aux2(arr1,start,stop);

        // for webpage panel
        var i = 0;
        for (i=0; i<10000; i++) {
            var obj = document.querySelector('#scroll-panel');
            var newObj = document.createElement('div');
            newObj.className = 'panel-item';
            newObj.dataset.idx = i;
            newObj.innerHTML = i;
            newObj.onclick = function() {
                select(this)
            };
            obj.appendChild(newObj)
        }

        function select(obj) {
            obj.classList.add('active');
            selectArr.push(obj.dataset.idx);
        }

        function unSelectAll() {
            $('.active').removeClass('active');
            selectArr = [];
        }

        function save() {

        }



   }, false);
}());
