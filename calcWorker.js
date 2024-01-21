var f, c, brightnessMul, axes, colorPalette, A;//, roundPistonPattern;
var dirFunc;
var planarSourceSize = 0.0;
var ABright;
var dirArray = [omniDir, cardioidDir, superCardioidDir, squarePistonDir, roundPistonDir];
var piBy180 = Math.PI/180.0;

self.addEventListener('message', calcImgData);

function calcImgData(e)
{
	if (e.data.length != 11) {
		return;//not our message?
	}
	var imgData = e.data[0];
	var stepsXcount = e.data[1];
	var stepsYcount = e.data[2];
	axes = e.data[4];
	f = e.data[5];
	c = e.data[6];

	var k = 2.0*Math.PI*f/c;

	var ptchSize = e.data[3];
	var scaledPatch = ptchSize*axes.scale;

	brightnessMul = e.data[7];
	colorPalette = e.data[8];
	sources = e.data[9];

	if(sources.length == 0) return;

	A = e.data[10];

	ABright = A*brightnessMul;

	//console.log("k : " , k, "size: ", planarSourceSize );
	var axesx0scaled = -axes.x0*axes.scale + scaledPatch/2.0;
	var axesy0scaled = -axes.y0*axes.scale + scaledPatch/2.0;

	var fsrc = sources[0];
	dirFunc = dirArray[fsrc.dir];
	planarSourceSize = fsrc.size;

	//postMessage(['error', +imgData.height ]);
	//while(ptchSize>=1)
	//{
	var ii = 0;
	for (var j = 0; j < stepsYcount; j++)
	{
		var jScaledPatch = j*scaledPatch;
		 for (var i = 0; i < stepsXcount; i++)
		{
			// if(ii>imgData.data.length)
			// {
			// 	self.postMessage(['error', "Worker Error: ii too long: " + ii + " img: "+ imgData.data.length]);
			// 	break;
			// }

			var intens = 255.0*getIntencityInPoint(axesx0scaled + i*scaledPatch,
											 axesy0scaled + jScaledPatch, k);

			// console.log("calc intens NaN1: " + intens + " i = " + i + " j = " + j);

			if(!isNaN(intens))
			{
				if(intens <= 0.0)  intens = 0.0;
				else if(intens > 255.0) intens = 255.0;

				var color = colorPalette[Math.round(intens)];

				// console.log("calc intens NaN: " + intens + " color: " + color + " i = " + i + " j = " + j);

				imgData.data[ii] = color.red;
				imgData.data[ii+1] = color.green;
				imgData.data[ii+2] = color.blue;
				imgData.data[ii+3] = 255;
			}
			ii+=4;
		};
		// console.log("calc post prog message: " + 100.0*j/stepsYcount);
		if (j%10==0) self.postMessage(['prog', 100.0*j/stepsYcount, e.data[3]]);
	};
	//e.data[0] = imgData;
	// console.log("calc post data message");
	self.postMessage(['prog', 1.0, e.data[3]]);
	self.postMessage(e.data);
		//ptchSize = Math.ceil(ptchSize/2);
	//}
};


function getIntencityInPoint(px, py, k)
{
	var sx, sy;// = axes.x0;
	//var sy = axes.y0;
	var intens = 0;

	var sine = 0;
	var cosine = 0;
	var distk = 0;
	var dist = 0;
	for (var i = 0; i < sources.length; i++)
	{
		var source = sources[i];
		sx = source.x;// + axes.x0;
		sy = source.y;// + axes.y0;
		dist = Math.sqrt((px-sx)*(px-sx) + (py-sy)*(py-sy));
		//if (dist < 20) dist = 20;
		var dir = dirFunc(Math.acos((px-sx)/dist), k)/dist;
		distk = dist*k;
		sine += dir*(Math.sin(distk));
		cosine += dir*(Math.cos(distk));
	};

	intens = sine*sine + cosine*cosine;
	//intens = Math.log(intens/brightnessMul + 0.000001) + 1;

	intens = Math.log(ABright*ABright*intens + 0.000001)/brightnessMul + 0.7;
	//intens = Math.log(ABright*ABright*intens + 0.000001)/Math.LN10/brightnessMul + 1;
	//intens = Math.sqrt(ABright*ABright*intens);
	return intens;
}

function valueFromIntencity(val)
{

}

function getLinIntencityInPoint(px, py, k)
{
	var sx = 0.0, sy = 0.0;// = axes.x0;
	//var sy = axes.y0;
	var intens = 0.0;

	//var scaleA = brightnessMul;
	var sine = 0.0;
	var cosine = 0.0;
	//var ABright = A*brightnessMul;
	var distk = 0.0;
	var dist = 0.0;
	for (var i = 0; i < sources.length; i++)
	{
		var source = sources[i];
		sx = source.x;// + axes.x0;
		sy = source.y;// + axes.y0;
		dist = Math.sqrt((px-sx)*(px-sx) + (py-sy)*(py-sy));
		//if (dist < 20) dist = 20;
		var dir = dirFunc(Math.acos((px-sx)/dist), k)/dist;
		//var dir = dirFunc(Math.asin((py-sy)/dist), k)/dist;
		//var dir = dirFunc(((py-sy)/dist), k)/dist;
		//var dir = dirFunc(Math.atan((py-sy)/(px-sx)), k)/dist;
		distk = dist*k;
		sine += dir*(Math.sin(distk));
		cosine += dir*(Math.cos(distk));
	};

	intens = sine*sine + cosine*cosine;
	return Math.sqrt(intens);
}

function j1(x)
{
	var integral = 0.0;
	for(var i = 0; i < 180; i +=18)
	{
		var theta = piBy180*i;
		integral += Math.cos(theta)*Math.sin(x*Math.cos(theta));
	}
	return integral/10;
}

// function j1x(x)
// {
// 	var index = Math.floor(x*1800/Math.PI);

// 	return j1array[index];
// }

// function j1fast(x)
// {
// 	var pi = Math.PI;
// 	return Math.sqrt(2/(pi*x))*(1+3/(16*x*x) - 99/(512*x*x*x*x))*Math.cos(x - 3*pi/4 + 3/(8*x) - 21/(128*x*x*x));
// }

function omniDir(ang)
{
	return 1.0;
}

function squarePistonDir(ang, k)
{
	if(ang==0.0) return 1.0;
	ang = Math.sin(ang) * k * planarSourceSize;
	return (Math.sin(ang)/ang);
}

function hyperCardioidDir(ang)
{
	return (1.0 + 3.0*Math.cos(ang))/4.0;
}

function superCardioidDir(ang)
{
	//if(ang==0) return 1;
	//ang*=1.5;
	return 0.37 + 0.63*Math.cos(ang);
}

function cardioidDir(ang)
{
	//if(ang==0) return 1;
	return 0.5 + 0.5*Math.cos(ang);//(2*j1(ang)/ang);
}

function roundPistonDir(ang, k)
{
	if(ang==0.0) return 1.0;
	ang=k * planarSourceSize * Math.sin(ang);
	return (2.0*j1(ang)/ang);
}
