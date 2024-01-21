var _l = function (string) {
    return string.toLocaleString();
};

var N = 8;				//number of sources
sourceSpacing = 24;		//distance between arrays
var A = 1.0;				//amplitude of 1 source
var ABright;

var c = 1450;
var f = 20;

var directivity = 0
var patchSize = 4;
var colorCount = 256;//colors in palette

var axes={};
var colorPalette = [];
var isResizing = false;
var sources = [];
var divToDrawString = "";
var brightnessMul = 10;
var zoomScale = 1.0;

var planarSourceSize = 0.01;

var dirShape;

var modes = ['map', 'dir'];
var mode = 'map';

var useWorker = true;

var piBy180 = Math.PI/180.0;

var calcWorker = new Array();

var canvas;
var oldX, oldY;
var dirFunc;
var dirArray;
var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";

var dirPlotData = {};
dirPlotData.minX = -180;
dirPlotData.maxX = 180;
dirPlotData.minY = -0.05;
dirPlotData.maxY = 1.05;
dirPlotData.normalize = true;

function setup(divtodraw)
{
	divToDrawString = divtodraw;
	setupCanvas(divtodraw);

	var form = document.getElementById('rightform');
	for(var i = 0; i < form.elements.length; i ++)
	{
		if(form.elements[i].type=='button')
		{
			form.elements[i].onclick = onButton;
		}
		else {
      form.elements[i].onchange = checkForm;
      form.elements[i].oninput = checkForm;
    }
	}
  var fooform = document.getElementById('plotfooterform');
  for(var i = 0; i < fooform.elements.length; i ++)
  {
  	if(fooform.elements[i].type=='button')
  	{
  		fooform.elements[i].onclick = onButton;
  	}
  	else {
      fooform.elements[i].oninput = checkForm;
      fooform.elements[i].onchange = checkForm;
    }
  }


	var dirSelect = document.getElementById("dirPattern");
	dirSelect.add(new Option("omni"));
	dirSelect.add(new Option("cardioid"));
	dirSelect.add(new Option("supercardioid"));
	dirSelect.add(new Option("for square..."));
	dirSelect.add(new Option("for disc..."));

	dirFunc = omniDir;

	axes.x0 = 200.0;// + .5*canvas.width;  // x0 pixels from left to x=0
	axes.y0 = canvas.height/2;// + .5*canvas.height; // y0 pixels from top to y=0
	axes.scale = zoomScale;                 // 40 pixels from x=0 to x=1

	axes.doNegativeX = true;

	window.onresize = resize;
	//var div = document.getElementById('canvas');
	window.onmouseover = onMouseOver;
	window.onmousedown = onMouseDown;
	//window.onmousewheel = onMouseWheel;
	if(window.addEventListener)
		window.addEventListener(mousewheelevt, onMouseWheel, false);
	else window.attachEvent(mousewheelevt, onMouseWheel, false);

	var dirModeButton = document.getElementById("dirButton");
	dirModeButton.onclick = onModeChange;
	dirModeButton = document.getElementById("mapButton");
	dirModeButton.onclick = onModeChange;

	dirArray = [omniDir, cardioidDir, superCardioidDir, squarePistonDir, roundPistonDir];
	//dirFunc = dirArray[0];
	onModeChange();
	setupColors();
	checkForm();
	updateForm();

  reportScaleInCaption();
}

function setGraphTopCaption(caption)
{
  var captionSpan = document.getElementById("graphcaption");
  if (captionSpan) {
    captionSpan.innerHTML = caption;
  }
}

function reportScaleInCaption()
{
    var fixed = (zoomScale < 0.1 ? 3:(zoomScale < 1.0 ? 2 : 1));
    setGraphTopCaption("scale: " + zoomScale.toFixed(fixed) + " m/px");
}

function onModeChange(e)
{
	var ddiv = document.getElementById("dirGraphDiv");
	var mdiv = document.getElementById(divToDrawString);
	var dbut = document.getElementById("dirButton");
	var mbut = document.getElementById("mapButton");
	var butDiv = document.getElementById("buttonsDiv");

	if (e)
	{
		switch (e.target)
		{
			case mbut:
				mode = 'map';
				break;

			case dbut:
				mode = 'dir';
				break;
		}
	}
	var isDir = (mode=='dir');
	ddiv.style.display = (isDir?"block":"none");
	mdiv.style.display = (isDir?"none":"block");
	dbut.style.display = (!isDir?"block":"none");
	mbut.style.display = (!isDir?"none":"block");

	if (e)
	{
		draw();
		//console.log(e.target.innerHTML);
		butDiv.innerHTML = e.target.innerHTML;
	}
	else butDiv.innerHTML = mbut.innerHTML;
}

function setupCanvas(divtodraw)
{
	var div = document.getElementById(divtodraw);
	//div.cursor='crosshair';
	if(!canvas)	canvas = document.getElementById('canvas');
	if (!canvas)
	{
		canvas = document.createElement('canvas');
		canvas.id = 'canvas';
		div.appendChild(canvas);
	}
	canvas.height=div.offsetHeight
	canvas.width=div.offsetWidth;
	canvas.style.cursor = 'crosshair';

	if (null==canvas || !canvas.getContext) return false;

	ctx=canvas.getContext("2d");

	ctx.imageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	ctx.imageRendering = "-webkit-optimize-contrast";

	return true;
}

function onMouseOver(e)
{
	if(e.toElement==canvas)
	{
		window.onmousemove = onMouseMove;
		oldX = e.layerX;
		oldY = e.layerY;
	}
	else if(e.fromElement==canvas)
	{
		window.onmousemove = 0;
    reportScaleInCaption();
	}
}

function onMouseMove(e)
{
	e.preventDefault();
  var fixed = (zoomScale < 0.5 ? 2 : 1);
  setGraphTopCaption("position: x = " + ((e.offsetX - axes.x0) * zoomScale).toFixed(fixed) + ", y = " + (-(e.offsetY - axes.y0)*zoomScale).toFixed(fixed) + " m");
}

function onMouseMoveDragging(e)
{
	e.preventDefault();
	var dx = e.screenX - oldX;
	var dy = e.screenY - oldY;

	oldX = e.screenX;
	oldY = e.screenY;

	axes.x0+=dx;
	axes.y0+=dy;

	draw();

  var fixed = (zoomScale > 2 ? 1 : 2);
  setGraphTopCaption("origin: x = " + (axes.x0 * zoomScale).toFixed(fixed) + ", y = " + (axes.y0*zoomScale).toFixed(fixed) + " m");
}

function onMouseDown(e)
{
	if(e.target==canvas)
	{
		//console.log("down", e.layerX, e.layerY);

		window.onmousemove = onMouseMoveDragging;
		window.onmouseup = onMouseUp;
		// document.body.style.cursor = "move";
		canvas.style.cursor = 'move';
		oldX = e.screenX;
		oldY = e.screenY;
		e.preventDefault();
	}
}

function onMouseUp(e)
{
	window.onmousemove = onMouseMove;
	window.onmouseup = 0;
	document.body.style.cursor = "default";
	canvas.style.cursor = 'crosshair';
}

function onMouseWheel(e)
{
	if(e.target != canvas) return true;

	//console.log(e);
	var d = 0.0;
	if(e.wheelDelta) d = e.wheelDelta/1000.0;
	else if(e.detail) d = -e.detail/80.0;
	zoomScale -= zoomScale*d;

  //console.log("wheel: " + e.wheelDelta);
  //console.log("zoom: " + zoomScale);

  if (isNaN(zoomScale)) {
    zoomScale = 1.0;
  } else if(zoomScale<=0.0001) zoomScale = 0.0001
	else if(zoomScale>100.0) zoomScale = 100.0;

	var zoomRange = document.getElementById("zoom");
  var zoomLog = Math.log(zoomScale)/Math.LN10;
	zoomRange.value = zoomLog;
	axes.scale = zoomScale;

	draw();

  reportScaleInCaption();

	if (e.preventDefault) e.preventDefault();
	if (e.returnValue) e.returnValue = false;
	return false;
}

function onButton(e)
{
	switch (e.target.id)
	{
		case 'waterbtn':
			c=1450;
			break;
		case 'airbtn':
			c=340;
			break;
		case 'brightbtn':
			brightnessMul = 10;
			break;
		case 'zoombtn':
			zoomScale = 1.0;
			break;
	}

	//console.log(e);

	updateForm(e);
	axes.scale = zoomScale;
	draw();
}

function updateForm(e)
{
	var qtyInput = document.getElementById("sQty");
	var separInput = document.getElementById("sSeparation");
	var freqInput = document.getElementById("freq");
	var speedInput = document.getElementById("speed");
	var brightRange = document.getElementById("brightness");
	var zoomRange = document.getElementById("zoom");
	var freqSpan = document.getElementById("freqSpan");

	var elDiv = document.getElementById("elementPropsDiv");
	if(directivity>=3) elDiv.style.display = "block";
	else elDiv.style.display = "none";

  // if (e==null || e.target != qtyInput) {
  // 	qtyInput.value = N;
  // }
  // if (e==null || e.target != separInput) {
	//    separInput.value = sourceSpacing;
  // }
  // if (e==null || e.target != freqInput) {
  // 	freqInput.value = f;
  // }
  if (e==null || e.target != speedInput) {
  	speedInput.value = c;
  }
  // if (e==null || e.target != brightRange) {
	//   brightRange.value = brightnessMul;
  // }
  // if (e==null || e.target != zoomRange) {
  // 	zoomRange.value = (Math.log(zoomScale)/Math.LN10).toFixed(3);// Math.floor(zoomScale*1000)/1000;
  // }

	freqSpan.innerHTML = _l("Frequency: ") + f.toString() + _l(" Hz  |  Elements Q-ty: ") + N + _l("  |  Spacing: ") + sourceSpacing + " m";

	var apertureSpan = document.getElementById("sApertureSpan");
	var fixed = (sourceSpacing<1?3:1);
	apertureSpan.innerHTML = "=> H = " + ((N-1)*sourceSpacing).toFixed(fixed) + " m";

	var separSpan = document.getElementById("sSeparationSpan");
	var la = c/f;
	separSpan.innerHTML = "= " + (sourceSpacing/la).toFixed(3) + " &#955;";

	var coef = 0;
	coef = ((directivity == 3)? 0.21:0.25);
	var deg = (180*Math.asin(coef*la/planarSourceSize)/Math.PI).toFixed(2);
	document.getElementById("thetaDiv").innerHTML = "2" + String.fromCharCode(920) + "(0.707) = 2 * " + deg + String.fromCharCode(176);
}

function checkForm(e)
{
	var qtyInput = document.getElementById("sQty");
	var separInput = document.getElementById("sSeparation");
	var freqInput = document.getElementById("freq");
	var speedInput = document.getElementById("speed");
	var brightRange = document.getElementById("brightness");
	var zoomRange = document.getElementById("zoom");

	N = parseInt(qtyInput.value);
	if (N < 1 || isNaN(N)) N = 0;
	if (N > 100) N = 100;
	//qtyInput.value = N;


	sourceSpacing = parseFloat(separInput.value);
	if(sourceSpacing<=0) sourceSpacing = 0.0001;
	//separInput.value = sourceSpacing;

	f = parseInt(freqInput.value);
	if(f<=0) f = 0.01;
	w = 2*Math.PI*f;
	//freqInput.value = f;

	c = parseInt(speedInput.value);
	if(c<=0) c = 0.01;
	//speedInput.value = c;
	//if(e) e.target.form.elements['waterbtn'].disabled = (c==1450);

	brightnessMul = parseFloat(brightRange.value);
	if(brightnessMul<=0) brightnessMul = 0.001;
	if(brightnessMul>20) brightnessMul = 20;
	//brightRange.value = brightnessMul;

	//zoomScale = ((100 - parseInt(zoomRange.value))/10.0);

	if(e && e.target.id == "zoom")
	{
		zoomScaleLog = parseFloat(zoomRange.value);
    zoomScale = Math.pow(10, zoomScaleLog);
    if (isNaN(zoomScale)) zoomScale = 1.0;
		else if (zoomScale < 0.0001) zoomScale = 0.0001;
    reportScaleInCaption();
	}

	if(e && e.target.id == 'dirPattern')
	{
		directivity = e.target.selectedIndex;
	}

	planarSourceSize = parseFloat(document.getElementById("sourceSizeInput").value);
	//console.log("cf: ", e);

	setupSources(axes);
	updateForm(e);
	axes.scale = zoomScale;
	draw();
}

function setupColors()
{
	var blue = 0, green = 0, red = 0;
	for(i = 0; i < colorCount; i ++)
	{
		var blue = 0, green = 0, red = 0;
		blue = 256*Math.sin(1.5*Math.PI*i/256);
		green = 256*Math.sin(1.5*Math.PI*i/256 - Math.PI/3);
		red = 256*Math.sin(1.5*Math.PI*i/256 - 2*Math.PI/3);
		if (red<0) red = 0;
		if (green<0) green = 0;
		if (blue<0) blue = 0;
		var color = {};
		color.red = Math.round(red);
		color.green = Math.round(green);
		color.blue = Math.round(blue);
		colorPalette.push(color);
	}
}

function colorFromPaletteByIndex(index)
{
  if (index >=0 && index < colorPalette.length) {
    return colorPalette[index];
  }
  var color = {};
  color.red = 0;
  color.green = 0;
  color.blue = 0;
  return color;
}

function getColorData()
{
	var ret = new Array();
	for(i = 0; i < colorPalette.length; i ++)
	{
		var color = colorPalette[i];
		var arr = [4];
		arr[0] = i;
		arr[1] = color.red;
		arr[2] = color.green;
		arr[3] = color.blue;
		ret.push(arr);
	}
	return ret;
}


function setupSources(axes)
{
	if(!axes)
	{
		console.log("setupSources(): axes not defined yet!");
		return;
	}
	if(sources)
	{
		sources.splice(0, sources.length);
		sources = null;
	}
	sources = new Array();
	var apertureHalph = (N-1)*sourceSpacing/2.0;

	for (var i = 0; i < N; i++)
	{
		var source = {};
		source.x = 0;
		source.y = - apertureHalph + sourceSpacing * i;
		source.dir = directivity;
		source.size = planarSourceSize;
		sources.push(source);
	};
}

function showAxes(ctx,axes)
{
	var co = ctx.globalCompositeOperation;
	//console.log("co: " + co);
	ctx.globalCompositeOperation = "lighter";
	ctx.globalApha = 0.5;

	var x0=axes.x0, w=ctx.canvas.width;
	var y0=axes.y0, h=ctx.canvas.height;
	var xmin = axes.doNegativeX ? 0.0 : x0;
	ctx.beginPath();
	ctx.lineWidth = 1.0;
	ctx.strokeStyle = "rgb(127,127,127)";
	ctx.moveTo(xmin, Math.round(y0) + 0.5); ctx.lineTo(w, Math.round(y0) + 0.5);  // X axis
	ctx.moveTo(Math.round(x0) + 0.5,0);    ctx.lineTo(Math.round(x0) + 0.5, h);  // Y axis
	ctx.stroke();

	ctx.beginPath();
	ctx.lineWidth = 0.4;
	ctx.strokeStyle = "rgb(127,127,127)";
	ctx.fillStyle = 'gray';
	var step = Math.pow(10, 2.0+Math.round(Math.log(axes.scale)/Math.LN10));
	//console.log(step);
	// if(axes.scale<0.01) step = 1;
	// else if(axes.scale<1) step = 10;
	// else
	// step = 100;-Math.floor(Math.log(step)/Math.LN10);

	var fixed = -Math.floor(Math.log(step)/Math.LN10);
	fixed = (fixed<0.0?0.0:fixed);


  //draw horizontal meter labels
  var x = x0;
  ctx.strokeStyle = "rgb(200,200,200)";
	while (x<w)
	{
		ctx.moveTo(Math.round(x) + 0.5, 0.0);
		ctx.lineTo(Math.round(x) + 0.5, h);
		ctx.fillText(((x - x0)*axes.scale).toFixed(fixed), x + 1.5, h - 1.5);
  	x+= step/axes.scale;
	}
	x = x0;
	ctx.strokeStyle = "rgb(127,127,127)";
	while (x>0)
	{
		x-= step/axes.scale;
		ctx.moveTo(Math.round(x) + 0.5, 0.0);
		ctx.lineTo(Math.round(x) + 0.5, h);
	}

  //draw vertical meter labels
	var y = y0;
  ctx.strokeStyle = "rgb(200,200,200)";
	while (y<h)
	{
		ctx.moveTo(0, Math.round(y) + 0.5);
		ctx.lineTo(w, Math.round(y) + 0.5);
		ctx.fillText(((y0 - y) * axes.scale).toFixed(fixed), 2.5, y - 1.5);
  	y+= step/axes.scale;
	}
	var y = y0;
	ctx.strokeStyle = "rgb(127,127,127)";
	while (y>0)
	{
		y-= step/axes.scale;
		ctx.moveTo(0.0, Math.round(y) + 0.5);
		ctx.lineTo(w, Math.round(y) + 0.5);
	}
	ctx.stroke();
		//ctx.fillText(mcount*10, x0 - 1.5, yy - 1.5);
		//ctx.fillStyle = 'black';
	ctx.globalApha = 1;
	ctx.globalCompositeOperation = co;
}

function resize()
{
	if (!isResizing)
	{
		isResizing = true;
		setupCanvas(divToDrawString);
		draw();
	}
	//console.log('resize: '+ divtodraw.eventPhase);
}


function onDirZoom(minDate, maxDate, yRanges)
{
	dirPlotData.minX = minDate;
	dirPlotData.maxX = maxDate;
	dirPlotData.minY = yRanges[0][0];
	dirPlotData.maxY = yRanges[0][1];
	//console.log(dirPlotData);
}

function drawDirectivity(directdivStr)
{
	var vr = [dirPlotData.minY, dirPlotData.maxY];
	var dw = [dirPlotData.minX, dirPlotData.maxX];
	dirFunc = dirArray[sources[0].dir];
	var lbls =  ["Theta", "Y"];//+String.fromCharCode(176)
  var labelColor = "rgb(200, 200, 200)";
  var colors = new Array();
  colors[0] = "rgb(0, 240, 0)";
	var gr = new Dygraph(document.getElementById(directdivStr), getDirData, {colors:colors, axisLabelColor:labelColor, labels:lbls, zoomCallback:onDirZoom, dateWindow:dw, valueRange:vr});//, {colors:["red", "green", "blue"]});
}

function getDirData()
{
	//console.log('getdata');
	var arr = new Array();

	var dist = sources.length*sourceSpacing*1000;
	var max = -10000.0;
	var k = 2.0*Math.PI*f/c;
	for(var i = -180; i < 180; i+=0.025)
	{
		var px = dist*Math.cos(piBy180*i);
		var py = dist*Math.sin(piBy180*i);
		var intens = getLinIntencityInPoint(px, py, k); //
		//var intens = roundPistonDir(piBy180*i);
		if(intens>max) max = intens;

		arr.push([Number(i.toFixed(4)), intens]);
	}
	for(var i = 0; i < arr.length; i ++)
	{
		sarr = arr[i];
		sarr[1] = (sarr[1]/max);
		//arr[i] = a
	}
	return arr;
}

function draw()
{
	//var time = + new Date();

	if(mode=='dir')
	{
		drawDirectivity("dirGraphDiv");
		return;
	}

	ctx=canvas.getContext("2d");

	// ctx.imageSmoothingEnabled = false;
	// ctx.imageSmoothingEnabled = false;
	// ctx.mozImageSmoothingEnabled = false;
	// ctx.imageRendering = "-webkit-optimize-contrast";

  drawColorImageMap(ctx, axes, "rgb(128,128,128)", 8.0);
  showAxes(ctx, axes);
  drawSources (ctx, axes, "rgb(128,200,128)", 1);

// drawColorImageMapAsync(ctx, axes, "rgb(128,128,128)", 8.0);

	if(calcWorker)
	{
		for (var i = 0 ; i < calcWorker.length; i ++)
		{
			try
			{
				calcWorker[i].terminate();
			}
			catch(e){};
		}
		calcWorker.splice(0, calcWorker.length);
	}

	if (window.Worker && useWorker && sources.length!=0)
	{
		// calcWorker.push( drawColorImageMapAsync(ctx, axes, "rgb(128,128,128)", 8.0) );
		calcWorker.push( drawColorImageMapAsync(ctx, axes, "rgb(128,128,128)", 4.0) );
		// calcWorker.push( drawColorImageMapAsync(ctx, axes, "rgb(128,128,128)", 2.0) );
		calcWorker.push( drawColorImageMapAsync(ctx, axes, "rgb(128,128,128)", 1.0) );
	}

	//console.log("total time: " + (new Date() - time) + " ms");
	isResizing = false;
}

function drawSources (ctx, axes, color, thick)
{
	for (var i = 0; i < sources.length; i++)
	{
		var source = sources[i];
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(Math.round(source.x/axes.scale + axes.x0) + 0.5, Math.round(source.y/axes.scale + axes.y0) + 0.5, 5.0, 0.0, 2.0*Math.PI);
		ctx.fill();
	}
}

function drawColorImageMap (ctx, axes, color, pSize)
{
  setupCanvas(divToDrawString);
	var cwidth = ctx.canvas.width;
	var cheight = ctx.canvas.height;
	var stepsXcount = Math.ceil(cwidth/pSize);
	var stepsYcount = Math.ceil(cheight/pSize);
	var scaledPatch = axes.scale*pSize;

	var axesx0scaled = -axes.x0*axes.scale + scaledPatch/2;
	var axesy0scaled = -axes.y0*axes.scale + scaledPatch/2;

	var imgData = ctx.createImageData(stepsXcount,stepsYcount);

  if(sources.length != 0)
  {
    	dirFunc = dirArray[sources[0].dir];

    	var k = 2.0*Math.PI*f/c;
    	//console.log("k : " , k, "size: ", planarSourceSize );

    	var ii = 0;

    	ABright = A*brightnessMul;
    	for (var j = 0; j < imgData.height; j++)
    	{
    		 for (var i = 0; i < imgData.width; i++)
    		{
    			//var mul = 256.0*i/stepsXcount;

    			// var intens = getIntencityInPoint(- axes.x0/scaledPatch/2 + i*scaledPatch + scaledPatch/2,
    			// 	- axes.y0/scaledPatch/2 + k*scaledPatch + scaledPatch/2);

    			// if(ii>imgData.data.length){
    			// 	console.log("ii to long: " + ii + " img: "+ imgData.data.length);
    			// 	break;
    			// }

    			var intens = 255.0*getIntencityInPoint(axesx0scaled + i*scaledPatch,
    											 axesy0scaled + j*scaledPatch, k);

    			if(intens < 0 || isNaN(intens)) intens = 0;
    			else if(intens > 255.0) intens = 255.0;

    			var color = colorFromPaletteByIndex(Math.round(intens));
    			if(color)
    			{
    				imgData.data[ ii ] = color.red;
    				imgData.data[ii+1] = color.green;
    				imgData.data[ii+2] = color.blue;
    				imgData.data[ii+3] = 255;
    			}
    			else
    			{
    				// console.log("intens NaN: " + intens);
    			}
    			ii+=4;
    			//ctx.fillRect(i*deltaX, k*deltaY, i*deltaX + deltaX, k*deltaY + deltaY);
    		};
    		//pdiv.style.width = 100*i/progressMax + "%";
  	 };
  }
	tempcanvas = document.createElement('canvas');
	tempcanvas.width = imgData.width;
	tempcanvas.height = imgData.height;
	tempctx = tempcanvas.getContext("2d");
	//tempctx.imageSmoothingEnabled = false;
	tempctx.putImageData(imgData, 0, 0);

	//pSize = cwidth/imgData.width;

	ctx.scale(pSize, pSize);
	ctx.drawImage(tempcanvas,0,0);
	ctx.scale(1.0/pSize, 1.0/pSize);
}

function drawColorImageMapAsync (ctx, axes, color, pSize)
{
	var cwidth = ctx.canvas.width;
	var cheight = ctx.canvas.height;
	var stepsXcount = Math.ceil(cwidth/pSize);
	var stepsYcount = Math.ceil(cheight/pSize);
	//var scaledPatch = axes.scale*pSize;

	var imgData=ctx.createImageData(stepsXcount,stepsYcount);

	//console.log("ASYNC img data length: ", imgData.height);
	var worker;
	try
	{
		worker = new Worker('./calcWorker.js');
		//						0 			1 			2 		3 		4 	5  6		7			   	8		 9	    10
		worker.postMessage([imgData, stepsXcount, stepsYcount, pSize, axes, f, c, brightnessMul, colorPalette, sources, A]);
		worker.addEventListener('message', onImgDataReady);
	  	//worker.addEventListener('error', onError, false);
		//worker.onmessage = onImgDataReady;
	  	worker.onerror = onError;
  	}
  	catch(e)
  	{
  		console.log(e);
  	}
  	//worker.addEventListener('progress', onProgress);
  	return worker;
}

function onError(e)
{
	console.log(['ERROR: Line ', e.lineno, ' in ', e.filename, ': ', e.message].join(''));
}


function onImgDataReady(e)
{
	if(e.data[0] == 'error')
	{
		console.log(e.data[1]);
		return;
	}
	else if (e.data[0] == 'prog')
	{
		if( e.target==calcWorker[calcWorker.length-1])
		{
			//var prg = 0;
			//var pSize = e.data[3];

			//console.log(e.data[1]);

			setProgressBar(e.data[1]);
		}
		return;
	}

	var imgData = e.data[0];
	var ctx1 = ctx;//imgData.context;
	//console.log(imgData.width);
	//var cwidth = ctx1.canvas.width;
	//var cheight = ctx1.canvas.height;
	var stepsXcount = e.data[1];//Math.floor(cwidth);
	var stepsYcount = e.data[2];//Math.floor(cheight);

	tempcanvas = document.createElement('canvas');
	tempcanvas.width = imgData.width;
	tempcanvas.height = imgData.height;
	tempcanvas.getContext("2d").putImageData(imgData, 0, 0);

	var axesl = e.data[4];
	var patchSize = e.data[3];//ctx1.canvas.width/imgData.width; //
	ctx1.scale(patchSize, patchSize);
	ctx1.drawImage(tempcanvas,0,0);
	ctx1.scale(1.0/patchSize, 1.0/patchSize);

  showAxes(ctx1, axesl);
	drawSources (ctx1, axesl, "rgb(128,200,128)", 1);

	//wrk = e.target;
	//wrk.terminate();
	//calcWorker.splice(calcWorker.indexOf(e.target), 1);
	//console.log(e.target);

	if(e.target==calcWorker[calcWorker.length-1]) removeProgressBar();
}

function setProgressBar(prg)
{
	var pdiv = document.getElementById('progressdiv');
	pdiv.style.width = prg + "%";
}

function removeProgressBar()
{
	var pdiv = document.getElementById('progressdiv');
	pdiv.style.width = "0%";
}

// function getIntencityInPoint(px, py)
// {
// 	//var sx = axes.x0;
// 	//var sy = axes.y0;
// 	var intens = 0;

// 	var w = 2*Math.PI*f;

// 	var k = w/c;

// 	var scaleA = brightnessMul;
// 	var sine = 0;
// 	var cosine = 0;
// 	for (var i = 0; i < sources.length; i++)
// 	{
// 		var source = sources[i];
// 		sx = source.x;// + axes.x0;
// 		sy = source.y;// + axes.y0;
// 		var dist = Math.sqrt((px-sx)*(px-sx) + (py-sy)*(py-sy));
// 		//if (dist < 20) dist = 20;
// 		sine += (A*scaleA/dist*(Math.sin(dist*k)));
// 		cosine += (A*scaleA/dist*(Math.cos(dist*k)));
// 	};

// 	intens = sine*sine + cosine*cosine;
// 	intens = Math.log(intens)/scaleA + 1;

// 	//if (intens> 1) intens = 1;
// 	//else if (intens< 0) intens = 0;
// 	return intens;
// }

function colorFromIntencity(intens)
{
	if(intens <= 0)  return colorStringFromRGB(0, 0, 0);
	if(intens > 255) return colorStringFromRGB(255, 255, 255);
	intens = Math.round(intens);
	//else

	var color = colorPalette[intens];
	var red = color.red;
	var green = color.green;
	var blue = color.blue;

	return colorStringFromRGB(Math.round(red), Math.round(green), Math.round(blue));
}

function colorStringFromRGB(red, green, blue)
{
	return "rgb("+ red + "," + green + "," + blue + ")";
}

function randColor()
{
	return "rgb("+randomInt() + "," + randomInt() + "," + randomInt() + ")";
}

function randomInt()
{
	return Math.floor(256*Math.random());
}

function funGraph (ctx,axes,func,color,thick)
{
	var xx, yy, dx=4, x0=axes.x0, y0=axes.y0, scale=axes.scale;
	var iMax = Math.round((ctx.canvas.width-x0)/dx);
	var iMin = axes.doNegativeX ? Math.round(-x0/dx) : 0;
	ctx.beginPath();
	ctx.lineWidth = thick;
	ctx.strokeStyle = color;

	for (var i=iMin;i<=iMax;i++)
	{
		xx = dx*i; yy = scale*func(xx/scale);
		if (i==iMin) ctx.moveTo(x0+xx,y0-yy);
		else         ctx.lineTo(x0+xx,y0-yy);
	}
	ctx.stroke();
}

function getTestData()
{

  var marray = new Array();
  for(var i = 0; i < 16; i ++)
  {
    var arr = new Array();
    arr.push(i);
    arr.push(1, i);
    marray.push(arr);
  }
  return marray;
}


function drawColorMap (ctx, axes, color, thick)
{
	var pdiv = document.getElementById('progressdiv');
	var progress = 0;
	var progressMax = 0;

	var cwidth = ctx.canvas.width;
	var cheight = ctx.canvas.height;

	var deltaX = deltaY = patchSize;

	var stepsXcount = cwidth/deltaX;
	var stepsYcount = cheight/deltaY;

	progressMax = stepsXcount;

	for (var i = 0; i < stepsXcount; i++)
	{
		for (var k = 0; k < stepsYcount; k++)
		{
			//var mul = 256.0*i/stepsXcount;
			ctx.fillStyle = colorFromIntencity(getIntencityInPoint(i*deltaX + deltaX/2, k*deltaY + deltaY/2));
			ctx.fillRect(i*deltaX, k*deltaY, i*deltaX + deltaX, k*deltaY + deltaY);
		};
		//pdiv.style.width = 100*i/progressMax + "%";
	};
}
