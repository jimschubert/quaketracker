#!/usr/bin/env node

var p = require('sys').puts;

require.paths.unshift(__dirname + '/deps');

try {
	var probe = require('canvas');
}catch(e) {
    p("Cannot find node-canvas module.");
    p("You can download submodules for this project by doing:\n");
    p("\tgit submodule init");
    p("\tgit submodule update\n");
    process.exit();
}

var fs = require('fs');
var Canvas = require('canvas');
var Image = Canvas.Image;
var canvas = new Canvas(35*10,35*10);
var ctx = canvas.getContext('2d');
var baseImage = __dirname + '/base.png';
var outImage = __dirname + '/markers.png';

fs.readFile(baseImage, function(err,data) {
	if(err) throw err;
	var img = new Image;
	img.src = baseImage;		
	ctx.font = 'normal 12px Impact';
	ctx.textAlign = 'center';
	var color = [255, 255, 0, 235];
	for(var magnitude = 0; magnitude <= 100; magnitude++) {
		var y = 35 * Math.floor(magnitude/10),
			x = ( 35*(magnitude % 10) );
		if(magnitude % 5 == 0){
			color[1] = color[1] - 13;
		}
				
		ctx.drawImage(img, x, y, 35,35);
		
		var imgData = ctx.getImageData(x, y, 35, 35);
		if(imgData && imgData.data) {
			try {
				for(var pixel=0;pixel<imgData.data.length;pixel=pixel+4) {
					var red = imgData.data[pixel]
					var green = imgData.data[pixel+1];
					var blue = imgData.data[pixel+2];
					var alpha = imgData.data[pixel+3];
						
					if(red == 255 && green == 255 && blue == 255) {
						imgData.data[pixel] = color[0];
						imgData.data[pixel+1] = color[1];
						imgData.data[pixel+2] = color[2];
						imgData.data[pixel+3] = color[3];
					}
				}
			} catch (err) { console.error(err.message); }
		
			/* imageData, dx, dy, sx, sy, sw, sh */
			ctx.putImageData(imgData,x,y,0,0, 35, 35);
		}
		
		ctx.fillText("" + parseFloat(magnitude / 10, 1), x + (35/2), y + (35/2), 35);
	}
	
	var out = fs.createWriteStream(outImage), 
		stream = canvas.createPNGStream();

	stream.on('data', function(chunk){
	  out.write(chunk);
	});

	stream.on('end', function(){
	  console.log('saved ' + outImage);
	});
});
