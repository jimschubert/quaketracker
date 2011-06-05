/*
Copyright (c) 2009-2011 Jim Schubert, ipreferjim.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var quaketracker;
$(document).ready(function(){ 
	var menu = $('#menu'),
		btn = $('#button'),
		close = $('#close'),
		usgs = $('#usgs-feeds'),	
		latlng = new google.maps.LatLng(35.6802, -121.1165),	
		myOptions = {
			zoom: 3,
			mapTypeControl: true,
			center: latlng,
			mapTypeControlOptions: {
				style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
			},
			navigationControl: true,
			navigationControlOptions: {
				style: google.maps.NavigationControlStyle.SMALL
			},
			mapTypeId: google.maps.MapTypeId.SATELLITE
		},
		googleMap = new google.maps.Map(document.getElementById('map'), myOptions);
			
	quaketracker = new QuakeTracker(googleMap);
  
  	/* setup selection list */
	$('#usgs-feeds li').click(function(){
		$('#usgs-feeds li').removeClass('selected');
		 try{ quaketracker.loadQuakes(quaketracker.feeds[this.id]); }
		 catch(err){
		 	alert('could not load selected feed');
			/* console.error(err.message); // works in firebug,chrome */
		 }
		 $(this).addClass('selected');
	});
	
	close.click(function(){	menu.hide(); btn.show(); });
	btn.click(function(){ btn.hide(); menu.show(); });
		
	var selected = $('#usgs li.selected').attr('id');
	quaketracker.loadQuakes(quaketracker.feeds[selected]);
});
	
