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
	img = new Image;
	img.src = baseImage;		
	ctx.font = 'normal 12px Impact';
	ctx.textAlign = 'center';
	for(var magnitude = 0; magnitude <= 100; magnitude++) {
		var y = 35 * Math.floor(magnitude/10),
			x = ( 35*(magnitude % 10) );
			
		ctx.drawImage(img, x, y, 35,35);
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
