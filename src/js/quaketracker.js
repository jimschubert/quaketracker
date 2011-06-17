/*
Copyright (c) 2009-2011 Jim Schubert, ipreferjim.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

(function(){

QuakeTracker = function(googleMap) { 
	if(!(this instanceof QuakeTracker)){
		return new QuakeTracker(googleMap);
	}	
	this.map = googleMap;
	this.infowindow = null;
	this.markers = [];
	this.feeds = {	
		'quakes-1hr-M00' : {
			description: 'M 0+ earthquakes (Past hour)',
			atom: 'http://earthquake.usgs.gov/earthquakes/catalogs/1hour-M0.xml'
		},
		'quakes-1hr-M10' : {
			description: 'M 1+ earthquakes (Past hour)',
			atom: 'http://earthquake.usgs.gov/earthquakes/catalogs/1hour-M1.xml'
		},
		'quakes-1dy-M00' : {
			description: 'M 0+ earthquakes (Past day)', 
			atom: 'http://earthquake.usgs.gov/earthquakes/catalogs/1day-M0.xml'
		},
		'quakes-1dy-M10' : {
			description: 'M 1+ earthquakes (Past day)',
			atom: 'http://earthquake.usgs.gov/earthquakes/catalogs/1day-M1.xml'
		},
		'quakes-1dy-M25' : {
			description: 'M 2.5+ earthquakes (Past day)', 
			atom: 'http://earthquake.usgs.gov/earthquakes/catalogs/1day-M2.5.xml'
		},
		'quakes-1wk-M25' : {
			description: 'M 2.5+ earthquakes (Past week)', 
			atom: 'http://earthquake.usgs.gov/earthquakes/catalogs/7day-M2.5.xml'
		},
		'quakes-1wk-M50' : {
			description: 'M 5+ earthquakes (Past week)', 
			atom: 'http://earthquake.usgs.gov/earthquakes/catalogs/7day-M5.xml'
		},
		'quakes-1wk-M70' : {
			description: 'M 7+ earthquakes (Past week)', 
			atom: 'http://earthquake.usgs.gov/earthquakes/catalogs/7day-M7.xml'
		}
	};
	this.quakes = {};
};

QuakeTracker.prototype.loadQuakes = function(feed) {
 var self = this;
 /* clear event listeners */
 this.clearMarkers();

 /* call ajax method to retrieve earthquakes */
  $.ajax({
	type: "GET",
	url: "script/getxml.php?q=" + feed.replace(/^http:\/\//g, ''), 
	dataType: "xml",
	error: function(e) {  
		console.error(e.message);
	},
	success: function(xml){
			/* TODO: do we need to bind this to elements now or can we cache?  Users won't even see 90% of these */
												
			$(xml).find('entry').each(function(){
				/* Retrieve all needed values from XML */
				var entry = $(this);
				var title = entry.find('title').text();							
				var summary = entry.find('summary').text();
				var coordText = entry.find('point').eq(0).text();
				var coord = coordText.split(' ');	
				var age = entry.find('category[label="Age"]').attr('term');
				var myLatlng = new google.maps.LatLng(parseFloat(coord[0]), parseFloat(coord[1]));
				var marker = new google.maps.Marker({
					 position: myLatlng,
					 map: self.map,
					 title: title
				});
				var magnitude = title.split(',')[0].split(' ')[1].split('.');								
				var icon = new google.maps.MarkerImage('img/markers.png',
				  new google.maps.Size(35,35),
				  new google.maps.Point(35*parseInt(magnitude[1], 10), 35*parseInt(magnitude[0], 10)),
				  new google.maps.Point(0, 13));
				  
				marker.setIcon(icon);
				
				var htmlString = "<div class=\"infowindow\"><b>" + title + " (" + age + ")</b>" +
								 "<p>" + summary + "</p>" + 
								 "<div class=\"coords\">Lat/Long: [" + coordText + "]</div>" + 
								 "</div>";
				self.addMarker(marker, htmlString);			
			});/*  end each */
			$('#output').text("Showing " + self.markers.length + " earthquakes");
		}
	}); /* end $.ajax */
};/*  end QuakeTracker.protoype.loadQuakes */

QuakeTracker.prototype.closeInfoWindow = function() {
	if(this.infowindow && ("function" == typeof this.infowindow.close)){
		this.infowindow.close();
	}
}

QuakeTracker.prototype.addMarker = function(marker, msg){	
	var self = this;
	if(null == self.infowindow){
		self.infowindow = new google.maps.InfoWindow();
		google.maps.event.addListener(self.map, 'click', function() {
			self.closeInfoWindow();
		});
	}
	
	/* add listener to marker */
	google.maps.event.addListener(marker, 'click' ,function(){		
		/* set balloon */
		self.infowindow.setContent(msg);
		self.infowindow.open(self.map, marker);	
	});
		
	self.markers.push(marker);
};/* end QuakeTracker.prototype.addMarker */

QuakeTracker.prototype.clearMarkers = function() {
	var self = this;
		if(self.lastWindow) { self.lastWindow.close(); self.lastWindow = null; }
		for(var i=0;i<self.markers.length;i++){
			google.maps.event.clearListeners(self.markers[i], 'click');
			self.markers[i].setMap(null);
		}
		self.markers = [];
	};/* end QuakeTracker.prototype.clearMarkers */

return QuakeTracker;

})();
