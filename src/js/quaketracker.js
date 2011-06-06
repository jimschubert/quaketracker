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
		'quakes7day25' : "http://www.earthquake.usgs.gov/eqcenter/catalogs/7day-M2.5.xml",
		'quakes24hour25' : "http://www.earthquake.usgs.gov/eqcenter/catalogs/1day-M2.5.xml",
		'quakes7day5' : "http://www.earthquake.usgs.gov/eqcenter/catalogs/7day-M5.xml"
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
	url: "script/getxml.php?q=" + feed, 
	dataType: "xml",
	error: function(e) {  
		console.error(e.message);
	},
	success: function(xml){
			/* TODO: do we need to bind this to elements now or can we cache?  Users won't even see 90% of these */
			$(xml).find('entry').each(function(){
				/* Retrieve all needed values from XML */
				var entry = $(this);
				var id = entry.find('id').text();
				var title = entry.find('title').text();
				self.quakes[id] = entry;
			
				var coord = entry.find('point').eq(0).text().split(' ');	
				var myLatlng = new google.maps.LatLng(parseFloat(coord[0]), parseFloat(coord[1]));
				var marker = new google.maps.Marker({
					 position: myLatlng,
					 map: self.map,
					 title: title
				});
				var magnitude = (parseFloat(title.split(',')[0].split(' ')[1]) * 10);
				magnitude = magnitude - (magnitude % 10); /* round down to nearest half */
				marker.setIcon('img/' + magnitude + '.png');
				self.addMarker(marker, id);			
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

QuakeTracker.prototype.addMarker = function(marker, quakeId){	
	var self = this;
	if(null == self.infowindow){
		self.infowindow = new google.maps.InfoWindow();
		google.maps.event.addListener(self.map, 'click', function() {
			self.closeInfoWindow();
		});
	}
	
	/* add listener to marker */
	google.maps.event.addListener(marker, 'click' ,function(){
		var id = quakeId;
		var entry = $(self.quakes[quakeId]);				
		var summary = entry.find('summary').text();
		var htmlString = "<div class=\"infowindow\"><b>" + marker.title + "</b>" + "<p>" + summary + "<br></div>";
		
		/* set balloon */
		self.infowindow.setContent(htmlString);
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
