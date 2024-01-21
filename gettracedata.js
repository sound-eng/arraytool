var beamCount = 5;
var depthCount = 5;
var centerAngle = 2.2;
var angleStep = 0.2;

var a = [2.0, 2.2, 2.4, 2.5, 2.6 ];
//var Na = a.length;
var t = [];								// Г¬Г Г±Г±ГЁГў ГІГҐГ¬ГЇГҐГ°Г ГІГіГ° Г‚ГђГ’, ГЈГ°Г Г¤
//var c = [1525.0, 1525.5, 1526., 1520.02, 1500];	// Г¬Г Г±Г±ГЁГў Г±ГЄГ®Г°Г®Г±ГІГҐГ© Г‚ГђГ‘Г‡, Г¬/Г±
//var z = [   0,    5.,  30,  50,  100];	// Г¬Г Г±Г±ГЁГў ГЈГ«ГіГЎГЁГ­ ГЈГ®Г°ГЁГ§Г®Г­ГІГ®Гў, Г¬

var horizons = [{z: 0, c: 1525.0}, {z:5.0, c:1523.5}, {z:30, c: 1500.0}, {z:100, c:1524.02}];
//var N = Math.min(horizons.length);	// Г·ГЁГ±Г«Г® ГЈГ®Г°ГЁГ§Г®Г­ГІГ®Гў (Г®Г¤Г­ГЁГ¬ ГЁГ§ ГЈГ®Г°ГЁГ§Г®Г­ГІГ®Гў Г¤Г®Г«Г¦ГҐГ­ ГЎГ»ГІГј ГЈГ®Г°ГЁГ§Г®Г­ГІ Г Г­ГІГҐГ­Г­Г»)

var nh1 =1;								// Г­Г®Г¬ГҐГ° ГЈГ®Г°ГЁГ§Г®Г­ГІГ  Г Г­ГІГҐГ­Г­Г»

var sol;								// Г±Г®Г«ГҐГ­Г®Г±ГІГј, ГЇГ°Г®Г¬ГЁГ«Г«ГҐ
//var a = [ 5.4, 4.5,  4., 3.5,3.,2.7, 2.3, 2., 1.7, 1.5, 1.2, 1.];		// Г¬Г Г±Г±ГЁГў ГіГЈГ«Г®Гў ГўГ»ГµГ®Г¤Г , ГЈГ°Г Г¤
//var a = [];

var oldX = 0, oldY = 0;

var beamGraph = {};//data for each graph - axes, canvas and so on
beamGraph.axes = {};
beamGraph.axes.x0 = 20;
beamGraph.axes.y0 = 10;
beamGraph.axes.stepX = 100;//m
beamGraph.canvas = null;
beamGraph.divName = 'graphdiv';
beamGraph.draw = drawTraces;
beamGraph.xMin = 0;
beamGraph.xMax = 1030;//m
beamGraph.yMin = -100;//m
beamGraph.yMax = +5;//m
beamGraph.xMaxLimit = 4100.0;//m
beamGraph.lineWidth = 1.5;
beamGraph.lineColor = "rgb(66,44,255)";
beamGraph.Points = [];
beamGraph.selectedPoint = -1;
beamGraph.mouseDown = false;
beamGraph.parent = {};
beamGraph.drawPoints = drawPoints;
beamGraph.mouseMoveHandler = mouseMoveBeamGraph;

var speedGraph = {};
speedGraph.axes = {};
speedGraph.axes.x0 = 20;
speedGraph.axes.y0 = 10;
speedGraph.axes.stepX = 10;//m/s
speedGraph.canvas = null;
speedGraph.divName = 'speedgraphdiv';
speedGraph.draw = drawSpeeds;
speedGraph.xMin = 1450;
speedGraph.xMax = 1540;//m
speedGraph.yMin = -100;//m
speedGraph.yMax = +5;//m
speedGraph.lineWidth = 2;
speedGraph.lineColor = "rgb(66,100,220)";
speedGraph.Points = [];
speedGraph.selectedPoint = -1;
speedGraph.mouseDown = false;
speedGraph.parent = {};
speedGraph.drawPoints = drawPoints;
speedGraph.mouseMoveHandler = mouseMoveSpeedGraph;

var objectData = {};
objectData.depth = 90.0;
objectData.time = 0.6;
objectData.horDistance = 0;
objectData.leavingAngle = 0;
objectData.placeAngle = 0;
objectData.pathDistance = 0;

var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";

var showReflections = true;

//var distanceMaxX = beamGraph.xMax;// m away
var depth = horizons[horizons.length-1].z;// z[z.length-1];

setupArrays();

function setupArrays()
{
	a.splice(0, a.length);
	a = null;
	a = [];
	var span = (beamCount-1) * angleStep;
	for (i = 0; i < beamCount; i ++)
	{
		a.push(-span/2.0 + i*angleStep + centerAngle);
	}
	Na = a.length;
	//console.log(a);
}

function setup()
{

	//sel.size = 1;

	var form = document.getElementById('rightform');
	var selBeamC = form.elements['beamcount'];

	for(var i = 0; i < 60; i ++)
	{
		selBeamC.add(new Option(i+1));
	}
	selBeamC.selectedIndex = beamCount - 1;

	var selBeamStep = form.elements['beamstep'];
	var index = 0;
	var selindex = 0;
	for (var j = 0; j<3; j++)
	{
		var mul = 1*Math.pow(10,j);
		for(var i = 1; i < 10; i ++)
		{
			//var mul = ((i>10)?((i>20)?10:1):1);
			var val = Number(mul*i/100.0).toFixed(2-j);
			var opt = new Option(val);
			if(val==angleStep) selindex = index;

			index++;
			selBeamStep.add(new Option(val));
		}
	}
	selBeamStep.selectedIndex = selindex;

	var selBeamTilt = form.elements['beamcenter'];
	//for(var i = 0; i < 80; i ++)
	//{
	//	selBeamTilt.add(new Option(i));
		//selBeamTilt.add(new Option(i+0.5));
	//}
	selBeamTilt.min = -80;
	selBeamTilt.max = 80;
	selBeamTilt.step = 0.1;
	selBeamTilt.value = centerAngle;

	var selObjectDepth = form.elements['objectdepth'];
	selObjectDepth.step = 0.1;
	//console.log(form.elements);
	selObjectDepth.value = objectData.depth;
	var selObjectTime = form.elements['objecttime'];
	selObjectTime.step = 1;
	selObjectTime.value = objectData.time*1000;

	var selShowRef = form.elements['showreflections'];
	selShowRef.checked = showReflections;
	// console.log(selShowRef);
	for(var i = 0; i < form.elements.length; i ++)
	{
		form.elements[i].onchange = onControlChange;
	}

	window.onmouseover = onMouseOver;
	window.addEventListener(mousewheelevt, onMouseWheel, false);
	window.onresize = onResize;
	draw(beamGraph);
	draw(speedGraph);
	var tbl = document.createElement('table');

	var distanceInput = form.elements['distance'];
	distanceInput.value = beamGraph.xMax;

	var depthInput = form.elements['depth'];
	depthInput.value = -beamGraph.yMin;
	// console.log(document.getElementById("profile-table"));
}

var timerid = 0;

function onResize(e)
{
	if(timerid!=0)
	{
		clearInterval(timerid);
		//timerid = 0;
	}
	timerid = setTimeout(resizeLazily, 40);
}

function resizeLazily()
{
	// console.log('resize');
	draw(speedGraph);
	draw(beamGraph);
}

function onMouseOver(e)
{
	var from = e.fromElement;
	var to = e.toElement;
	var d;
	//console.log("over", e.target);
	// if(e.target==beamGraph.canvas)
	// {
	// 	//d = document.getElementById('graphdiv');
	// 	//d.style.border="1px solid #ddd";

	// 	e.target.style.cursor='crosshair';
	// 	beamGraph.parent.style.backgroundColor = '#f5f5f5';
	// 	//if(e.preventDefault) e.preventDefault();

	// }
	//else
	if (e.target==speedGraph.canvas || e.target==beamGraph.canvas)
	{
		//d = document.getElementById('speedgraphdiv');
		//d.style.border="1px solid #ddd";
		var graph = ((e.target==speedGraph.canvas)?speedGraph:beamGraph);

		var over = checkPointInArray(graph.Points, e.layerX, e.layerY, 20);
		//console.log(over);
		if(over>=0)
			e.target.style.cursor='move';
		else e.target.style.cursor='crosshair';
		graph.parent.style.backgroundColor = '#f5f5f5';

		window.addEventListener('mousemove', onMouseMove, false);
		window.addEventListener('mousedown', onMouseDown, false);
		window.addEventListener('mouseup', onMouseUp, false);
		if(e.preventDefault) e.preventDefault();
	}
	else// if(e.fromElement==canvas)
	{
		e.target.style.cursor='default';
		window.removeEventListener('mousemove', onMouseMove, false);
		window.removeEventListener('mousedown', onMouseDown, false);
		window.removeEventListener('mouseup', onMouseUp, false);
		if(speedGraph.selectedPoint>-1)
		{
			speedGraph.selectedPoint = -1;
			draw(speedGraph);
		}if(beamGraph.selectedPoint>-1)
		{
			beamGraph.selectedPoint = -1;
			draw(beamGraph);
		}
		beamGraph.parent.style.backgroundColor = '#eee';
		speedGraph.parent.style.backgroundColor = '#eee';
		//d.style.border="1px solid #fff";
		//window.onmousemove = 0;
	}
	oldX = e.screenX;
	oldY = e.screenY;
}

function checkPointInArray(arr, ptx, pty, precision)
{
	for(var i = 0; i < arr.length; i ++)
	{
		var pt = arr[i];
		if(Math.abs(ptx-pt.x)<precision && Math.abs(pty-pt.y)<precision) return i;
	}
	return -1;
}

function onMouseDown(e)
{
	var graph = ((e.target==speedGraph.canvas)?speedGraph:beamGraph);
	if(e.target == speedGraph.canvas)
	{
		speedGraph.mouseDown = true;

		var overI = checkPointInArray(graph.Points, e.layerX, e.layerY, 16);

		if(overI<0)
		{
			var dx = e.screenX - oldX;
			var dy = e.screenY - oldY;

			var cv = (e.layerX - graph.axes.x0)/graph.axes.scaleX + graph.xMin;
			var zv = (e.layerY)/graph.axes.scaleY - graph.yMax;

			//(x - axes.x0)/axes.scaleX + xMin = horizons[i].c
			//var y = horizons[i].z*axes.scaleY + axes.y0;

			var obj = {z:zv, c:cv};

			horizons.push(obj);
			horizons.sort(sortByDepths);

			draw(beamGraph);
			draw(speedGraph);
		}
	}
	else if(e.target == beamGraph.canvas)
	{
		beamGraph.mouseDown = true;
	}
	oldX.x = e.screenX;
	oldY.y = e.screenY;
}

function sortByDepths(a, b){
	return (a.z - b.z) //causes array to be sorted numerically and ascending
}

function onMouseMove(e)
{
	if (e.target==speedGraph.canvas || e.target==beamGraph.canvas)
	{
		var graph = ((e.target==speedGraph.canvas)?speedGraph:beamGraph);
		var bPress = graph.mouseDown;
		var isChange = false;
		var overI = checkPointInArray(graph.Points, e.layerX, e.layerY, 16);

		e.target.style.cursor = ((overI>=0)?'move':'crosshair');

		if(bPress == false)
		{
			//console.log(overI);
			isChange = (graph.selectedPoint!=overI);
			graph.selectedPoint = overI;
		}
		else if(graph.selectedPoint>-1)
		{
			isChange = graph.mouseMoveHandler(e);
		}
		if(isChange)
		{
			draw(graph);
			//draw(beamGraph);
		}
		if(e.preventDefault) e.preventDefault();
		if(e.returnValue) e.returnValue = false;
	}
	oldX = e.screenX;
	oldY = e.screenY;
	//return false;
}

function mouseMoveSpeedGraph(e)
{
	var ind = this.selectedPoint;
	var dx = e.screenX - oldX;
	var dy = e.screenY - oldY;

	var hor = horizons[ind];

	hor.c += dx/this.axes.scaleX;
	if(ind && ind < horizons.length-1)	{
		hor.z += dy/this.axes.scaleY;
	}
	if(ind>0 && hor.z<horizons[ind-1].z+5) hor.z = horizons[ind-1].z+5;
	if(ind<horizons.length-1 && hor.z>horizons[ind+1].z-5) hor.z = horizons[ind + 1].z - 5;
	draw(beamGraph);
	return true;
}

function mouseMoveBeamGraph(e)
{
	var pointIndex = this.selectedPoint;
	var dx = e.screenX - oldX;
	var dy = e.screenY - oldY;
	var deep = (e.layerY - this.axes.y0)/this.axes.scaleY;

	if(pointIndex==1)
	{
		objectData.depth = deep;
		document.getElementById('rightform').elements['objectdepth'].value = objectData.depth.toFixed(2);
		return true;
	}
	else if (pointIndex == 0)
	{
		//console.log(deep);
		var d = horizons[horizons.length-1].z;// z[z.length-1];

		var ind = 0;
		for(var i = 0; i < horizons.length; i ++)
		{
			var dist = Math.abs(deep - horizons[i].z);
			if (dist<d)
			{
				d=dist;
				ind = i;
			}
		}
		if(ind!=nh1)
		{
			nh1 = ind;
			return true;
		}
	}
	return false;
}

function onMouseWheel(e)
{
	if(e.target == beamGraph.canvas)
	{
		// console.log(e.wheelDelta, e.detail);
		if(e.shiftKey)
		{
			var dw;
			if(e.wheelDelta) dw=-e.wheelDelta/3.0;
			else if (e.detail) dw=e.detail*3.0;
			if((beamGraph.xMax+dw)<beamGraph.xMaxLimit && (beamGraph.xMax+dw)>110) beamGraph.xMax+=dw;
		}
		else
		{
			if(e.wheelDelta) centerAngle-=e.wheelDelta/300.0;
			else if (e.detail) centerAngle+=e.detail/4.0;
			setupArrays();
			document.getElementById('rightform').elements['beamcenter'].value = centerAngle.toFixed(2);
		}

		draw(beamGraph);

		e.returnValue=false;
		if(e.preventDefault) e.preventDefault();
		//else
		return false;
	}
}

function onMouseUp(e)
{
	//console.log(e.type);
	window.ononmouseup = 0;
	window.ononmousemove = 0;
	speedGraph.mouseDown = false;
	beamGraph.mouseDown = false;
}

function onControlChange(e)
{
	//console.log(e);
	var success = true;
	switch(e.target.id)
	{
		case 'beamcount':
			var n = e.target.selectedIndex;
			if (n>=0 && n < 60) beamCount = n+1;
			//e.target.selectedIndex = (beamCount - 1);
		break;

		case 'beamstep':
			var n = e.target.selectedIndex;
			var v = e.target.options[n].value;

			angleStep = v;
			//e.target.selectedIndex = Math.ceil(angleStep * 10) - 1;
		break;

		case 'beamcenter':
			//var n = e.target.selectedIndex;
			var v = e.target.value;
			centerAngle = parseFloat(v);
			//console.log(centerAngle);
			//e.target.selectedIndex = v;
		break;

		case 'objectdepth':
			var v = e.target.value;
			objectData.depth = parseFloat(v);
		break;

		case 'objecttime':
			var v = e.target.value;
			//console.log(parseFloat(v)/1000.0);
			objectData.time = parseFloat(v)/1000.0;
		break;

		case 'showreflections':
			var v = e.target.checked;
			// console.log(v);
			showReflections = v;//parseInt(v);
		break;

		case 'depth':
			horizons[horizons.length - 1].z = e.target.value;
			depth = horizons[horizons.length-1].z;
			beamGraph.yMin = -e.target.value;
			speedGraph.yMin = beamGraph.yMin;
			if (objectData.depth > depth) {
				objectData.depth = depth;
			}
			console.log(""+objectData.depth);
			draw(speedGraph);
			break;

		case 'distance':
			beamGraph.xMax = e.target.value;
			break;

		default: success = false;
		break
	}
	if(success)
	{
		setupArrays();
		draw(beamGraph);
	}
}

function showAxes(ctx,axes, graph)
{
	//console.log(this.lineWidth);
	var x0=axes.x0, w=ctx.canvas.width;
	var y0=axes.y0, h=ctx.canvas.height;
	var xmin = axes.doNegativeX ? 0 : x0;
	ctx.textAlign = 'center';
	ctx.beginPath();
	ctx.lineWidth = 0.3;
	ctx.strokeStyle = "rgb(128,128,128)";
	ctx.fillStyle = 'black';
	//ctx.moveTo(xmin,y0); ctx.lineTo(w,y0);  // X axis
	//ctx.moveTo(x0,0);    ctx.lineTo(x0,h);  // Y axis
	//ctx.stroke();

	var delta = axes.stepX*axes.scaleX;
	var xx=x0, yy=y0, mcount = 0;
	var tw = ctx.measureText("-1450.").width;
	var dvarw = Math.ceil(tw/delta);
	var twOffset = 0;
	while (xx<w)
	{
		mcount++;
		xx+=delta;

		if (twOffset < xx-tw/2)
		{
			ctx.moveTo(xx + 0.5,0);
			ctx.lineTo(xx + 0.5,h);
			var str = (mcount*axes.stepX + graph.xMin).toString();
			ctx.fillText(str, xx+1.5,7.5);
			twOffset = xx+tw/2;
		}
	}
	mcount = 0;
	var multi = (depth>500?100:10);
	delta = multi*axes.scaleY;
	ctx.textAlign = 'right';
	while (yy<h)
	{
		mcount++;
		yy+= delta;
		ctx.moveTo(xmin, + yy + 0.5);
		ctx.lineTo(w, yy + 0.5);
		var str = (mcount*multi);
		ctx.fillText(str, x0 - 1.5, yy - 1.5);
	}
	ctx.stroke();
	ctx.beginPath();
	ctx.lineWidth = 1.;
	ctx.strokeStyle = "rgb(24,24,24)";
	ctx.moveTo(xmin,y0); ctx.lineTo(w,y0);
	ctx.moveTo(x0,0);    ctx.lineTo(x0,h);
	ctx.stroke();

	ctx.beginPath();
	ctx.strokeStyle = "rgb(124,24,24)";
	ctx.moveTo(xmin, depth*axes.scaleY + y0); ctx.lineTo(w, depth*axes.scaleY + y0);
	//ctx.moveTo(x0,0);    ctx.lineTo(x0,h);
	ctx.stroke();
}

function draw(graph)
{
	var div = document.getElementById(graph.divName);

	if(!graph.canvas)
	{
		graph.canvas = document.getElementById('canvas');
		if (!graph.canvas)
		{
			graph.canvas = document.createElement('canvas');
			graph.canvas.id = graph.divName + 'canvas';
			div.appendChild(graph.canvas);
			graph.parent = div;
		}
	}
	graph.canvas.height=div.clientHeight - 2*parseInt(div.style.padding);
	graph.canvas.width=div.clientWidth - 2*parseInt(div.style.padding);
	//div.appendChild(canvas);

	if (null==graph.canvas || !graph.canvas.getContext) return;

	var axes=graph.axes;
	axes.scaleX = graph.canvas.width/(graph.xMax - graph.xMin + axes.x0);                 // 40 pixels from x=0 to x=1
	axes.scaleY = graph.canvas.height/(graph.yMax - graph.yMin);
	//axes.x0 = -graph.xMin*axes.scaleX;// + .5*canvas.width;  // x0 pixels from left to x=0
	//axes.y0 = -graph.yMin*axes.scaleY;// + .5*canvas.height; // y0 pixels from top to y=0
	axes.doNegativeX = true;

	ctx=graph.canvas.getContext("2d");

	graph.axes = axes;
	graph.draw(ctx, axes, graph.lineColor, graph.lineWidth);
}

function drawSpeeds (ctx, axes, color, thick)
{
	drawGradients(ctx, this);

	ctx.lineWidth = thick;
	ctx.strokeStyle = color;

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.fillStyle = "rgb(200,44,80)";
	var arr = [];
	for(var i = 0; i < horizons.length; i++)
	{
		var x = (horizons[i].c - this.xMin)*axes.scaleX + axes.x0;
		var y = horizons[i].z*axes.scaleY + axes.y0;
		arr.push({x:x, y:y});
		if(i==0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
		//console.log(x, y);
	}
	ctx.stroke();

	this.Points = arr;
	this.drawPoints(ctx);

	showAxes(ctx, axes, this);
}

function drawPoints(ctx)
{
	ctx.strokeStyle = "rgb(20,20,0)";
	ctx.fillStyle = "rgb(0,120,0)";
	ctx.lineWidth = 0.6;
	for(var i = 0; i < this.Points.length; i++)
	{
		var x = this.Points[i].x;
		var y = this.Points[i].y;

		ctx.beginPath();
		ctx.arc(x, y, ((i==this.selectedPoint)?10:4.5),0,2*Math.PI);
		ctx.fill();
		ctx.stroke();
	}
}

function drawGradients(ctx, graph)
{
	//var bottom = z[z.length-1];
	var grd = ctx.createLinearGradient(0,0,0,ctx.canvas.height);
	var startColor = '#e0ffff';
	var dpth = horizons[horizons.length-1].z;
	for(var i = 0; i < horizons.length; i ++)
	{
		var stop = horizons[i].z/dpth;
		var spdNorm = (horizons[i].c-1450)/100.0;
		if(spdNorm<0) spdNorm = 0;
		else if (spdNorm>1) spdNorm = 1;
		spdNorm = 1 - spdNorm;
		var color = 'rgb('
			+ (100+Math.floor(140*spdNorm)).toString()+ ','
			+ (147+Math.floor(107*spdNorm)).toString()+ ','
			+ (255).toString()+ ')';

		grd.addColorStop(stop, color);

		//console.log(color);
	}
	//grd.addColorStop(1, '#99ccff');
	ctx.fillStyle = grd;
	ctx.fillRect(graph.axes.x0, graph.axes.y0, ctx.canvas.width - graph.axes.x0, (dpth*graph.axes.scaleY));// + graph.axes.y0));
}

function drawTraces (ctx, axes, color, thick)
{
	//console.log(this.lineWidth);

	drawGradients(ctx, this);

	var marray = getTraceData();

	var xx, yy, dx=4, x0=axes.x0, y0=axes.y0, scaleX=axes.scaleX, scaleY = axes.scaleY;
	var iMax = Math.round((ctx.canvas.width-x0)/dx);
	var iMin = axes.doNegativeX ? Math.round(-x0/dx) : 0;


	ctx.lineWidth = thick;
	ctx.strokeStyle = color;
	for(i=0; i < marray.length; i ++)
	{
		var oneBeamData = marray[i];
		var firstPointData = oneBeamData[0];
		ctx.beginPath();
		ctx.moveTo(firstPointData[0]*scaleX + x0, firstPointData[1]*scaleY + y0);
		//ctx.moveTo(0, 0);
		//console.log(i + " " + oneBeamData.length);
		for(k=1; k<oneBeamData.length; k++)
		{
			onePointData = oneBeamData[k];
			ctx.lineTo(onePointData[0]*scaleX + x0, onePointData[1]*scaleY + y0);
			//ctx.lineTo(i*100., k*100.0);
		}
		ctx.stroke();
	}
	var objectPoint = drawFoundObject(ctx, axes);

	ctx.beginPath();
	ctx.lineWidth = 2.2;
	ctx.strokeStyle = "rgb(200,44,80)";

	ctx.moveTo(0 + x0, objectData.depth*scaleY + y0);
	// var tx = 100*Math.cos(Math.PI*centerAngle/180.0)*scaleX + x0;
	// var ty = 100*Math.sin(Math.PI*centerAngle/180.0)*scaleY + y0 + z[nh1]*scaleY;

	ctx.lineTo(this.xMax, objectData.depth*scaleY + y0);
	ctx.stroke();

	showAxes(ctx,axes,this);

	var xp = 0 + x0;
	var yp = y0 + horizons[nh1].z*scaleY;
	this.Points = new Array();
	this.Points.push({x:xp, y:yp});
	this.Points.push({x:objectPoint.x*scaleX + x0, y:objectPoint.y*scaleY + y0});
	this.drawPoints(ctx);
	// ctx.fillStyle = "rgb(200,44,80)";
	// ctx.beginPath();
	// ctx.arc(xp, yp, 4.5,0,2*Math.PI);
	// ctx.fill();
}

function getTraceData()
{
	var marray = new Array();

	var m=horizons.length, ma=a.length;

	var t, ch, te, h, hp, h1, gp, cf, dt, dt1, r, dr, dr1, r1;
	var i, mm, jt, nh;
	var csp, sp, s1, s2, cs2, sq1, sq2, s, q;
	var rg=0.01745329;
	var a1=-5.0;

	//var kt=1800;			// Г·ГЁГ±Г«Г® ГІГ®Г·ГҐГЄ Гў Г«ГіГ·ГҐ
	var dts=0.001;		// ГёГ ГЈ ГЇГ® ГўГ°ГҐГ¬ГҐГ­ГЁ Гў Г«ГіГ·ГҐ, Г±ГҐГЄ
	var kt = 2*beamGraph.xMax/1450.0/dts;
	var Y0 = horizons[nh1].z;
	var X0 = 0;
	var X, Y;

	mm=m-1;
    var g = new Array(mm);
    for(i=0; i<mm; i++)
    {
        if(horizons[i].c==horizons[i+1].c) horizons[i+1].c+=0.00001;
        g[i]=(horizons[i+1].c - horizons[i].c)/(horizons[i+1].z- horizons[i].z);
    }

    /*beams loop*/
    for(i=0; i<ma; i++)
    {
    	var beamDataArray = new Array();
    	var distanceArray = new Array();

    	beamDataArray.push(-Y0);
    	distanceArray.push(X0);
        //[curve moveToPoint:NSMakePoint(X0/xratio + xorigin,- Y0/yratio + yorigin)];

        a1=a[i];
        a1*=rg;
        s1=Math.sin(a1);
        cs2=Math.cos(a1);
        t=0.;
        r=0.;
        nh=nh1;
        ch=horizons[nh].c/cs2;
        /*beam Points loop*/
        for(jt=1; jt<kt; jt++)
        {
            te=jt*dts;
            /*current layer*/
        //m24:
        	if(te<=t)
        	{

            	h=hp;
            	//break m12;
        	}
        //m13:
        	else
			{
	        	h=horizons[nh].z;
	            hp=h;
	            sp=s1;
	            csp=Math.sqrt(1-sp*sp);
	            if(s1<0)
	            {
	            	if(nh<=0) continue;
	                gp=g[nh-1];
	                cf=horizons[nh-1].c;
	                if (!showReflections) continue;
	            }
	            else if(s1==0)
	            {
	                sp=0.0001;
	                s1=sp;
	                gp=g[nh];
	                if((nh+1)>=horizons.length) continue;
	                cf=horizons[nh+1].c;
	            }
	            else
	            {
	                gp=g[nh];
	                if((nh+1)>=horizons.length) continue;
	                cf=horizons[nh+1].c;
	            }
	            /*beam turn back test*/
	            if(ch>cf)
	            {
	                /*beam pass*/
	                cs2=cf/ch;
	                s2=Math.sqrt(1-cs2*cs2);
	                if(s1<0) s2=-s2;
	                s1=s2;
	                sq1=(1+sp)/(1-sp);
	                sq2=(1+s2)/(1-s2);
	                dt=Math.log(sq1/sq2)/gp/2;
	                dr=ch/gp*(sp-s2);
	                if(sp<0)
	                {
	                    nh--;
	                    if(nh==0)s1=-s2;
	                }
	                else
	                {
	                    nh++;
	                    if(nh==(m-1))s1=-s2;
	                }
	            }
	            /*beam turn back*/
	            else
	            {
	                s2=-s1;
	                s1=s2;
	                dr=2.*ch/gp*sp;
	                dt=Math.log((1+sp)/(1-sp))/gp;
	            }
	            /*angle in beam Point*/
	            t+=dt;
	            r+=dr;
	        }
            //if(t<te) break m24;

        //m12:

        	dt1=te-t+dt;
            q=(1+sp)/(1-sp)*Math.exp(-2.*gp*dt1);
            s=(q-1)/(q+1);
            cs2=Math.sqrt(1-s*s);
            /*beam Point coordinates*/
            dr1=ch/gp*(sp-s);
            r1=r-dr+dr1;
            h1=h+ch*(cs2-csp)/gp;

            X = r1/*gMax/1510/dts/kt+0.5*/;
            Y = h1/**maxY/z[m-1] + 0.5*/;
            beamDataArray.push([X, Y]);
        }
        marray.push(beamDataArray);
    }
	return marray;
}

function drawFoundObject(ctx, axes)
{
  	var N = horizons.length;
    var m=N; //ma=tr->Na;

    var t, t1, ch, te, h, hp, h1, cf, dt, dt1, r, dr, dr1, r1;// was var
    var i, mm, jt, nh;
    var csp, sp, s1, s2, cs2, sq1, sq2, s, q, gp;
    var rg=0.01745329;
    var a1;//=-5.;

    //var maxY = NSMaxY(rect);
    //var maxX = NSMaxX(rect);
    //var Y0 = tr->z[tr->nh1]/**maxY/z[m-1]+0.5*/;
    var Y0 = horizons[nh1].z;
    var X0 = 0;
    var X = 0, Y = 0;

    var dts=0.001;		// С€Р°Рі РїРѕ РІСЂРµРјРµРЅРё РІ Р»СѓС‡Рµ, СЃРµРє
    //var kt=400;			// С‡РёСЃР»Рѕ С‚РѕС‡РµРє РІ Р»СѓС‡Рµ
    var kt = 4000.0/1526./dts;

    /*РћРїСЂРµРґРµР»РµРЅРёРµ СЃРєРѕСЂРѕСЃС‚РµР№ РїРѕ С‚РµРјРїРµСЂР°С‚СѓСЂРµ*/
    // for(i=0; i<m; i++)	c[i]=1450+4.206*t[i]-0.0366*t[i]*t[i]+1.137*(sol-35)+0.0175*z[i];

    /*gradients definition*/
    mm=m-1;
    var g = new Array();//[mm];
    for(i=0; i<mm; i++)
    {
        if(horizons[i].c==horizons[i+1].c) horizons[i+1].c+=0.0001;
        g.push((horizons[i+1].c-horizons[i].c)/(horizons[i+1].z-horizons[i].z));
    }

    //    for(i=0; i < m; i ++)
    //    {
    //        var sol = 30;
    //        var a = -0.0366;
    //        var b = 4.206;
    //        var c = 1.137*(sol-35)+1450+0.0175*tr->z[i] - horizons[i].c;
    //
    //        var D = b*b - 4*a*c;
    //        var T1 = (-b + sqrtf(D))/(2*a);
    //        var T2 = (-b - sqrtf(D))/(2*a);
    //        var C1 = 1450+4.206*T1-0.0366*T1*T1+1.137*(sol-35)+0.0175*tr->z[i];
    //        var C2 = 1450+4.206*T2-0.0366*T2*T2+1.137*(sol-35)+0.0175*tr->z[i];
    //        NSLog(@"D = %2.3f, T1 = %2.3f, T2 = %2.3f, C1 = %2.3f", D, T1, T2, C1);
    //    }
    var tt = objectData.time;		// РІСЂРµРјСЏ РїСЂРѕС…РѕР¶РґРµРЅРёСЏ Р·РІСѓРєР° РѕС‚ СЂРѕР±РѕС‚Р° РІ С‚РѕС‡РєСѓ РїСЂРёРµРјР°, СЃРµРє
    var he = objectData.depth;	// РіР»СѓР±РёРЅР° СЂРѕР±РѕС‚Р° (РѕС‚ РїРѕРІРµСЂС…РЅРѕСЃС‚Рё), Рј

    var hdelta = 0;

    var dtPointDrawn = false;
    var na = 81;
    var da=180.0/(na-1);
    /*beams loop*/
    var astart = 89.0;
    //bool bailOut = false;
    var passes = 0;
    var minHdiff = 1000.0;
    var closeI;
    while (passes<4)
    {
        var i2 = na-1;
        var i1 = 0;
        closeI = -1;
        minHdiff = 1000.0;
        for(i=i1; i<i2; i++)
        {
			ctx.beginPath();
			ctx.moveTo(X0*axes.scaleX + axes.x0, Y0*axes.scaleY + axes.y0);
            dtPointDrawn = false;
            //a1=tr->a[i];
            a1=da*i - astart;
            if(Math.abs(a1*100)>8999) continue;
            a1*=rg;
            s1=Math.sin(a1);
            cs2=Math.cos(a1);
            t=0.;
            r=0.;
            nh=nh1;
            ch=horizons[nh].c/cs2;
            /*beam Points loop*/

            //refCount = 0;
            for(jt=1; jt<kt; jt++)
            {
                te=jt*dts;
                /*current layer*/

            //m24:

                //if(te>t) {} //goto m13;
                //else
                if(te<=t)
                {
                    h=hp;
                    //goto m12;
                }
                else
                /*m13:*/
                {
                    //if(nh>=tr->N) NSLog(@"problem");
                    h=horizons[nh].z;
                    hp=h;
                    sp=s1;
                    csp=Math.sqrt(1-sp*sp);
                    if(s1<0)
                    {
                        gp=g[nh-1];
                        if(nh<=0) cf=horizons[0].c;//on
                        //assert(nh>0);
                        else cf=horizons[nh-1].c;

                        //if (refCount>1) continue;
                    }
                    else if(s1==0)
                    {
                        sp=0.0001;
                        s1=sp;
                        gp=g[nh];
                        if ((nh+1)>=N) continue;//on
                        cf=horizons[nh+1].c;
                    }
                    else
                    {
                        gp=g[nh];
                        if ((nh+1)>=N) continue;//on
                        cf=horizons[nh+1].c;
                    }
                    /*beam turn back test*/
                    if(ch>cf)
                    {
                        /*beam pass*/
                        cs2=cf/ch;
                        s2=Math.sqrt(1-cs2*cs2);
                        if(s1<0) s2=-s2;
                        s1=s2;
                        sq1=(1+sp)/(1-sp);
                        sq2=(1+s2)/(1-s2);
                        dt=Math.log(sq1/sq2)/gp/2.0;
                        dr=ch/gp*(sp-s2);
                        if(sp<0)
                        {
                            nh--;
                            if(nh==0)s1=-s2;
                        }
                        else
                        {
                            nh++;
                            if(nh==(m-1))s1=-s2;
                        }
                    }
                    /*beam turn back*/
                    else
                    {
                        s2=-s1;
                        s1=s2;
                        dr=2.*ch/gp*sp;
                        dt=Math.log((1+sp)/(1-sp))/gp;
                    }
                    /*angle in beam Point*/
                    t+=dt;
                    r+=dr;
                }

                //if(t<te) goto m24;

                //m12:

                dt1=te-t+dt;
                q=(1+sp)/(1-sp)*Math.exp(-2.*gp*dt1);
                s=(q-1)/(q+1);
                cs2=Math.sqrt(1-s*s);
                /*beam Point coordinates*/
                dr1=ch/gp*(sp-s);
                r1=r-dr+dr1;

                var chdelta = ch*(cs2-csp)/gp;

                //if (jt>1 && hdelta/chdelta < 0 ) break;// avoid reflected rays

                h1=h+ch*(cs2-csp)/gp;
                t1=t-dt+dt1;
                if((hdelta/chdelta < 0 ) && (Math.abs(-h1+horizons[N-1].z)<2 || Math.abs(h1)<2) ) break;
                hdelta = chdelta;
                X = r1/*gMax/1510/dts/kt+0.5*/;
                Y = h1/**maxY/z[m-1] + 0.5*/;
                //if(X<0 || Y>tr->z[tr->N-1]) break;

                //NSPoint pt = NSMakePoint(X/xratio + xorigin,-Y/yratio + yorigin);
                //[curve lineToPoint:pt];
                ctx.lineTo(X*axes.scaleX + axes.x0, Y*axes.scaleY + axes.y0)
                //if(!showReflections && (absf(-h1+tr->z[tr->N-1])<1.3 || absf(h1)<1.3) ) break;//refCount++;
                //if(abs((t1-[[dataSource1 model]objectData]->objectTime)*1000.0f)==0)
                if(!dtPointDrawn && (t1>=tt))
                {
//                    NSRect rct = NSMakeRect(pt.x - 3, pt.y - 3, 6, 6);
//                    [[NSColor orangeColor]set];
//                    //[[NSColor colorWithDeviceRed:0.2 green:0.4 blue:0.8 alpha:0.6]set];
//                    if(!passes)
//                    {
//                        NSBezierPath *path = [NSBezierPath bezierPathWithOvalInRect:rct];
//                        [path fill];
//                        [path removeAllPoints];
////                        NSString * nstr = [NSString stringWithFormat:@"%2.2fВ°", (var)(a1/rg)];
////                        [nstr drawAtPoint:NSMakePoint(pt.x + 6, pt.y) withAttributes:[NSDictionary dictionaryWithObjectsAndKeys:[NSFont paletteFontOfSize:[NSFont smallSystemFontSize]], NSFontAttributeName, [NSColor blackColor], NSForegroundColorAttributeName, [[NSMutableParagraphStyle alloc] init], NSParagraphStyleAttributeName,nil]];
//                    }
                    dtPointDrawn = true;
                    break;
                }
                //if(t1>=tt) break;
            }
            //[curve setLineWidth:curveLineWidth];
            ;//passes/4.0 - 0.5;
            //[[NSColor lightGrayColor]set];
            if(passes==0)
            {
				ctx.strokeStyle = "rgb(50,50,50)";
				ctx.lineWidth = 0.1;
            	ctx.stroke();
            }
            else if(passes==3)
            {
            	ctx.strokeStyle = "rgb(250,0,0)";
				ctx.lineWidth = 1.4;
            	ctx.stroke();
							break;
            }
            else
            {

            	ctx.strokeStyle = "rgb(0,50,0)";
				ctx.lineWidth = 0.0;
            	//ctx.stroke();
            }

            //[curve removeAllPoints];
            if(dtPointDrawn &&  minHdiff > Math.abs(1000.0*he-1000.0*h1)/1000.0)
            {
                minHdiff =  Math.abs(1000.0*he-1000.0*h1)/1000.0;
                closeI = i;
            }
            else
            {
                //closeI = -1;
                //if(dtPointDrawn) break;
                //continue;

            }
        }
        //NSLog(@"found i = %d, delta = %2.2f", closeI, minHdiff);

        astart = -da*(closeI - 0.95) + astart;
        da = da/10.0;
        passes++;
        na = 21;
    }


    // NSBezierPath * horline = [[NSBezierPath alloc]init];
    // [horline setLineWidth:1.8f];
    // [horline moveToPoint:NSMakePoint(xMin, -objData->objectDepth/yratio + yorigin)];
    // [horline lineToPoint:NSMakePoint(xMax, -objData->objectDepth/yratio + yorigin)];
    // //Create New path that wil be filled
    // //[displacement appendBezierPath:curve];

    // //fill area under curve
    // [[NSColor colorWithDeviceRed:0.8f green:0.4f blue:0.3f alpha:0.9f] set];
    // [horline fill];
    // [horline stroke];

    // [horline removeAllPoints];
    // [horline release];

    var al=da*closeI - astart;
    var am=Math.atan(((h1-horizons[nh1].z)/r1))/rg;
    var rn=Math.sqrt(((h1-horizons[nh1].z)*(h1-horizons[nh1].z)+r1*r1));
    var rh=r1;
    var hr=h1;

    objectData.leavingAngle = al;
    objectData.placeAngle = am;
    objectData.horDistance = rh;
    objectData.pathDistance = rn;

  	// console.log(al.toFixed(2), am.toFixed(2), rn.toFixed(2), rh.toFixed(2), hr.toFixed(2));
  	reportObject();
  	return {x:X, y:Y};
}

function reportObject()
{
	var div = document.getElementById("reportDiv");
	if(!div) return;
	div.innerHTML = "Object: |     H = -" + objectData.depth/*.toFixed(1)*/ + "m   |   Theta = " + objectData.leavingAngle.toFixed(2) + "&#176;   |   X = " + objectData.horDistance.toFixed(1)+"m";
}

function reportHorizon(index)
{
	var div = document.getElementById("reportDiv");
	if(!div) return;
	div.innerHTML = "Horizon: |    C = " + horizons[index].c.toFixed(1) + "m/s   |   Depth = " + horizons[index].z.toFixed(1) + "m";
}

function fun1(x) {return Math.sin(x);  }
function fun2(x) {return Math.cos(3*x);}

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
