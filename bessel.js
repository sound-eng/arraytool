var bessj0 = 1, bessy0;
function computeBessel(x) 
{
	var ax = x,z;
	var xx,y,ans,ans1,ans2;

	if(x==0)
	{
		bessj0 = 1;
	}
	if (x < 8.0) 
	{
	    y=x*x;
	    ans1=57568490574.0+y*(-13362590354.0+y*(651619640.7
						    +y*(-11214424.18+y*(77392.33017+y*(-184.9052456)))));
	    ans2=57568490411.0+y*(1029532985.0+y*(9494680.718
						  +y*(59272.64853+y*(267.8532712+y*1.0))));
	    bessj0 = ans=ans1/ans2;

	    // ans1 = -2957821389.0+y*(7062834065.0+y*(-512359803.6
					// 	    +y*(10879881.29+y*(-86327.92757+y*228.4622733))));
	    // ans2=40076544269.0+y*(745249964.8+y*(7189466.438
					// 	 +y*(47447.26470+y*(226.1030244+y*1.0))));
	    // bessy0=(ans1/ans2)+0.636619772*bessj0*Math.log(x);
	    
	} 
	else 
	{
	    z=8.0/ax;
	    y=z*z;
	    xx=ax-0.785398164;
	    if (x > 83) 
	    {
			ans1 = 1;
			ans2 = -.0156249;
	    } 
	    else 
	    {
			ans1=1.0+y*(-0.1098628627e-2+y*(0.2734510407e-4
					    +y*(-0.2073370639e-5+y*0.2093887211e-6)));
			ans2 = -0.1562499995e-1+y*(0.1430488765e-3
				+y*(-0.6911147651e-5+y*(0.7621095161e-6
						      -y*0.934935152e-7)));
	    }
	    var sax = Math.sqrt(0.636619772/ax);
	    var cosxx = Math.cos(xx);
	    var sinxx = Math.sin(xx);
	    ans2 *= z;
	    bessj0 = sax * (cosxx*ans1-sinxx*ans2);
	    // bessy0 = sax * (sinxx*ans1+cosxx*ans2);
	}
	return bessj0;
}

function j1(x)
{
	var integral = 0;
	for(var i = 0; i < 180; i +=10)
	{
		var theta = Math.PI*i/180.0;
		integral += Math.cos(theta)*Math.sin(x*Math.cos(theta));
	}
	return integral/18;
}

function getdata()
{
	var ret = new Array();
	for(i = 1; i < 1800; i ++)
	{
		var arr = [];
		//var ii = i/100;
		var theta = Math.PI*i/1800.0;
		//var ii =  25*i*Math.PI*Math.sin(theta)/1800;
		var ii =  25*i*Math.PI/1800;
		//computeBessel(ii);
		
		arr.push(i/10);
		arr.push(roundPistonPattern(ii));
		
		//arr.push(i?Math.abs(bessj0):1);
		//arr.push(Math.abs(Math.sin(ii)/(ii + 0.001)));
		ret.push(arr);
	}
	return ret;
}

function roundPistonPattern(ang)
{
	if(ang==0) return 1;
	return (2*j1(ang)/ang);
}
	