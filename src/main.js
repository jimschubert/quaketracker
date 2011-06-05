$(document).ready(function(){ 
	/* init map */
	var map;
	var lastWindow;
	var markers = [];

	var quakes7day25 = "http://www.earthquake.usgs.gov/eqcenter/catalogs/7day-M2.5.xml";
	var quakes24hour25 = "http://www.earthquake.usgs.gov/eqcenter/catalogs/1day-M2.5.xml";
	var quakes7day5 = "http://www.earthquake.usgs.gov/eqcenter/catalogs/7day-M5.xml";

	var latlng = new google.maps.LatLng(35.6802, -121.1165);

	var myOptions = {
		zoom: 3,
		center: latlng,
		mapTypeControl: true,
		mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
		navigationControl: true,
		navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
		mapTypeId: google.maps.MapTypeId.SATELLITE
		};
		
   map = new google.maps.Map($("#map").get(0), myOptions);
  
  /* setup selection list */
  $('li').click(function(){
	 $('ul li').attr('class', '');
	 try{
	   loadQuakes(eval($(this).attr('id')));
	 }
	 catch(err){
		/* console.error(err.message); // works in firebug,chrome */
	 }
	 $(this).attr('class', 'selected');
	});
  $('#close').click(function(){
	$('#menu').hide();
	$('#button').show();
	});
  $('#button').click(function(){
	$('#button').hide();
	$('#menu').show();
	});
		
	/* SEE : http://www.xml.com/pub/a/2007/10/10/jquery-and-xml.html */
	$('#map').ready(function(){
	  loadQuakes(quakes24hour25);
	});

	function loadQuakes(xmlLocation)
	{
	 /* clear event listeners */
	 clearMarkers();

	 /* call ajax method to retrieve earthquakes */
	  $.ajax({
		type: "GET",
		url: "getxml.php?q=" + xmlLocation, 
		dataType: "xml",
		error: function(e) {  },
		success: function(xml){
				/* TODO: do we need to bind this to elements now or can we cache?  Users won't even see 90% of these */
				$(xml).find('entry').each(function(){
					/* Retrieve all needed values from XML */
					var title = $(this).find('title').text();
					var summary = $(this).find('summary').text();
					var coord = $(this).find('georss\\:point').eq(0).text();
					if(!coord){var coord = $(this).find('point').text();}; /* fixes for certain browsers */
					var points = coord.split(' ');
					var latitude = parseFloat(points[0]);
					var longitude = parseFloat(points[1]);	
					var htmlString = "<div class=\"infowindow\"><b>" + title + "</b>" + "<p>" + summary + "<br></div>";
				
					var myLatlng = new google.maps.LatLng(latitude,longitude);
					var marker = new google.maps.Marker(
					{
						 position: myLatlng,
						 map: map,
						 title: title
					});
					markers.push(marker);
					addInfoWindow(marker, map, htmlString);
				
					$('#output').text("Showing " + markers.length + " earthquakes");
				});/*  end each */
			}
		}); /* end $.ajax */
	};/*  end function */

	function addInfoWindow(marker, map, message){	
		/* set balloon */
		var infowindow = new google.maps.InfoWindow(
		{
		      content: message
		});		
	
		/* add listener to marker */
		google.maps.event.addListener(marker, 'click' ,function(){
			infowindow.open(map,marker);
	
		if(lastWindow) { lastWindow.close(); lastWindow = null; }
			lastWindow = infowindow;
		});
	};/* end function */

	function clearMarkers() {
		if(lastWindow) { lastWindow.close(); lastWindow = null; }
		for(var i=0;i<markers.length;i++){
			google.maps.event.clearListeners(markers[i], 'click');
			markers[i].setMap(null);
		}
		markers = [];
	};/* end function */
});
	
