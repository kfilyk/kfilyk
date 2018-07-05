window.requestAnimationFrame = window.requestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function(f){return setTimeout(f, 50/3)} // simulate calling code 60

window.cancelAnimationFrame = window.cancelAnimationFrame
    || window.mozCancelAnimationFrame
    || function(requestID){clearTimeout(requestID)} //fall back

var canvas2=document.getElementById('map');
var ctx2 = canvas2.getContext("2d");
var canvas3=document.getElementById('dashboard');
var ctx3 = canvas3.getContext("2d");
var canvas4=document.getElementById('dashboard2');
var ctx4 = canvas4.getContext("2d");

canvas2.width=window.innerWidth;
canvas2.height=1000; // set number of pixels
canvas3.width=600; //console
canvas3.height=1000;
canvas4.width=600;
canvas4.height=1000;

ctx2.font = "10px Arial";
ctx3.font = "10px Arial";
ctx4.font = "10px Arial";
var mouseX = 0;
var mouseY = 0;
var mOX=0;
var mOY=0;
var lastX;
var lastY;
var canvasScale=1;
var tempOffsetX=0;
var tempOffsetY=0;
var cDrag=false;
var dot_flag = false;
var mouseOverMap = false;
var mouseOverConsole = false;
var leftPressed = false;
var rightPressed = false;
var pause=false;
var recording=false;
var highlighted=null;
var display=0;
var regenTiles=1;
var consumption=2;
var scoreType=0;
var newest=null;
var TWOPI=6.283185;
var DEGTORAD = 0.017453;
var FIELDX=1000;
var FIELDY=1000;
var DASHX=600;
var DASHY=1000;
var TILENUMBER=(FIELDX/25)*(FIELDY/25);
var POPCAP=1500;
var SCORESCAP=25;
var CYCLEPOP=SCORESCAP;
var HIGHESTINDEX=-1;
var LIVEPOP=0;
var SIZECAP=30;
var MUTCAP=10;
var ALPH="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var BSIZE=120;
var MAXBINS=29;
var MAXBOUTS=22;
var tiles=new Array(TILENUMBER);
var animals=new Array(POPCAP);
var graveyard=[];
var scores=new Array(SCORESCAP);
var request=0;
/* STATS */
var netParents=0; // Adds to total (if parent) at time of death
var netLifespan=0; //Total number of years all animals have lived (recorded upon death)
var globalNetNRG=0;
var time=0;
var redAgar=0;
var blueAgar=0;
var greenAgar=0;
var aveFER=0;

var aveChildren=0; //Ratio of number of children per parent
var aveLifespan=0;
var aveAge=0;
var avePosNRG=0;

var maxAveChildren=1;
var maxAveLifespan=1;
var maxAvePosNRG=1;
var maxAveAge=1;
var maxPPG=1;
var maxBPG=1;
var maxPop=1;

var maxRedAgar=0;
var maxBlueAgar=0;
var maxGreenAgar=0;
var minRedAgar=0;
var minBlueAgar=0;
var minGreenAgar=0;

var aveAgeHist=[];
var aveFERHist=[];
var aveChildrenHist=[];
var aveLifespanHist=[];
var avePosNRGHist=[];
var redAgarHist=[];
var greenAgarHist=[];
var blueAgarHist=[];
var popHist=[];
var PPG=[];
var FPG=[]; //FER: Food Energy Ratio
var liveFPG;
var BPG=[];

var statLogs=[];

var graphs=new Array(5);
graphs[0]=0;
graphs[1]=1;
graphs[2]=2;
graphs[3]=4;
graphs[4]=7;

var accelerate=0;

var text;
/*
var rInc = new Array(1000);
for(var i=0;i<1000;i++){
  rInc[i]=(Math.random()*2-1)/100;
}
var rIdx=0;
*/

function init() {
	canvas4.addEventListener("mouseover", function (e) {
		findxy('over', e, canvas4, 1)
	}, false);
	canvas4.addEventListener("mousemove", function (e) {
		findxy('move', e, canvas4, 1)
	}, false);
	canvas4.addEventListener("mousedown", function (e) {
		findxy('down', e, canvas4, 1)
	}, false);
	canvas4.addEventListener("mouseup", function (e) {
		findxy('up', e, canvas4, 1)
	}, false);
	canvas4.addEventListener("mouseout", function (e) {
		findxy('out', e, canvas4, 1)
	}, false);

	canvas2.addEventListener("mouseover", function (e) {
		findxy('over', e, canvas2, 0)
	}, false);
	canvas2.addEventListener("mousemove", function (e) {
		findxy('move', e, canvas2, 0)
	}, false);
	canvas2.addEventListener("mousedown", function (e) {
		findxy('down', e, canvas2, 0)
	}, false);
	canvas2.addEventListener("mouseup", function (e) {
		findxy('up', e, canvas2, 0)
	}, false);
	canvas2.addEventListener("mouseout", function (e) {
		findxy('out', e, canvas2, 0)
	}, false);
  canvas2.addEventListener("mousewheel", function (e) {
    e.preventDefault();
    var scaleDelta=e.wheelDelta;
    if(scaleDelta>20){
      scaleDelta=20;
    } else if(scaleDelta<-20){
      scaleDelta=-20;
    }
    var tSca = 1+scaleDelta/1000;
    // temp position: say at 500,500: translate then zoom-> displace 500,500 to top left, zoomed in by x/y pixels, displace back by less than original amount.
    if(canvasScale>0.5 && canvasScale<3){
      mOX+=(mouseX-mouseX*tSca)*canvasScale;
      mOY+=(mouseY-mouseY*tSca)*canvasScale;
      ctx2.translate(mouseX,mouseY);
      ctx2.scale(tSca,tSca);
      ctx2.translate(-mouseX,-mouseY);
      var rect = canvas2.getBoundingClientRect();
      mouseX=(e.clientX - rect.left) / (rect.right - rect.left) * canvas2.width;
      mouseY=(e.clientY - rect.top) / (rect.bottom - rect.top) * canvas2.height;
      mouseX-=mOX;
      mouseY-=mOY;
      canvasScale*=tSca;
      //console.log("SCALE: "+canvasScale);
      mouseX/=canvasScale;
      mouseY/=canvasScale;
    } else if(canvasScale<=0.5 && scaleDelta>=0){
      mOX+=(mouseX-mouseX*tSca)*canvasScale;
      mOY+=(mouseY-mouseY*tSca)*canvasScale;
      ctx2.translate(mouseX,mouseY);
      ctx2.scale(tSca,tSca);
      ctx2.translate(-mouseX,-mouseY);
      var rect = canvas2.getBoundingClientRect();
      mouseX=(e.clientX - rect.left) / (rect.right - rect.left) * canvas2.width;
      mouseY=(e.clientY - rect.top) / (rect.bottom - rect.top) * canvas2.height;
      mouseX-=mOX;
      mouseY-=mOY;
      canvasScale*=tSca;
      //console.log("SCALE: "+canvasScale);
      mouseX/=canvasScale;
      mouseY/=canvasScale;
    } else if(canvasScale>=3 && scaleDelta<=0){
      mOX+=(mouseX-mouseX*tSca)*canvasScale;
      mOY+=(mouseY-mouseY*tSca)*canvasScale;
      ctx2.translate(mouseX,mouseY);
      ctx2.scale(tSca,tSca);
      ctx2.translate(-mouseX,-mouseY);

      var rect = canvas2.getBoundingClientRect();
      mouseX=(e.clientX - rect.left) / (rect.right - rect.left) * canvas2.width;
      mouseY=(e.clientY - rect.top) / (rect.bottom - rect.top) * canvas2.height;
      mouseX-=mOX;
      mouseY-=mOY;

      canvasScale*=tSca;
      //console.log("SCALE: "+canvasScale);
      mouseX/=canvasScale;
      mouseY/=canvasScale;
    }
    //console.log("M X/Y: "+round(mouseX)+", "+round(mouseY));
    //console.log("MO X/Y: "+round(mOX)+", "+round(mOY));

  });
  document.addEventListener("keydown", function (e) {
    e.preventDefault();
    console.log("Pressed");
    console.log(e.keyCode);
    if(pause==true) {
      pause=false;
    } else {
      pause=true;
    }
  });

	tileManager.generate();
	dashboard.setup();
  cycle();
	//requestAnimationFrame(cycle);
}

function cycle() {
	tileManager.update();
	animalManager.update();
  input.update();
  if(!pause && time%100==0){ // COLLECT EVERY 100 FRAMES
    statManager.update();
  }
  dashboard.update();
  update();
  if(!pause){
    time++;
  }
	//request=requestAnimationFrame(cycle);
}

var update=function() {
  requestAnimationFrame(cycle);
}
var tileManager = {
	generate : function() {
    redAgar=0;
    blueAgar=0;
    greenAgar=0;
    maxRedAgar=0;
    maxBlueAgar=0;
    maxGreenAgar=0;
    minRedAgar=0;
    minBlueAgar=0;
    minGreenAgar=0;
    redAgarHist=[];
    blueAgarHist=[];
    greenAgarHist=[];

		var pos=0;
		for(var i=0;i<FIELDY;i+=25) {
			for(var j=0;j<FIELDX;j+=25) {
				tiles[pos]=new Tile(j,i,pos);
				pos++;
			}
		}
	},
	update : function() {
    ctx2.clearRect(-50,-50,1100,50); //top
    ctx2.clearRect(-50,FIELDY,1100,50);//bottom
    ctx2.clearRect(-50,0,50,1000); //left
    ctx2.clearRect(FIELDX,0,50,1000); //right

    redAgar=0;
    blueAgar=0;
    greenAgar=0;
		for(var i=0; i<TILENUMBER; i++) {
			tiles[i].draw();
			if(!pause && regenTiles==1) {
				tiles[i].regenerate();
			}
		}
	}
}
var animalManager = {
	update : function() {
		for(var a,i=0; i<=HIGHESTINDEX; i++) {
      a = animals[i];
      if(a.alive==true) {
        a.draw(a.cols);
        if(pause==false) {
          // Order important?
          a.think(a.brain);
          a.move();
          a.interact();
          a.grow();
          a.decay();
          a.scores();
        }

        if(leftPressed && mouseOverMap) {
          if(abs(a.x-mouseX)<a.size && abs(a.y-mouseY)<a.size) {
            if(highlighted!=null) {
              if(display==2) {
                display=1;
              }
            }
            if(highlighted!= i) {
              highlighted=i;
              leftPressed=false;
            }
          }
        }
      }
		}
	}
}
var statManager = {
  update : function() {
    aveAge=aveAge/100;
    aveFER=aveFER/100;
    aveChildren=aveChildren/100;
    if(graveyard.length>0){
      aveLifespan=netLifespan/graveyard.length;
      avePosNRG=globalNetNRG/graveyard.length;
    }else {
      aveLifespan=0;
      avePosNRG=0;
    }
    aveFERHist.push(aveFER); //add up all the ratios and divide by the number of living creatures
    if(recording && time==10000){
      var l=new statLog(time, accelerate, redAgar, greenAgar, blueAgar, aveFER);
      statLogs.push(l);
    }
    liveFPG=null;
    liveFPG=new Array(PPG.length);
    for(var i=0;i<PPG.length; i++){
      liveFPG[i]=FPG[i];
    }
    for(var a, i=0; i<=HIGHESTINDEX; i++){
      a = animals[i];
      if(a.alive==true){
        liveFPG[a.gen]+=(a.posFood/a.netFood);
      }
    }

    aveChildrenHist.push(aveChildren);
    if(aveChildren>maxAveChildren){
      maxAveChildren=aveChildren;
    }
    aveChildren=0;

    aveLifespanHist.push(aveLifespan);
    avePosNRGHist.push(avePosNRG);

    redAgarHist.push(redAgar);
    blueAgarHist.push(blueAgar);
    greenAgarHist.push(greenAgar);

    aveAgeHist.push(aveAge);
    popHist.push(LIVEPOP);
    if(LIVEPOP>maxPop){
      maxPop=LIVEPOP;
    }
    if(aveAge>maxAveAge){
      maxAveAge=aveAge;
    }
    aveFER=0;
    aveAge=0;
    if(aveLifespan>maxAveLifespan){
      maxAveLifespan=aveLifespan;
    }
    if(avePosNRG>maxAvePosNRG){
      maxAvePosNRG=avePosNRG;
    }

    if(redAgar>maxRedAgar){
      maxRedAgar=redAgar;
    }
    if(greenAgar>maxGreenAgar){
      maxGreenAgar=greenAgar;
    }
    if(blueAgar>maxBlueAgar){
      maxBlueAgar=blueAgar;
    }
    if(redAgar<minRedAgar){
      minRedAgar=redAgar;
    }
    if(greenAgar<minGreenAgar){
      minGreenAgar=greenAgar;
    }
    if(blueAgar<minBlueAgar){
      minBlueAgar=blueAgar;
    }
  }
}

var dashboard = {
	setup : function() {
		ctx3.fillStyle=rgbToHex(50,50,50);
		ctx3.fillRect(0,0,DASHX,DASHY);
		ctx3.fillStyle="#FFFFFF";
		ctx3.strokeStyle="#FFFFFF";
		var posy=15;
		ctx3.fillText("PETRI 2.18 - kelvinfilyk@gmail.com", 10, posy);
		ctx3.fillText("LIVE: ", 10, posy+=10);
		ctx3.fillText("DEAD: ", 10, posy+=10);
		ctx3.fillText("HIND: ", 10, posy+=10);
		ctx3.fillText("NEW: ", 10, posy+=10);
    ctx3.fillText("TIME: ", 10, posy+=10);
		var posx2=440;
		posy=10;

    //menu
		ctx3.fillRect(posx2,posy,150,12);
		ctx3.fillRect(posx2,posy+=20,150,12);
		ctx3.fillRect(posx2,posy+=20,150,12);
		ctx3.fillRect(posx2,posy+=20,150,12);
		ctx3.fillRect(posx2,posy+=20,150,12);
		ctx3.fillRect(posx2,posy+=20,150,12);
    ctx3.fillRect(posx2,posy+=20,150,12);
    ctx3.fillRect(posx2,posy+=20,150,12);

		ctx3.fillStyle= "#323232";
		posy=20;
		ctx3.fillText("CLEAR",posx2+5,posy);
		ctx3.fillText("GENERATE",posx2+5,posy+=20);
		ctx3.fillText("MUT HIGHSCORES",posx2+5,posy+=20);

		if(scoreType==0) {
			ctx3.fillText("SCORE CHILDREN",posx2+5,posy+=20);
		} else if(scoreType==1) {
			ctx3.fillText("SCORE AGE",posx2+5,posy+=20);
		} else {
      ctx3.fillText("SCORE ENERGY",posx2+5,posy+=20);
    }

    ctx3.fillText("CONSUMPTION x"+consumption,posx2+5,posy+=20);

    if(regenTiles==1) {
			ctx3.fillText("REGEN TILES ON",posx2+5,posy+=20);
		} else {
			ctx3.fillText("REGEN TILES OFF",posx2+5,posy+=20);
		}

    if(accelerate==0) {
      ctx3.fillText("ACCELERATE OFF",posx2+5,posy+=20);
    } else {
      ctx3.fillText("ACCELERATE "+accelerate,posx2+5,posy+=20);
    }
    ctx3.fillText("LOAD",posx2+5,posy+=20);

    posx2=280;
    posy=20;
	},
	update : function() {
    ctx4.clearRect(0, 0, DASHX, DASHY);
		if(display!=1 && display!=2) {

			var posx=50;
			var posy=15;
      ctx4.beginPath();
			ctx4.fillStyle="#FFFFFF";
      if(recording==false){
        ctx4.arc(380,16,6,0,TWOPI);
        ctx4.fill();
      } else {
        ctx4.fillStyle="#FF0000";
        ctx4.arc(380,16,6,0,TWOPI);
        ctx4.fill();
      }
      ctx4.fillStyle="#FFFFFF";
      // play/pause
      if(pause==false){
        ctx4.fillRect(400,10,3,12);
        ctx4.fillRect(406,10,3,12);
      } else {
        ctx4.beginPath();
        ctx4.moveTo(400,10);
        ctx4.lineTo(400,22);
        ctx4.lineTo(410,16);
        ctx4.lineTo(400,10);
        ctx4.fill();
        ctx4.stroke();
      }

			ctx4.fillText(LIVEPOP, posx, posy+=10);
			ctx4.fillText(graveyard.length, posx, posy+=10);
      if(mouseOverConsole && leftPressed) {
        if(mouseX>10 && mouseX<120) {
          if(mouseY>posy-5 && mouseY<posy+5) {
            if(graveyard.length!=0){ // If graveyard length = 1, then index ==0: send to highlighted as -(length)+1. 0-> -1, 1 -> -2, 2->-3
              highlighted=(-graveyard.length); // goes to index at graveyard.length, shows most recently deceased
            }
            leftPressed=false;
          }
        }
      }
			ctx4.fillText(HIGHESTINDEX, posx, posy+=10);
			if(mouseOverConsole && leftPressed) {
				if(mouseX>10 && mouseX<120) {
					if(mouseY>posy-5 && mouseY<posy+5) {
						highlighted=HIGHESTINDEX;
						leftPressed=false;
					}
				}
			}
			if(newest!=null) {
				if(newest<0) {
					ctx4.fillText(graveyard[-(newest+1)].name+"-"+graveyard[-(newest+1)].gen+"D"+graveyard[-(newest+1)].children.length, posx, posy+=10);
				} else {
					ctx4.fillText(animals[newest].name+"-"+animals[newest].gen+"A"+animals[newest].children.length, posx, posy+=10);
				}
				if(mouseOverConsole && leftPressed) {
					if(mouseX>10 && mouseX<120) {
						if(mouseY>posy-5 && mouseY<posy+5) {
							highlighted=newest;
							leftPressed=false;
						}
					}
				}
			} else {
				posy+=10;
			}
      ctx4.fillText(time, posx, posy+=10);
			posx=10;
			posy=75;
			ctx4.fillStyle="#FFFFFF";
			ctx4.fillText("HIGHSCORES:",posx,posy);
			for(var i=0;i<SCORESCAP;i++) {
				if(scores[i]!=null) {
          if(scoreType==0){
            if(scores[i]<0){
              var a1=graveyard[-(scores[i]+1)];
              ctx4.fillText(a1.name+"-"+a1.gen+"D"+a1.children.length, posx, posy+=10);
            } else {
              var a1=animals[scores[i]];
              ctx4.fillText(a1.name+"-"+a1.gen+"A"+a1.children.length, posx, posy+=10);
            }
  					if(mouseOverConsole && leftPressed) {
  						if(mouseX>posx && mouseX<posx+90 && mouseY>posy-5 && mouseY<posy+5) {
  							if(display==2) {
  								display=1;
  							}
  							highlighted=scores[i]; // index stored in "scores" array
  						}
  					}
          } else {
            if(scores[i]<0){
              var a1=graveyard[-(scores[i]+1)];
              ctx4.fillText(a1.name+"-"+a1.gen+"D"+a1.children.length+": "+round(a1.score), posx, posy+=10);
            } else {
              var a1=animals[scores[i]];
              ctx4.fillText(a1.name+"-"+a1.gen+"A"+a1.children.length+": "+round(a1.score), posx, posy+=10);
            }
            if(mouseOverConsole && leftPressed) {
              if(mouseX>posx && mouseX<posx+90 && mouseY>posy-5 && mouseY<posy+5) {
                if(display==2) {
                  display=1;
                }
                highlighted=scores[i]; // index stored in "scores" array
              }
            }
          }
				} else {
					break;
				}
			}

      var buttonX=450;
      ctx4.fillStyle="#FFFFFF";
      for(var i=0;i<5; i++){
        ctx4.beginPath();
        ctx4.arc(buttonX,175,7,0,TWOPI);
        ctx4.fill();
        if(leftPressed){
          if(mouseOverConsole && abs(mouseX-buttonX)<6 && abs(mouseY-175)<6) {
            if(graphs[i]<8){
              graphs[i]++;
            } else {
              graphs[i]=-1;
            }
            leftPressed=false;
          }
        } else if(rightPressed){
          if(mouseOverConsole && abs(mouseX-buttonX)<6 && abs(mouseY-175)<6) {
            if(graphs[i]>-1){
              graphs[i]--;
            } else {
              graphs[i]=8;
            }
            rightPressed=false;
          }
        }
        buttonX+=32;
      }
      buttonX=450;
      ctx4.fillStyle="#323232";
      for(var i=0;i<5; i++){
        ctx4.fillText(graphs[i], buttonX-3, 178);
        buttonX+=32;
      }

      var lineX= DASHX/(~~(time/100));
      posy=600;
      ctx4.fillStyle="#FFFFFF";
      ctx4.strokeStyle="#FFFFFF";
      for(var i=0;i<5; i++){
        if(graphs[i]==0){
          graph(lineX, posy, aveFERHist, "FER: ", 1);
        } else if(graphs[i]==1){
          graph(lineX, posy, aveChildrenHist, "CHI: ", maxAveChildren);
        } else if(graphs[i]==2){
          graph(lineX, posy, aveLifespanHist, "LFSPN: ", maxAveLifespan);
        } else if(graphs[i]==3){
          graph(lineX, posy, avePosNRGHist, "POSNRG: ", maxAvePosNRG);
        } else if(graphs[i]==4){
          graph(lineX, posy, popHist, "POP: ", maxPop);

        } else if(graphs[i]==5){
          if(PPG.length>0){
            var iW=0;
            if(PPG.length>1){
              iW = DASHX/(PPG.length-1);
            }
            genGraph(iW, posy, liveFPG, "FPG: ", 1); // FER Per Gen
          }
        } else if(graphs[i]==6){
          if(PPG.length>0){
            var iW=0;
            if(PPG.length>1){
              iW = DASHX/(PPG.length-1);
            }
            genGraph(iW, posy, BPG, "BPG: ", maxBPG);
          }
        } else if(graphs[i]==7){
          if(PPG.length>0){
            var iW=0;
            if(PPG.length>1){
              iW = DASHX/(PPG.length-1);
            }
            popGenGraph(iW, posy, PPG, "PPG: ", maxPPG);
          }
        } else if(graphs[i]==8){
          var tR=-1;
          var tG=-1;
          var tB=-1;
          var showReso=0;
          var l =redAgarHist.length-1;
          var total =round(redAgarHist[l]+greenAgarHist[l]+blueAgarHist[l]);
          ctx4.strokeStyle="#FF0000";
          tR=resoGraph(lineX, posy, 80, redAgarHist, "R: ", minRedAgar, maxRedAgar);
          ctx4.strokeStyle="#00FF00";
          tG=resoGraph(lineX, posy, 70, greenAgarHist, "G: ", minGreenAgar, maxGreenAgar);
          ctx4.strokeStyle="#0000FF";
          tB=resoGraph(lineX, posy, 60, blueAgarHist, "B: ", minBlueAgar, maxBlueAgar);
          if(tR>-1){
            ctx4.fillText("TIME: "+tR, 10, posy-50);
            tR=round(tR/100);
            total =round(redAgarHist[tR]+greenAgarHist[tR]+blueAgarHist[tR]);
          } else if(tG>-1){
            ctx4.fillText("TIME: "+tG, 10, posy-50);
            tG=round(tG/100);
            total =round(redAgarHist[tR]+greenAgarHist[tR]+blueAgarHist[tR]);
          } else if(tB>-1){
            ctx4.fillText("TIME: "+tB, 10, posy-50);
            tB=round(tB/100);
            total =round(redAgarHist[tR]+greenAgarHist[tR]+blueAgarHist[tR]);
          }
          ctx4.strokeStyle="#FFFFFF";
          ctx4.fillText(total, 10, posy-90);

        }
        posy+=100;
      }
    }

		if(highlighted!=null) {
			if(highlighted<0) {
				graveyard[-(highlighted+1)].highlight();
			} else {
				animals[highlighted].highlight();
			}
		}
	}
}
function graph(lx, y, g, txt, max) {
  var initY;
  var endY;
  var show=0;
  var posx=0;
  ctx4.beginPath();
  for(var i=0; i<g.length-1; i++){ // Will begin once array has length of at least 2. Initial length==1. Wait until length 2
    initY = 100*g[i]/max;
    endY= 100*g[i+1]/max;
    ctx4.moveTo(posx,y-initY);
    ctx4.lineTo(posx+lx, y-endY);

    if(mouseOverConsole && abs(mouseX-posx)<10 && abs(mouseY-(y-initY))<10){
      if(show==0) {
        ctx4.fillText(txt+(round(100*g[i])/100), 10, y-90);
        ctx4.fillText("TIME: "+(i*100), 10, y-80);
        show=1;
      }
    }
    posx+=lx;
    initY=endY;
  }
  if(show==0){
    ctx4.fillText(txt+round(100*g[g.length-1])/100, 10, y-90);
  }
  ctx4.stroke();
}

function resoGraph(lx, y, s, g, txt, min, max) {
  var initY;
  var endY;
  var show=0;
  var showTime=-1;
  var posx=0;
  var range=(max-min);
  ctx4.beginPath();
  for(var i=0; i<g.length-1; i++){ // Will begin once array has length of at least 2. Initial length==1. Wait until length 2
    initY=round(100*((g[i]-min)/range));
    endY=round(100*((g[i+1]-min)/range));
    ctx4.moveTo(posx,y-initY);
    ctx4.lineTo(posx+lx,y-endY);

    if(mouseOverConsole && abs(mouseX-posx)<10 && abs(mouseY-(y-initY))<10){
      if(show==0) {
        ctx4.fillText(txt+round(g[i]), 10, y-s);
        showTime=i*100;
        show=1;
      }
    }
    posx+=lx;
    initY=endY;
  }
  if(show==0){
    ctx4.fillText(txt+round(g[g.length-1]), 10, y-s);
  }
  ctx4.stroke();
  return showTime;
}
function genGraph(lx, y, g, txt, max) {
  var initY;
  var endY;
  var show=0;
  var posx=0;
  ctx4.beginPath();
  for(var i=0; i<g.length-1; i++){
    initY= round(100*(g[i]/PPG[i])/max);
    endY=round(100*(g[i+1]/PPG[i+1])/max);
    ctx4.moveTo(posx,y-initY);
    ctx4.lineTo(posx+lx,y-endY);
    if(mouseOverConsole && abs(mouseX-posx)<10 && abs(mouseY-(y-initY))<10){
      if(show==0) {
        ctx4.fillText(txt+round(100*(g[i]/PPG[i]))/100, 10, y-90);
        ctx4.fillText("GEN "+i, 10, y-80);
        show=1;
      }
    }
    posx+=lx;
  }
  if(show==0){
    ctx4.fillText(txt+round(100*g[g.length-1]/PPG[g.length-1])/100, 10, y-90);
    ctx4.fillText("GEN "+(g.length-1), 10, y-80);
  }
  ctx4.stroke();
}
function popGenGraph(lx, y, g, txt, max) {
  var initY;
  var endY;
  var show=0;
  var posx=0;
  ctx4.beginPath();
  for(var i=0; i<g.length-1; i++){ // Will begin once array has length of at least 2. Initial length==1. Wait until length 2
    initY= round(100*g[i]/max);
    endY=round(100*g[i+1]/max);
    ctx4.moveTo(posx,y-initY);
    ctx4.strokeRect((posx-1), (y-initY-1),2,2);
    ctx4.lineTo(posx+lx,y-endY);
    if(mouseOverConsole && abs(mouseX-posx)<10 && abs(mouseY-(y-initY))<10){
      if(show==0) {
        ctx4.fillText(txt+round(100*g[i])/100, 10, y-90);
        ctx4.fillText("GEN "+i, 10, y-80);
        show=1;
      }
    }
    posx+=lx;
  }
  if(show==0){
    ctx4.fillText(txt+round(100*g[g.length-1])/100, 10, y-90);
    ctx4.fillText("GEN "+(g.length-1), 10, y-80);
  }
  ctx4.stroke();
}
function resetStats(){
  time=0;
  netLifespan=0;
  globalNetNRG=0;
  aveFER=0;

  aveChildren=0;
  aveLifespan=0;
  avePosNRG=0;

  maxAveChildren=1;
  maxAveLifespan=1;
  maxAvePosNRG=1;

  LIVEPOP=0;
  HIGHESTINDEX=0;
  for(var a, i=0; i<animals.length;i++){
    a=animals[i];
    if(a!=null && a.alive==true){
      LIVEPOP++;
      HIGHESTINDEX=i;
    }
  }

  aveChildrenHist=[];
  aveLifespanHist=[];
  avePosNRGHist=[];
  aveFERHist=[];
  PPG=[];
  FPG=[];
  BPG=[];
  maxPPG=0;
  maxBPG=0;
  for(var a, i=0; i<=HIGHESTINDEX;i++){
    a=animals[i];
    while(a.gen>=PPG.length){
      PPG.push(0);
      FPG.push(0);
      BPG.push(0);
    }
    if(a.alive==true) {
      PPG[a.gen]++;
      if(PPG[a.gen]>maxPPG){
        maxPPG=PPG[a.gen];
      }
      BPG[a.gen]+=a.brainCost;
      if(BPG[a.gen]/PPG[a.gen]>maxBPG){
        maxBPG=BPG[a.gen]/PPG[a.gen];
      }
    }
  }

  popHist=[];
  redAgar=0;
  blueAgar=0;
  greenAgar=0;
  maxRedAgar=0;
  maxBlueAgar=0;
  maxGreenAgar=0;
  minRedAgar=0;
  minBlueAgar=0;
  minGreenAgar=0;
  redAgarHist=[];
  blueAgarHist=[];
  greenAgarHist=[];
}

function statLog(t, a, rA, gA, bA, fer) {
  this.time=t;
  this.acc=a;
  this.rAgar=rA;
  this.gAgar=gA;
  this.bAgar=bA;
  this.fer=fer;
}

var input= {
	update: function() {
		if(mouseOverMap) { // mouse over map
			//gen 1 random
			if(rightPressed) {
				if(LIVEPOP<POPCAP) {
					var i=0;
					while(animals[i]!=null) {
						if(animals[i].top<SCORESCAP || animals[i].alive==true) {
							i++;
						} else {
							break;
						}
					}
					animals[i]=null;
					animals[i]=new Animal(round(mouseX),round(mouseY),i);
					LIVEPOP++;
					if(i>HIGHESTINDEX) {
						HIGHESTINDEX=i;
					}
				}
				rightPressed=false;
			} else if(leftPressed){
        ctx2.clearRect(-500,-500,2000,500); //top
        ctx2.clearRect(-500,FIELDY,2000,500);//bottom
        ctx2.clearRect(-500,0,500,1000); //left
        ctx2.clearRect(FIELDX,0,500,1000); //right
        if(!cDrag) {
          cDrag = true;
          lastX = mouseX; // init mx, my
          lastY = mouseY;
        } else {
          ctx2.translate(mouseX-lastX, mouseY-lastY);
          tempOffsetX+=(mouseX-lastX)*canvasScale;
          tempOffsetY+=(mouseY-lastY)*canvasScale;
          lastX = mouseX;
          lastY = mouseY;
        }
      } else if(cDrag){
        cDrag = false;
        mOX+=tempOffsetX;
        mOY+=tempOffsetY;
        tempOffsetX=0;
        tempOffsetY=0;
      }
		} else if(mouseOverConsole) { //dashboard mouse
			if(leftPressed) {

        //RECORD
				if(mouseX>374 && mouseX<386 && mouseY>10 && mouseY<22) {
          if(recording==false) {
						recording=true;
					} else {
            recording=false;
          }
          leftPressed=false;
				}
        //PAUSE
				if(mouseX>400 && mouseX<410 && mouseY>10 && mouseY<20) {
					if(pause==false) {
						pause=true;
					} else {
            pause=false;
          }
          leftPressed=false;
				}

        // dashboard MENU
        if((mouseX>440)&&(mouseX<590) && display!=1 && display!=2) {
					if((mouseY>10)&&(mouseY<20)) { // CLEAR
						highlighted=null;
						newest=null;
						scores=null;
						animals=null;
            graveyard=null;
						scores=new Array(SCORESCAP);
						animals=new Array(POPCAP);
            graveyard=[];

            resetStats();

						dashboard.setup();
						tileManager.generate();
						LIVEPOP=0;
						HIGHESTINDEX=-1;
						leftPressed=false;
					} else if((mouseY>30)&&(mouseY<40)) {  // GENERATE
						newSimulation();
					}else if((mouseY>50)&&(mouseY<60)) { // MUT 100 HIGHSCORES
						if(HIGHESTINDEX>=SCORESCAP) {
							genHS();
              resetStats();
						}
            leftPressed=false;
					}else if((mouseY>70)&&(mouseY<80)) { // SCORES TYPE
						if(scoreType==0){ // scoreType 0/1/2: Childs/Age/Energy
              scoreType=1;
            } else if(scoreType==1){
              scoreType=2;
            } else {
              scoreType=0;
            }
            resetScore();
            leftPressed=false;
					}else if((mouseY>90)&&(mouseY<100)) { // FOOD AVAILABLE
						consumption+=0.5;
						if(consumption>4) {
							consumption=0.5;
						}
						dashboard.setup();
						leftPressed=false;
					} else if((mouseY>110)&&(mouseY<120)) { // REGEN TILES
						if(regenTiles==0) {
							regenTiles=1;
						} else {
							regenTiles=0;
						}
						dashboard.setup();
						leftPressed=false;
					} else if((mouseY>130)&&(mouseY<140)) { // ACCELERATE MODE
            if(accelerate==12) {
              accelerate=0;
            } else {
              accelerate++;
            }
						dashboard.setup();
						leftPressed=false;
          }
        }

        if((mouseX>440)&&(mouseX<590) && display!=1 && display!=2) {
          if((mouseY>150)&&(mouseY<160)) { // LOAD
            highlighted=null;
            newest=null;
            scores=null;
            animals=null;
            scores=new Array(SCORESCAP);
            animals=new Array(POPCAP);
            loadPetri();
            resetStats();
            tileManager.update();
            dashboard.setup();
            leftPressed=false;
          }
				}
			}
		}
	}
}

function newSimulation() {
  //pause=true;
  highlighted=null;
  newest=null;
  scores=null;
  animals=null;
  scores=new Array(SCORESCAP);
  animals=new Array(POPCAP);
  for(var i=0;i<100;i++) {
    animals[i]=new Animal(round(Math.random()*FIELDX),round(Math.random()*FIELDY), i);
  }
  resetStats();
  dashboard.setup();
  tileManager.generate();
  leftPressed=false;
  savePetri();
}

function savePetri() {
  var animalString = JSON.stringify(animals);
  var tileString = JSON.stringify(tiles);

  var f=null, createFile=function(text) {
    var data=new Blob([text], {type: 'application/javascript'});
    if(f!==null){
      window.URL.revokeObjectURL(f);
    }
    f = window.URL.createObjectURL(data);
    return f;
  };
  var link=document.getElementById('download');
  link.href=createFile("var savedAnimals= '"+animalString+"'; \n\n"+"var savedTiles= '"+tileString+"'; ");
  link.style.display='block';
}

function loadPetri() {
  var animalData = JSON.parse(savedAnimals);
  for(var i=0;i<animalData.length;i++){
  	if(animalData[i]!=null){
  		animals[i]=Object.assign(new Animal, animalData[i]);
      for(var j=0; j<animalData[i].brain.length;j++) {
          animals[i].brain[j]=Object.assign(new Neuron, animalData[i].brain[j]);
          var weights=new Float32Array(BSIZE);
          for(var k=0;k<BSIZE;k++){
            weights[k]=animalData[i].brain[j].weights[k];
          }
          animals[i].brain[j].weights=weights;
  		}
      animals[i].mouth=Object.assign(new Mouth, animalData[i].mouth);
      for(var j=0;j<5;j++){
        animals[i].eyes[j]=Object.assign(new Eye, animalData[i].eyes[j]);
      }
      var cols=new Uint8ClampedArray(15);
      for(var j=0;j<15;j++){
        cols[j]=animalData[i].cols[j];
      }
      animals[i].cols=cols;
  	}
  }

  var tileData = JSON.parse(savedTiles);
  for(var i=0;i<tileData.length;i++){
    tiles[i]=Object.assign(new Tile, tileData[i]);
  }
}

function resetScore() {
  for(var i=0;i<=HIGHESTINDEX;i++){
    if(animals[i].alive==true){
      if(scoreType==0){
        animals[i].score = animals[i].children.length;
      } else if(scoreType==1){
        animals[i].score = animals[i].age;
      } else {
        animals[i].score = animals[i].gain;
      }
    }
  }
  for(var l=0, dA=graveyard.length; l<dA; l++){
    var dead = graveyard[l];
    if(scoreType==0){
      dead.score = dead.children.length;
    } else if(scoreType==1){
      dead.score = dead.age;
    } else {
      dead.score = dead.gain;
    }
  }
  for(var l=0, dA=graveyard.length; l<dA; l++){
    var dead = graveyard[l];
    for(var i=0, sC=SCORESCAP;i<sC;i++) { //from #1 to bottom
			if(dead.top<=i) { // if position is higher than i (#1 already, no need to look at #25)
				break;
			} if(scores[i]==null){
				if(dead.top<sC) {
					scores[dead.top]=null;
				}
        scores[i]=dead.index; //If called from graveyard during resetScore, it should work... no bugs yet
				dead.top=i;
				break;
			}else {
        if(scores[i]<0){
          if(dead.score>graveyard[-(scores[i]+1)].score) {
            if(dead.top<sC) {
              scores[dead.top]=null;
            }
            var j;
            for(j=0;j<sC;j++) {
              if(scores[j]==null) {
                scores[j]=scores[i];
                graveyard[-(scores[j]+1)].top=j;
                break;
              }
            }
            if(j==sC) {
              graveyard[-(scores[i]+1)].top=sC;
            }
            scores[i]=dead.index;
            dead.top=i;
            break;
          }
        } else {
          if(dead.score>animals[scores[i]].score) {
    				if(dead.top<sC) {
    					scores[dead.top]=null;
    				}
    				var j;
    				for(j=0;j<sC;j++) {
    					if(scores[j]==null) {
    						scores[j]=scores[i];
    						animals[scores[j]].top=j;
    						break;
    					}
    				}
    				if(j==sC) {
    					animals[scores[i]].top=sC;
    				}
            scores[i]=dead.index;
    				dead.top=i;
    				break;
    			}
        }
      }
		}
  }
  dashboard.setup();
}

function genHS() {
	display=0;
	highlighted=null;
	newest=null;
	var a2 =new Array(POPCAP);
	var it=0;
	for(var j=0, sC=SCORESCAP; j<sC; j++) {
		if(scores[j]!=null){
      var a = new Animal(500,500,it);
      var an = new Animal(500,500,it+1);
      var ani = new Animal(500,500,it+2);
      var anim = new Animal(500,500,it+3);
      if(scores[j]>=0){
        animals[scores[j]].x=round(Math.random()*FIELDX);
        animals[scores[j]].y=round(Math.random()*FIELDY);
        a2[it]=a;
        animals[scores[j]].mutate(a2[it]);
        a2[it].pidx=null;
        a2[it+1]=an;
        animals[scores[j]].mutate(a2[it+1]);
        a2[it+1].pidx=null;
        a2[it+2]=ani;
        animals[scores[j]].mutate(a2[it+2]);
        a2[it+2].pidx=null;
        a2[it+3]=anim;
        animals[scores[j]].mutate(a2[it+3]);
        a2[it+3].pidx=null;
        it+=4;
      } else {
        animals[-(scores[j]+1)].x=round(Math.random()*FIELDX);
        animals[-(scores[j]+1)].y=round(Math.random()*FIELDY);
        a2[it]=a;
        animals[-(scores[j]+1)].mutate(a2[it]);
        a2[it].pidx=null;
        a2[it+1]=an;
        animals[-(scores[j]+1)].mutate(a2[it+1]);
        a2[it+1].pidx=null;
        a2[it+2]=ani;
        animals[-(scores[j]+1)].mutate(a2[it+2]);
        a2[it+2].pidx=null;
        a2[it+3]=anim;
        animals[-(scores[j]+1)].mutate(a2[it+3]);
        a2[it+3].pidx=null;
        it+=4;
      }
    }
	}
	animals=null;
	animals=new Array(POPCAP);
	animals=a2;
	a2=null;
	scores=null;
	scores=new Array(SCORESCAP);
  resetStats();
	dashboard.setup();
	tileManager.generate();
}

function namer() {
	var n="";
	for(var i=0;i<4;i++) {
		n+=ALPH.charAt(round(Math.random()*25));
	}
	return n;
}

function findxy(res, e, canv, m) {
	if (res == 'down') {
    var rect = canv.getBoundingClientRect();
    mouseX=(e.clientX - rect.left) / (rect.right - rect.left) * canv.width;
    mouseY=(e.clientY - rect.top) / (rect.bottom - rect.top) * canv.height;
    if(m==0){
      mouseX-=mOX;
      mouseY-=mOY;
      mouseX/=canvasScale;
      mouseY/=canvasScale;
    }
		if(e.button === 0){
			leftPressed = true;
		} else if(e.button === 2){
			rightPressed = true;
		}
		dot_flag = true;
	}
	if (res == 'up' || res == "out") {
		if(e.button === 0){
			leftPressed = false;
		} else if(e.button === 2){
			rightPressed = false;
		}
	}
	if (res == 'move') {
    var rect = canv.getBoundingClientRect();
    mouseX=(e.clientX - rect.left) / (rect.right - rect.left) * canv.width;
    mouseY=(e.clientY - rect.top) / (rect.bottom - rect.top) * canv.height;
    if(m==0){
      mouseX-=mOX;
      mouseY-=mOY;
      mouseX/=canvasScale;
      mouseY/=canvasScale;
    }
	}
	if (res == 'over') {
    var rect = canv.getBoundingClientRect();
    mouseX=(e.clientX - rect.left) / (rect.right - rect.left) * canv.width;
    mouseY=(e.clientY - rect.top) / (rect.bottom - rect.top) * canv.height;
    if(m==0){
      mouseX-=mOX;
      mouseY-=mOY;
      mouseX/=canvasScale;
      mouseY/=canvasScale;
    }
	}
  if(m==0){
    mouseOverMap=true;
    mouseOverConsole=false;
  } else {
    mouseOverMap=false;
    mouseOverConsole=true;
  }
}

function rgbToHex(r,g,b) {
  return "#" + ((1 << 24)+(r << 16)+(g << 8)+b).toString(16).slice(1);
}
function round(x) {
	return ~~(x + (x>0 ? .5:-.5));
}
function abs(x) {
	return (x>0 ? x:-x);
}

function Tile(x,y,num) {
	this.x=x;
	this.y=y;
	this.num=num;
	this.regenRate=(Math.random()*0.1)+0.05;
	this.RCap = round(Math.random()*100)+50;
	this.GCap = round(Math.random()*100)+100;
	this.BCap = round(Math.random()*75)+25;
	this.R=this.RCap;
	this.G=this.GCap;
	this.B=this.BCap;
  redAgar+=this.R;
  greenAgar+=this.G;
  blueAgar+=this.B;
}
Tile.prototype.draw=function() {
  ctx2.fillStyle=rgbToHex((this.R<50 ? 50:round(this.R)), (this.G<50 ? 50:round(this.G)), (this.B<50 ? 50:round(this.B)));
  ctx2.fillRect(this.x,this.y,25,25);
  if(mouseOverMap && mouseX>this.x-25 && mouseX<this.x+50 && mouseY>this.y-25 && mouseY<this.y+50) {
    if(!leftPressed) {
      ctx2.fillStyle=rgbToHex((this.R-30<0 ? 0:round(this.R)-30), (this.G-30<0 ? 0:round(this.G)-30), (this.B-30<0 ? 0:round(this.B)-30));
      ctx2.fillText(this.num,this.x,this.y+25);
    } else if(mouseX>this.x && mouseX<this.x+25 && mouseY>this.y && mouseY<this.y+25) {
      ctx2.fillStyle=rgbToHex((this.R-30<0 ? 0:round(this.R)-30), (this.G-30<0 ? 0:round(this.G)-30), (this.B-30<0 ? 0:round(this.B)-30));
      ctx2.fillText(round(this.R),this.x,this.y+8);
      ctx2.fillText(round(this.G),this.x,this.y+16);
      ctx2.fillText(round(this.B),this.x,this.y+25);
    }
  }
  redAgar+=this.R;
  greenAgar+=this.G;
  blueAgar+=this.B;
}
Tile.prototype.regenerate=function() {
  if(this.R<this.RCap) {
    this.R+=this.regenRate;
  }
  if(this.G<this.GCap) {
    this.G+=this.regenRate;
  }
  if(this.B<this.BCap) {
    this.B+=this.regenRate;
  }
}

function Neuron() {
  this.weights=new Float32Array(BSIZE); // if input is pos
  this.weights2=new Float32Array(BSIZE); // if input is neg
	this.bias=0;
	this.in=0;
  this.i1=0;
  this.i2=0;
  this.i3=0;
  this.o1=0;
  this.o2=0;
  this.o3=0;
  this.out=0;
	this.cost=0;
}
Neuron.prototype.setRandom=function(x, y) { // if this.in>=0 return this.in*weights[0]
  for(var i=x;i<y;i++) {
    var c=Math.random()-0.5;
    this.weights[i]=c;
    c=Math.random()-0.5;
    this.weights2[i]=c;
    this.cost+=abs(c);
	}
}
Neuron.prototype.synapse=function(idx) { // if this.in>=0 return this.in*weights[0]
  if(this.out>0){
    return this.out*this.weights[idx];
  }
  return this.out*this.weights2[idx];
}
Neuron.prototype.ceil=function() {
  this.out = this.in+this.bias;
  if(this.out>1){
    this.out=1;
  } else if(this.out<-1){
    this.out=-1;
  }
}

function Eye(x,y) {
	this.dis=0;
  this.stray=0;
	this.x=x;
	this.y=y;
	this.tile=null;
  this.r=0;
  this.g=0;
  this.b=0;
	this.sense=0;
	this.sees=0;
}

Eye.prototype.setXY=function(o,x,y) {
  this.x=x+this.dis*(Math.cos(DEGTORAD*(o+this.stray)));
  this.y=y+this.dis*(Math.sin(DEGTORAD*(o+this.stray)));
  if(this.x>=0 && this.y>=0 && this.x<FIELDX && this.y<FIELDY) {
    this.tile=((~~(this.y/25)*40)+(~~(this.x/25)));
    if(this.tile<0 || this.tile>=TILENUMBER) {
      this.tile=null;
      this.r=0;
      this.g=0;
      this.b=0;
    }
  } else {
    this.tile=null;
    this.r=0;
    this.g=0;
    this.b=0;
  }
}

function Mouth(x,y) {
  this.dis=0;
  this.stray=0;
	this.x=x;
	this.y=y;
	this.tile=null;
  this.r=0;
  this.g=0;
  this.b=0;
	this.sense=0;
	this.sees=0;
}

Mouth.prototype.setXY=function(o,x,y) {
  this.x=x+this.dis*(Math.cos(DEGTORAD*(o+this.stray)));
  this.y=y+this.dis*(Math.sin(DEGTORAD*(o+this.stray)));
  if(this.x>=0 && this.y>=0 && this.x<FIELDX && this.y<FIELDY) {
    this.tile=((~~(this.y/25)*40)+(~~(this.x/25)));
    if(this.tile<0 || this.tile>=TILENUMBER) {
      this.tile=null;
      this.r=0;
      this.g=0;
      this.b=0;
    }
  } else {
    this.tile=null;
    this.r=0;
    this.g=0;
    this.b=0;
  }
}

function Animal(x,y,index) {
	this.index=index;
	this.alive=true;
	this.x=x;
	this.y=y;
	this.tile=null;
	this.minSize=5;
	this.maxSize=10;
	this.size=this.minSize;
	this.midSize=(this.maxSize-this.minSize)/2;
	this.health=0;
	this.gen=0;
  this.age=0;
	this.parent=null;
	this.pidx=null;
  this.cno=null;
	this.children=[];
  this.liveDescendants=0;
  this.descendants=0;
  this.proGenes=0;
  this.conGenes=0;
	this.name=namer();

  this.vel=0;
  this.rot=0;
	this.dir=round(Math.random()*360); // facing direction
  this.velDir=(Math.random()*2)-1; // traveling direction

	this.eyes=new Array(5);
	for(var i=0;i<5;i++) {
		this.eyes[i] = new Eye(this.x, this.y);
	}
	this.mouth=new Mouth(this.x, this.y);
	this.food=0;

  this.red=0.0005;
  this.green=0.0005;
  this.blue=0.0005;
  this.netRed=0.001;
  this.netGreen=0.001;
  this.netBlue=0.001;

  this.posFood=0.0005;
  this.netFood=0.001;

	this.brain=new Array(BSIZE);
  this.bInputs=6;
  this.bHiddens=0;
  this.bOutputs=0;
	this.brainCost=0;

	for(var i=0; i<BSIZE; i++) {
    this.brain[i] = new Neuron();
    if(i<this.bInputs){
      this.brain[i].setRandom(MAXBINS,MAXBINS+8); // instantiate first 6 ins, first 7 outs
    }
    if(i>=MAXBINS && i<MAXBINS+8){
      this.brain[i].setRandom(MAXBINS,MAXBINS+8); // instantiate first 6 ins, first 7 outs
    }
    this.brainCost+=this.brain[i].cost;
	}
  /*

  // create space for neurons; start with 13. every new generation,

   Initialize eChange as the base determinant for accum. of complexity. if eCh > 0, strengthen weights via Hebbian logic: w(x,y) += LR*W*x.out*y.out, where LR denotes LEARNING RATE, W denotes weight. (Hebbian alg. scales correlated outputs). Over a long period, oldest neurons will be most established (have large synapses), taking longest to reduce. For eChange, Hebbian LR is a fractional relation= abs(eChange)/(maxECH || minECH). For all other neurons, record and accumulate the output values during instances of max/min eChange. Hebbians also dependent on proximity to the ECH input neuron.

   If a maxECH experienced: set LR == 1; -1 for minECh. Trigger addition of new neurons by NECESSITY- inability for current system to optimally approximate some problem. During weight changes, if a neuron is hovering but no solution is found (cyclic Hebbian, repeal, mutate == stalled), need to perform neuron split- divide & conquer via decomp into multiple steps/circumstances.

   Example: Suppose a maxECH is discovered. We have a 4 Neuron system:
         n0     n1     n2    n3
   w0   0.5   -0.2    0.9   0.1
   w1   0.1   0.88   -0.1   0.2
   w2  -0.4   -0.5    0.4   0.4
   w3  -0.2    0.0   0.76  -0.8

   where n3 is the (only) output neuron. So maxECH was directly dependent on whatever the output of n3 was; that output was dependent on whatever the input values were from n0, n1, and n2.


  Keep track of order for manipulation of neurons?
  */

	this.brainCost/=BSIZE;
	this.outputs=new Array(MAXBOUTS);
	for(var i=0;i<MAXBOUTS;i++) {
		this.outputs[i]=0;
	}

	this.energy=this.minSize*10000;
	this.maxEnergy=this.energy;
	this.eChange=0;

	this.maxECH=1;
	this.minECH=-1;

  this.gain=0;
	this.loss=0;
	this.dmgReceived=0;
	this.dmgCaused=0;
	this.score=0;
	this.top=SCORESCAP;
  this.cols = new Uint8ClampedArray(15);
  this.lr=0;
}

Animal.prototype.draw=function(c){
  c[0]=this.red/this.netFood*255;
  c[1]=this.green/this.netFood*255;
  c[2]=this.blue/this.netFood*255;
  c[3]=c[0]-20;
  c[4]=c[1]-20;
  c[5]=c[2]-20;
  c[6]=c[0]+20;
  c[7]=c[1]+20;
  c[8]=c[2]+20;
  c[9]=c[0]-40;
  c[10]=c[1]-40;
  c[11]=c[2]-40;
  c[12]=c[0]+40;
  c[13]=c[1]+40;
  c[14]=c[2]+40;
  ctx2.strokeStyle=rgbToHex(c[6],c[7],c[8]);
  ctx2.fillStyle=rgbToHex(c[12],c[13],c[14]);
  for(var i=0; i<5; i++) {
    ctx2.beginPath();
    ctx2.arc(this.eyes[i].x,this.eyes[i].y, this.size/10, 0, TWOPI);
    ctx2.stroke();
    ctx2.fill();
  }
  ctx2.strokeStyle= rgbToHex(c[3],c[4],c[5]);
  ctx2.fillStyle= rgbToHex(c[0],c[1],c[2]);
  ctx2.beginPath();
  ctx2.arc(this.x, this.y, this.size/2, 0, TWOPI);
  ctx2.stroke();
  ctx2.fill();

	ctx2.strokeStyle=rgbToHex(c[9],c[10],c[11]);
	ctx2.fillStyle=rgbToHex(c[3],c[4],c[5]);
	ctx2.beginPath();
	ctx2.arc(this.mouth.x,this.mouth.y, this.size/4, 0, TWOPI);
	ctx2.stroke();
	ctx2.fill();


	if(mouseOverMap && mouseX>=this.x-50 && mouseX<this.x+50 && mouseY>=this.y-50 && mouseY<this.y+50 && highlighted!=this.index) {
		ctx2.fillStyle= "#FFFFFF";
		ctx2.fillText(this.name+"-"+this.gen+(this.alive==true ? "A":"D")+this.children.length, this.x+(2*this.size), this.y-(2*this.size)+2);
	}
}
Animal.prototype.think=function(b) {
  if(this.eChange>=0) {
    this.lr=0.01*this.eChange/this.maxECH;
  } else {
    this.lr=0.01*(-this.eChange)/this.minECH;
  }
  // goal: empty neurons accum. input, eventually create output completely autonomously: find algorithm which does this.
  for(var i=0, input=0; i<BSIZE; i++) { // ...for each neuron
    b[i].cost=0;
    for(var j=0; j<BSIZE; j++){ // ...add up all other neuron synapses with respect to that neuron
      if(j<MAXBINS+MAXBOUTS){

        // weight flux
        if(b[i].o2>0){ // if
          if(b[j].o1>0 && b[i].o2*b[i].weights[j]>0) {
            if(b[i].bias*b[i].weights[j]>0) {
              if(b[i].bias>0){
                b[i].bias+=this.lr*abs(b[i].weights[j]*b[j].o1);
              } else {
                b[i].bias-=this.lr*abs(b[i].weights[j]*b[j].o1);
              }
            }
            if(b[i].i2*b[i].weights[j]>0){
              if(b[i].weights[j]>0){
                b[i].weights[j]+=this.lr*abs(b[i].i2*b[j].o1);
              }else {
                b[i].weights[j]-=this.lr*abs(b[i].i2*b[j].o1);
              }
            }
          } else if(b[j].o1<0 && b[i].o2*b[i].weights[j]<=0){
            if(b[i].bias*b[i].weights[j]<=0) {
              if(b[i].bias>0){
                b[i].bias+=this.lr*abs(b[i].weights[j]*b[j].o1);
              } else {
                b[i].bias-=this.lr*abs(b[i].weights[j]*b[j].o1);
              }
            }
            if(b[i].i2*b[i].weights[j]<=0){
              if(b[i].weights[j]>0){
                b[i].weights[j]+=this.lr*abs(b[i].i2*b[j].o1);
              }else {
                b[i].weights[j]-=this.lr*abs(b[i].i2*b[j].o1);
              }
            }
          }
        } else {
          if(b[j].o1>0 && b[i].o2*b[i].weights2[j]>0) {
            if(b[i].bias*b[i].weights2[j]>0) {
              if(b[i].bias>0){
                b[i].bias+=this.lr*abs(b[i].weights2[j]*b[j].o1);
              } else {
                b[i].bias-=this.lr*abs(b[i].weights2[j]*b[j].o1);
              }
            }
            if(b[i].i2*b[i].weights2[j]>0){
              if(b[i].weights2[j]>0){
                b[i].weights2[j]+=this.lr*abs(b[i].i2*b[j].o1);
              }else {
                b[i].weights2[j]-=this.lr*abs(b[i].i2*b[j].o1);
              }
            }
          } else if(b[j].o1<0 && b[i].o2*b[i].weights2[j]<=0){
            if(b[i].bias*b[i].weights2[j]<=0) {
              if(b[i].bias>0){
                b[i].bias+=this.lr*abs(b[i].weights2[j]*b[j].o1);
              } else {
                b[i].bias-=this.lr*abs(b[i].weights2[j]*b[j].o1);
              }
            }
            if(b[i].i2*b[i].weights2[j]<=0){
              if(b[i].weights2[j]>0){
                b[i].weights2[j]+=this.lr*abs(b[i].i2*b[j].o1);
              }else {
                b[i].weights2[j]-=this.lr*abs(b[i].i2*b[j].o1);
              }
            }
          }
        }
      }
      input+=b[j].synapse(i);
      b[i].cost+=abs(b[i].weights[j])+abs(b[i].weights2[j]);
    }
    b[i].cost+=abs(b[i].bias);
    this.brainCost+=b[i].cost;
    b[i].in=input; // set activation of neuron
    input=0;
  }
  this.brainCost/=BSIZE;

  b[0].in+=this.food/(256*this.size);
  if(this.eChange>=0) {
    b[1].in+=this.eChange/this.maxECH;
  } else {
    b[1].in+=(-this.eChange)/this.minECH;
  }
  b[2].in+=this.mouth.r;
  b[3].in+=this.mouth.g;
  b[4].in+=this.mouth.b;
  b[5].in+=this.mouth.sense;
  b[6].in+=this.health;
  b[7].in+=((this.size-this.midSize)-this.minSize)/this.midSize;
  b[8].in+=this.outputs[0];

  var idx=9;
  for(var j=0; j<5; j++) {
    b[(4*j)+idx].in+=this.eyes[j].r;
    b[(4*j)+idx+1].in+=this.eyes[j].g;
    b[(4*j)+idx+2].in+=this.eyes[j].b;
    b[(4*j)+idx+3].in+=this.eyes[j].sense;
  }
  // Second Loop: Process all inputs
  for(var i=0; i<BSIZE; i++) {
    b[i].ceil();
  }
  for(var i=0; i<BSIZE; i++) {
    b[i].o3=b[i].o2;
    b[i].o2=b[i].o1;
    b[i].o1=b[i].out;
    b[i].i3=b[i].i2;
    b[i].i2=b[i].i1;
    b[i].i1=b[i].in;
  }

  for(var i=0; i<MAXBOUTS; i++) {
    this.outputs[i]=b[i+MAXBINS].out;
  }
}

Animal.prototype.move=function() {
  this.eChange=0;
  this.eChange-=this.loss;
  this.dmgReceived+=this.loss;
  this.loss=0;
  this.vel=this.outputs[0]*this.maxSize;
  this.rot=this.outputs[1]*this.maxSize;
  this.dir+=this.rot;
  if(this.dir<0) {
    this.dir+=360;
  } else if(this.dir>359) {
    this.dir-=360;
  }
  this.velDir=this.dir+(this.outputs[7]*180);
  if(highlighted==this.index && leftPressed && mouseOverMap && abs(this.x-mouseX)<20 && abs(this.y-mouseY)<20){
    this.x=round(mouseX);
    this.y=round(mouseY);
  } else {
    this.x+=this.vel*Math.cos((this.velDir)*DEGTORAD);
    this.y+=this.vel*Math.sin((this.velDir)*DEGTORAD);
  }

  if(this.x<0 || this.x>=FIELDX) {
    if(this.x<0) {
      this.x=0;
    } else {
      this.x=FIELDX-1;
    }
    this.outputs[0]=0;
  }
  if(this.y<0 || this.y>=FIELDY) {
    if(this.y<0) {
      this.y=0;
    } else {
      this.y=FIELDY-1;
    }
    this.outputs[0]=0;
  }

  //update current tile
  var ct=((~~(this.y/25)*40)+(~~(this.x/25)));
  if(ct>=1600) {
    this.tile=1599;
  } else if (ct<0) {
    this.tile= 0;
  }
  this.tile=ct;

  var s1=this.size;

  this.mouth.stray=this.outputs[9]*180;
  this.mouth.dis=this.outputs[10]*2*s1;
  this.mouth.sees=0;
  this.mouth.setXY(this.dir,this.x,this.y);

  for(var i=0;i<5; i++) {
    this.eyes[i].stray=this.outputs[(i*2)+12]*180;
    this.eyes[i].dis=this.outputs[(i*2)+13]*5*s1;
    this.eyes[i].setXY(this.dir, this.x, this.y);
    this.eyes[i].sense=0;
    this.eyes[i].sees=0;
  }

}

Animal.prototype.interact=function() {
  var s1=this.size;
  this.food=0;

  if(this.mouth.tile!=null) { // SET CURR TILE
    this.mouth.r=tiles[this.mouth.tile].R/150;
    this.mouth.g=tiles[this.mouth.tile].G/200;
    this.mouth.b=tiles[this.mouth.tile].B/100;
  }

  for(var i=0; i<5; i++) { // SET CURR TILE
    if(this.eyes[i].tile!=null) {
      this.eyes[i].r=tiles[this.eyes[i].tile].R/150;
      this.eyes[i].g=tiles[this.eyes[i].tile].G/200;
      this.eyes[i].b=tiles[this.eyes[i].tile].B/100;
    }
  }
  /*
  loop through all animals:
  (s1/4)= radius of mouth
  */
  for(var j=0; j<=HIGHESTINDEX; j++) {
    if(animals[j].alive==true && (j!=this.index)) {
      if(this.mouth.sees==0) {
        if( ((abs(this.mouth.x-animals[j].x) <=((animals[j].size/2)+(s1/4))) && (abs(this.mouth.y-animals[j].y)<=((animals[j].size/2)+(s1/4)))) || ((abs(this.mouth.x-animals[j].mouth.x)<=((animals[j].size/4)+(s1/4))) && (abs(this.mouth.y-animals[j].mouth.y)<=((animals[j].size/4)+(s1/4)))) ) {
          this.mouth.sees=1;
          this.mouth.r=((2*animals[j].red/animals[j].netFood)-1);
          this.mouth.g=((2*animals[j].green/animals[j].netFood)-1);
          this.mouth.b=((2*animals[j].blue/animals[j].netFood)-1);
          this.mouth.sense=animals[j].outputs[2]*animals[j].size/SIZECAP;
          //this.mouth.sense2=animals[j].health;
          if(this.outputs[2]<0) { // carnivore
            var r=s1*this.outputs[3]*(-this.outputs[2]); // if outputs[3]>0, then r is +. else r is - (giving energy)
            var g=s1*this.outputs[4]*(-this.outputs[2]);
            var b=s1*this.outputs[5]*(-this.outputs[2]);
            r*=256*(animals[j].red/animals[j].netFood)-128;
            g*=256*(animals[j].green/animals[j].netFood)-128;
            b*=256*(animals[j].blue/animals[j].netFood)-128;
            if(r>0){
              this.netRed+=r;
              this.red+=r;
            } else {
              this.netRed-=r;
            }
            if(g>0){
              this.netGreen+=g;
              this.green+=g;
            } else {
              this.netGreen-=g;
            }
            if(b>0){
              this.netBlue+=b;
              this.blue+=b;
            } else {
              this.netBlue-=b;
            }
            this.food=r+g+b;
            animals[j].loss+=this.food; // energy exchanged with interacted creature
            this.dmgCaused+=this.food;
          }
        }
      }

      for(var i=0; i<5; i++) {
        if(this.eyes[i].sees==0) {
          if(((abs(this.eyes[i].x-animals[j].x)-(s1/8))<=animals[j].size/2 && (abs(this.eyes[i].y-animals[j].y)-(s1/8))<=animals[j].size/2) || ((abs(this.eyes[i].x-animals[j].mouth.x)-(s1/8))<=animals[j].size/4 && (abs(this.eyes[i].y-animals[j].mouth.y)-(s1/8))<=animals[j].size/4)) {
            this.eyes[i].r=((2*animals[j].red/animals[j].netFood)-1);
            this.eyes[i].g=((2*animals[j].green/animals[j].netFood)-1);
            this.eyes[i].b=((2*animals[j].blue/animals[j].netFood)-1);
            this.eyes[i].sense=animals[j].outputs[2]*animals[j].size/SIZECAP;
            this.eyes[i].sees=1;
          }
        }
      }
    }
  }
  if(this.outputs[2]>=0) { //herbivore
    if(this.mouth.tile!=null) {
      var t = this.mouth.tile;
      var r=s1*this.outputs[2]*this.outputs[3]; // herb*red
      var g=s1*this.outputs[2]*this.outputs[4];
      var b=s1*this.outputs[2]*this.outputs[5];
      tiles[t].update=true;
      if(r>0){ // eat red
        r*=tiles[t].R;
        if(r>0){ // tile fertile
          this.netRed+=r;
          this.red+=r;
          tiles[t].R-=r;
        } else { // tile toxic
          this.netRed-=r;
          tiles[t].R+=r;
        }
        if(tiles[t].R<-tiles[t].RCap) {
          tiles[t].R=-tiles[t].RCap;
        }
      } else { // spit red
        tiles[t].R-=r;
        if(tiles[t].R>255){
          tiles[t].R=255;
        }
      }
      if(g>0){
        g*=tiles[t].G;
        if(g>0){
          this.netGreen+=g;
          this.green+=g;
          tiles[t].G-=g;
        } else { // g < 0
          this.netGreen-=g;
          tiles[t].G+=g;
        }
        if(tiles[t].G<-tiles[t].GCap) {
          tiles[t].G=-tiles[t].GCap;
        }
      } else {
        tiles[t].G-=g;
        if(tiles[t].G>255){
          tiles[t].G=255;
        }
      }
      if(b>0){
        b*=tiles[t].B; // t.B could be negative
        if(b>0){
          this.netBlue+=b;
          this.blue+=b;
          tiles[t].B-=b;

        } else {
          this.netBlue-=b;
          tiles[t].B+=b;
        }
        if(tiles[t].B<-tiles[t].BCap) {
          tiles[t].B=-tiles[t].BCap;
        }
      } else { // b<0
        tiles[t].B-=b;
        if(tiles[t].B>255){
          tiles[t].B=255;
        }
      }
      this.food=r+g+b;
    }
  }
}
Animal.prototype.scores=function() {
  for(var i=0, sC=SCORESCAP;i<sC;i++) {
    if(this.top<=i) {
      break;
    } else if(scores[i]==null){
      if(this.top<sC) {
        scores[this.top]=null;
      }
      scores[i]=this.index; //If called from graveyard during resetScore, it should work... no bugs yet
      this.top=i;
      break;
    }else {
      if(scores[i]<0){
        if(this.score>graveyard[-(scores[i]+1)].score) {
          if(this.top<sC) {
            scores[this.top]=null;
          }
          var j;
          for(j=0;j<sC;j++) {
            if(scores[j]==null) {
              scores[j]=scores[i];
              graveyard[-(scores[j]+1)].top=j;
              break;
            }
          }
          if(j==sC) {
            graveyard[-(scores[i]+1)].top=sC;
          }
          scores[i]=this.index;
          this.top=i;
          break;
        }
      } else {
        if(this.score>animals[scores[i]].score) {
          if(this.top<sC) {
            scores[this.top]=null;
          }
          var j;
          for(j=0;j<sC;j++) {
            if(scores[j]==null) {
              scores[j]=scores[i];
              animals[scores[j]].top=j;
              break;
            }
          }
          if(j==sC) {
            animals[scores[i]].top=sC;
          }
          scores[i]=this.index;
          this.top=i;
          break;
        }
      }
    }
  }
}
Animal.prototype.grow=function() {
  if(this.outputs[6]>=0.33) {
    if(this.size>=2*this.minSize) {
      if(LIVEPOP<POPCAP) {
        var i=0;
        while (animals[i]!=null) {
          if(animals[i].top<SCORESCAP || animals[i].alive==true) {  //Alive clause effectively determines that animal isnt overwriting itself
            i++;
          } else {
            break;
          }
        }
        if(i>HIGHESTINDEX) {
          HIGHESTINDEX=i;
        }
        var mutant=new Animal(this.x,this.y,i);
        this.descendants++;
        this.liveDescendants++;
        this.mutate(mutant);
        this.size-=this.minSize;
        this.size=round(10*this.size)/10;
        this.children.push(i);
        animals[i]=null;
        animals[i]=mutant;
        newest=i;
        LIVEPOP++;

        var ancestor=this.pidx;
        while(ancestor!=null) {
          if(ancestor>=0) {
            animals[ancestor].descendants++;
            animals[ancestor].liveDescendants++;
            ancestor=animals[ancestor].pidx;
          } else {
            graveyard[-(ancestor+1)].descendants++;
            graveyard[-(ancestor+1)].liveDescendants++;
            ancestor=graveyard[-(ancestor+1)].pidx;
          }
        }

        if(scoreType==0){
          this.score=this.children.length;
        }
        while(mutant.gen>=PPG.length){
          // if the is a 7th gen creature but only creatures up to gen 5 have died, create space for new gen
          PPG.push(0);
          FPG.push(0);
          BPG.push(0);
        }
        PPG[mutant.gen]++;
        if(PPG[mutant.gen]>maxPPG){
          maxPPG=PPG[mutant.gen];
        }
        BPG[mutant.gen]+=mutant.brainCost;
        if(BPG[mutant.gen]/PPG[mutant.gen]>maxBPG){
          maxBPG=BPG[mutant.gen]/PPG[mutant.gen];
        }
      }
    }
  } else if(this.outputs[6]>-0.33) {
    if(this.size<this.maxSize && this.energy/10000>(this.size+0.1)) {
      this.size+=0.1;
      this.size=round(10*this.size)/10;
      this.energy-=1000;
    }
  }
}
Animal.prototype.decay=function() {
	if(this.energy<=0) {
		this.alive=false;
		LIVEPOP--;

		var c= this.tile;
		tiles[c].R+=this.size;
		if(tiles[c].R>255) {
			tiles[c].R=255;
		}
		tiles[c].G+=this.size;
		if(tiles[c].G>255) {
			tiles[c].G=255;
		}
		tiles[c].B+=this.size;
		if(tiles[c].B>255) {
			tiles[c].B=255;
		}

		if(this.index==HIGHESTINDEX) {
			var i=this.index;
			while(i>-1 && animals[i].alive==false) {
				i--;
			}
			HIGHESTINDEX=i;
		}
    // CHANGE
    var dead = new Animal(this.x, this.y, -(graveyard.length+1)); // set a index to pos in dead array...
		//var dead = new Animal(this.x, this.y, graveyard.length); // set a index to pos in dead array...
		this.grave(dead);

		if(this.pidx!=null) { //animal needs to tell parent/children its dead... needs to know if parent is alive. If parent dead, pidx will be negative (-(pidx+1)).
			if(this.pidx<0) { //if parent is dead, no worries
				graveyard[-(this.pidx+1)].children[this.cno]= dead.index;
			} else {
        animals[this.pidx].children[this.cno]=dead.index;
      }

      var anc = this.pidx;
      while(anc!=null){
        if(anc>=0){
          animals[anc].liveDescendants--;
          anc = animals[anc].pidx;
        } else {
          graveyard[-(anc+1)].liveDescendants--;
          anc = graveyard[-(anc+1)].pidx;
        }
      }
		}

    globalNetNRG+=this.gain;
    netLifespan+=this.age;
    FPG[this.gen]+=(this.posFood/this.netFood);

		graveyard.push(dead);
		for(var i=0, cL=this.children.length; i<cL; i++) {
			if(this.children[i]<0) {
				graveyard[-(this.children[i]+1)].pidx=dead.index;
			} else {
				animals[this.children[i]].pidx=dead.index;
			}
		}
		if(highlighted==this.index) {
      // CHANGE
      // highlighted=-(dead.index+1);
			highlighted=dead.index;
			if(display!=1 && display!=2) {
				dashboard.setup();
			}
		}
    if(this.index==newest){
      newest=dead.index;
    }
    if(this.top<SCORESCAP) {
      scores[this.top]=dead.index;
    }

	} else {
		this.eChange+=this.food-(abs(this.rot)+abs(this.vel)+this.brainCost+this.size);
		this.energy+=this.eChange;
    if(this.eChange>0) {
      this.gain+=this.eChange;
    }
		if(this.energy>this.maxEnergy) {
			this.maxEnergy=this.energy;
		}
		if(this.food<0){
      this.netFood-=this.food;
		} else {
      this.netFood+=this.food;
      this.posFood+=this.food;
    }
    if(this.netFood!=0){
      aveFER+=(this.posFood/this.netFood)/LIVEPOP; // Add living animals ratio of pos/net FNRG
    }
    aveAge+=this.age/LIVEPOP;
    aveChildren+=(this.children.length)/LIVEPOP;
		this.loss=0;
    this.age++;
		if(this.eChange>this.maxECH) {
			this.maxECH=this.eChange;
		} else if(this.eChange<this.minECH) {
			this.minECH=this.eChange;
		}
		this.health=(this.energy-(this.maxEnergy/2))/(this.maxEnergy/2);
    if(scoreType==1){
      this.score=this.age;
    } else if(scoreType==2){
      this.score=round(this.gain);
    }
	}
}

Animal.prototype.mutate=function(a) {
  a.alive=true;
  a.dir=this.dir;
  a.velDir=this.velDir;
  a.gen=this.gen+1;
  a.x=this.x;
  a.y=this.y;
  a.parent=this.name+"-"+this.gen;
  a.pidx=this.index;
  a.cno=this.children.length;
  a.name=this.name;

  a.maxSize=this.maxSize;
  a.minSize=this.minSize;
  a.maxSize+=this.getMutations(5,10,0,0);

  a.maxSize=round(10*a.maxSize)/10;
  if(a.maxSize>SIZECAP) {
    a.maxSize=SIZECAP;
  } else if(a.maxSize<round(20*a.minSize)/10) {
    a.maxSize=2*a.minSize;
  }
  a.maxSize=round(10*a.maxSize)/10;

  a.minSize+=this.getMutations(6,10,0,0);
  a.minSize=round(10*a.minSize)/10;
  if(a.minSize>round(10*(a.maxSize-0.1)/2)/10) {
    a.minSize=round(10*(a.maxSize-0.1)/2)/10;
  }else if(a.minSize<5) {
    a.minSize=5;
  }
  a.minSize=round(10*a.minSize)/10;
  if(a.maxSize<10){
    a.maxSize=10;
    a.minSize=5;
  }

  a.midSize=(a.maxSize-a.minSize)/2;
  a.size=a.minSize;

  a.energy=a.minSize*10000;
  a.maxEnergy=a.energy;
  a.vel=0;
  a.rot=0;

  if(round(Math.random()*2)==2) {
    if(round(Math.random()*(2+1))==2) {
      if(round(Math.random()*(2+2))==2) {
        if(round(Math.random()*(2+3))==2) {
          a.name=ALPH.charAt(round(Math.random()*25))+a.name.charAt(1)+a.name.charAt(2)+a.name.charAt(3);
        } else {
          a.name=a.name.charAt(0)+ALPH.charAt(round(Math.random()*25))+a.name.charAt(2)+a.name.charAt(3);
        }
      } else {
        a.name=a.name.charAt(0)+a.name.charAt(1)+ALPH.charAt(round(Math.random()*25))+a.name.charAt(3);
      }
    } else {
      a.name=a.name.charAt(0)+a.name.charAt(1)+a.name.charAt(2)+ALPH.charAt(round(Math.random()*25));
    }
  }

  for(var i=0; i<BSIZE; i++) {
    if(i<6) {
      for(var j=0; j<BSIZE; j++){
        if(j>=MAXBINS && j<MAXBINS+8) {
          a.brain[i].weights[j]=this.brain[i].weights[j];
          a.brain[i].weights2[j]=this.brain[i].weights2[j];
        }
      }
      a.brain[i].bias=this.brain[i].bias;
      a.brain[i].cost=this.brain[i].cost;
    }
  }
  a.brainCost=this.brainCost;
}

Animal.prototype.grave=function(a) {
  a.alive=false;
  a.gen=this.gen;
  a.x=this.x;
  a.y=this.y;
  a.parent=this.parent;
  a.pidx=this.pidx;
  a.cno=this.cno;
  a.name=this.name;
  a.tile=this.tile;
  a.maxSize=this.maxSize;
  a.minSize=this.minSize;
  a.midSize=this.midSize;
  a.size=this.size;
  a.energy=this.energy;
  a.maxEnergy=this.maxEnergy;
  a.vel=this.vel;
  a.rot=this.rot;
  a.dir=this.dir;
  a.velDir=this.velDir;
  a.score=this.score;
  a.age=this.age;
  a.maxECH = this.maxECH;
  a.minECH = this.minECH;
  for(var i=0;i<this.children.length;i++) {
    a.children.push(this.children[i]);
  }
  a.descendants=this.descendants;
  a.liveDescendants=this.liveDescendants;
  a.proGenes=this.proGenes;
  a.conGenes=this.conGenes;
  a.dmgCaused=this.dmgCaused;
  a.dmgReceived=this.dmgReceived;
  a.health=this.health;
  a.netFood=this.netFood;
  a.posFood=this.posFood;

  a.food=this.food;
  a.eChange=this.eChange;
  a.gain= this.gain;

  for(var i=0; i<5; i++) {
    a.eyes[i]=new Eye(a.x,a.y);
    a.eyes[i].stray=this.eyes[i].stray;
    a.eyes[i].dis=this.eyes[i].dis;
    a.eyes[i].x=this.eyes[i].x;
    a.eyes[i].y=this.eyes[i].y;
    a.eyes[i].r=this.eyes[i].r;
    a.eyes[i].g=this.eyes[i].g;
    a.eyes[i].b=this.eyes[i].b;
    a.eyes[i].sense=this.eyes[i].sense;
  }

  a.mouth.dis=this.mouth.dis;
  a.mouth.stray=this.mouth.stray;
  a.mouth.x=this.mouth.x;
  a.mouth.y=this.mouth.y;
  a.mouth.tile=this.mouth.tile;
  a.mouth.r=this.mouth.r;
  a.mouth.g=this.mouth.g;
  a.mouth.b=this.mouth.b;
  a.mouth.sense=this.mouth.sense;

  for(var i=0; i<BSIZE; i++) {
    a.brain[i].cost=this.brain[i].cost;
    a.brain[i].in=this.brain[i].in;
    a.brain[i].out=this.brain[i].out;
    for(var j=0;j<BSIZE; j++) {
      a.brain[i].weights[j]=this.brain[i].weights[j];
    }
    a.brain[i].bias=this.brain[i].bias;
  }
  a.brainCost=this.brainCost;
  for(var i=0;i<MAXBOUTS;i++) {
    a.outputs[i]=this.outputs[i];
  }

  a.red=this.red;
  a.green=this.green;
  a.blue=this.blue;
  a.netRed=this.netRed;
  a.netGreen=this.netGreen;
  a.netBlue=this.netBlue;
  for(var i=0;i<15;i++){
    a.cols[i]=this.cols[i];
  }
}
Animal.prototype.clone=function(a) {
  a.alive=true;
  a.gen=this.gen+1;
  a.x=this.x;
  a.y=this.y;
  a.parent=this.name+"-"+this.gen;
  a.pidx=this.index;
  a.cno=this.children.length;
  a.name=this.name;
  a.tile=this.tile;

  a.maxSize=this.maxSize;
  a.minSize=this.minSize;

  a.maxSize+=this.getMutations(5,10,0,0);
  a.maxSize=round(10*a.maxSize)/10;
  if(a.maxSize>SIZECAP) {
    a.maxSize=SIZECAP;
  } else if(a.maxSize<round(20*a.minSize)/10) {
    a.maxSize=2*a.minSize;
  }
  a.maxSize=round(10*a.maxSize)/10;

  a.minSize+=this.getMutations(6,10,0,0);
  a.minSize=round(10*a.minSize)/10;
  if(a.minSize>round(10*(a.maxSize-0.1)/2)/10) {
    a.minSize=round(10*(a.maxSize-0.1)/2)/10;
  }else if(a.minSize<5) {
    a.minSize=5;
  }
  a.minSize=round(10*a.minSize)/10;
  if(a.maxSize<10){
    a.maxSize=10;
    a.minSize=5;
  }

  a.midSize=(a.maxSize-a.minSize)/2;
  a.size=a.minSize;

  a.energy=this.minSize*10000;
  a.maxEnergy=this.energy;
  a.vel=this.vel;
  a.rot=this.rot;
  a.dir=this.dir;
  a.velDir=this.velDir;

  a.health=this.health;
  a.food=this.food;
  a.eChange=this.eChange;

  for(var i=0; i<5; i++) {
    a.eyes[i]=new Eye(a.x,a.y);
  }

  for(var i=0; i<BSIZE; i++) {
    for(var j=0; j<BSIZE; j++) {
      a.brain[i].weights[j]=this.brain[i].weights[j];
      a.brain[i].weights2[j]=this.brain[i].weights2[j];
    }
    a.brain[i].cost=this.brain[i].cost;
    a.brain[i].bias=this.brain[i].bias;
  }
  a.brainCost= this.brainCost;
}
Animal.prototype.kill=function() {
  if(this.alive==true){
    this.energy=-1;
  }
}
Animal.prototype.reincarnate=function() {
  if(this.alive==false){
    if(LIVEPOP<POPCAP) {
      var i=0;
      while (animals[i]!=null) {
        if(animals[i].top<SCORESCAP || animals[i].alive==true) {  //Alive clause effectively determines that animal isnt overwriting itself
          i++;
        } else {
          break;
        }
      }
      if(i>HIGHESTINDEX) {
        HIGHESTINDEX=i;
      }

      var rein=new Animal(this.x,this.y,i);
      this.clone(rein);
      this.descendants++;
      this.liveDescendants++;
      this.children.push(i);

      animals[i]=null;
      animals[i]=rein;

      newest=i;
      LIVEPOP++;
      var ancestor=this.pidx;
      while(ancestor!=null) {
        if(ancestor>=0) {
          animals[ancestor].descendants++;
          animals[ancestor].liveDescendants++;
          ancestor=animals[ancestor].pidx;
        } else {
          graveyard[-(ancestor+1)].descendants++;
          graveyard[-(ancestor+1)].liveDescendants++;
          ancestor=graveyard[-(ancestor+1)].pidx;
        }
      }
      highlighted= rein.index;
    }
  }
}
Animal.prototype.highlight=function() {
  if(this.alive==false) {
    this.draw(this.cols);
  }
  var s = this.size;

  // DRAW HIGHLIGHT INFO
  ctx2.beginPath();
  ctx2.fillStyle="#FFFFFF";
  ctx2.strokeStyle="#FFFFFF";
  ctx2.strokeRect(this.x-(2*s), this.y-(2*s), s*4, s*4);
  var oriX=this.x+(this.size*Math.cos(this.dir*DEGTORAD));
  var oriY=this.y+(this.size*Math.sin(this.dir*DEGTORAD));
  ctx2.moveTo(this.x,this.y);
  ctx2.lineTo(oriX, oriY);
  //ctx2.lineTo(oriX+(this.rot*this.size*Math.cos((this.dir+90)*DEGTORAD)),oriY+(this.rot*this.size*Math.sin((this.dir+90)*DEGTORAD)));
  ctx2.stroke();

  ctx2.beginPath();
  ctx2.strokeStyle="#FF0000";
  var velX=this.x+(this.vel*2*Math.cos((this.velDir)*DEGTORAD));
  var velY=this.y+(this.vel*2*Math.sin((this.velDir)*DEGTORAD));
  ctx2.moveTo(this.x,this.y);
  ctx2.lineTo(velX, velY);
  ctx2.lineTo(velX+(this.rot*2*Math.cos((this.velDir+90)*DEGTORAD)),velY+(this.rot*2*Math.sin((this.velDir+90)*DEGTORAD)));
  ctx2.stroke();

  ctx2.strokeStyle="#FFFFFF";
  if(mouseOverMap && mouseX>=this.x-50 && mouseX<this.x+50 && mouseY>=this.y-50 && mouseY<this.y+50) {
    for(var i=0;i<5;i++) {
      ctx2.beginPath();
      ctx2.arc(round(this.eyes[i].x),round(this.eyes[i].y), round(this.size/5), 0, TWOPI);
      ctx2.fillText("E"+(i+1), this.eyes[i].x+(s/2), this.eyes[i].y-(s/2));
      ctx2.stroke();
    }
  }
  var posx=this.x+(2*s);
  var posy=this.y-(2*s);
  if(this.alive==true) {
    ctx2.fillText(this.name+"-"+this.gen+(this.alive==true ? "A":"D")+this.children.length,posx, posy+2);
  }
  posy+=10;
  if(this.outputs[2]<-0.80) {
    ctx2.fillText("CARN+++",posx,posy);
  } else if(this.outputs[2]<-0.50) {
    ctx2.fillText("CARN++",posx,posy);
  } else if(this.outputs[2]<-0.20) {
    ctx2.fillText("CARN+",posx,posy);
  } else if(this.outputs[2]>=0.80) {
    ctx2.fillText("HERB+++",posx,posy);
  } else if(this.outputs[2]>=0.50) {
    ctx2.fillText("HERB++",posx,posy);
  } else if(this.outputs[2]>=0.20) {
    ctx2.fillText("HERB+",posx,posy);
  } else {

  }
  posy+=10;
  if(this.outputs[3]<-0.33) {
    ctx2.fillText("EATR",posx,posy);
  } else if(this.outputs[3]>=0.33) {
    ctx2.fillText("EATG",posx,posy);
  } else {
    ctx2.fillText("EATB",posx,posy);
  }

  if(display==0) { // MAIN stat display card
    ctx4.beginPath();
    ctx4.fillStyle=rgbToHex(this.cols[0],this.cols[1],this.cols[2]);
    ctx4.fillRect(200,200,400,200);
    posx=210;
    posy=210;
    ctx4.fillStyle= "#FFFFFF";
    if(this.red/this.netFood>0.5 || this.green/this.netFood>0.5 || this.blue/this.netFood>0.5) {
      ctx4.fillStyle= "#000000";
    }
    if(this.alive==true) {
      ctx4.fillText(this.name+"-"+this.gen+"A"+this.children.length, posx, posy+=10);
    } else {
      ctx4.fillText(this.name+"-"+this.gen+"D"+this.children.length, posx, posy+=10);
    }
    ctx4.fillText("IDX: "+this.index,posx,posy+=10);

    if(this.parent!=null) {
      if(this.pidx<0) {
        ctx4.fillText("PAR: "+this.parent+"D"+graveyard[(-(this.pidx+1))].children.length,posx, posy+=10);
      }else {
        ctx4.fillText("PAR: "+this.parent+"A"+animals[this.pidx].children.length,posx, posy+=10);
      }
      if(mouseOverConsole && leftPressed) {
        if(mouseX>posx && mouseX<posx+80) {
          if(mouseY>posy-5 && mouseY<posy+5) {
            highlighted=this.pidx;
            leftPressed=false;
          }
        }
      }
    }
    if(this.cno!=null){
      ctx4.fillText("CNO: "+(this.cno+1),posx,posy+=10);
    }
    ctx4.fillText("DESC: "+this.liveDescendants+"/"+this.descendants,posx,posy+=10);
    ctx4.fillText("PRO/CON: "+this.proGenes+"/"+this.conGenes,posx,posy+=10);

    posy+=10;
    ctx4.fillText("NRG: "+round(this.energy),posx,posy+=10);
    ctx4.fillText("NETNRG: "+round(this.gain),posx,posy+=10);
    ctx4.fillText("TOP: "+round(this.top),posx, posy+=10);
    ctx4.fillText("B$: "+(round(1000*this.brainCost)/1000),posx,posy+=10);
    posy+=10;
    ctx4.fillText("POS: "+round(this.x)+", "+round(this.y),posx,posy+=10);
    ctx4.fillText("DIR: "+round(this.dir*10)/10,posx, posy+=10);
    ctx4.fillText("VEL: "+round(this.vel*10)/10,posx, posy+=10);
    ctx4.fillText("ROT: "+round(this.rot*10)/10,posx, posy+=10);
    ctx4.fillText("HLTH: "+round(100*this.health)/100, posx,posy+=10);
    ctx4.fillText("AGE: "+this.age, posx,posy+=10);

    posx+=100;
    posy=210;
    ctx4.fillText("SIZE: "+this.minSize+"<"+(round(10*s)/10)+"<"+this.maxSize, posx, posy+=10);
    posy+=10;
    ctx4.fillText(">>DMG: "+round(this.dmgReceived*100)/100,posx,posy+=10);
    ctx4.fillText("DMG>>: "+round(this.dmgCaused*100)/100,posx,posy+=10);
    posy+=10;
    if(this.outputs[2]<-0.80) {
      ctx4.fillText("CARN++",posx,posy+=10);
    } else if(this.outputs[2]<-0.5) {
      ctx4.fillText("CARN+",posx,posy+=10);
    } else if(this.outputs[2]<-0.20) {
      ctx4.fillText("CARN",posx,posy+=10);
    } else if(this.outputs[2]>=0.80) {
      ctx4.fillText("HERB++",posx,posy+=10);
    } else if(this.outputs[2]>=0.50) {
      ctx4.fillText("HERB+",posx,posy+=10);
    } else if(this.outputs[2]>=0.20) {
      ctx4.fillText("HERB",posx,posy+=10);
    } else {
      posy+=10;
    }

    if(this.outputs[3]<-0.33) {
      ctx4.fillText("EATR",posx,posy+=10);
    } else if(this.outputs[3]>=0.33) {
      ctx4.fillText("EATG",posx,posy+=10);
    } else {
      ctx4.fillText("EATB",posx,posy+=10);
    }
    ctx4.fillText("ECH+: "+(round(this.maxECH*100)/100),posx,posy+=10);
    ctx4.fillText("ECH-: "+(round(this.minECH*100)/100),posx,posy+=10);
    ctx4.fillText("POSFNRG: "+(round(this.posFood*100)/100),posx,posy+=10);
    ctx4.fillText("NETFNRG: "+(round(this.netFood*100)/100)+" ("+ round(100*this.netRed/this.netFood)+"% R, "+round(100*this.netGreen/this.netFood)+"% G, "+round(100*this.netBlue/this.netFood)+"% B)",posx,posy+=10);
    ctx4.fillText("FER: "+(round(this.posFood*100/this.netFood)/100),posx,posy+=10);
    posx+=100;
    posy=210;
    //ctx4.fillText("MTILE: "+this.mouth.tile+" MPOS: "+round(this.mouth.x)+", "+round(this.mouth.y), posx, posy+=10);
    ctx4.fillText((this.mouth.sees==1 ? "M ":"")+(this.eyes[0].sees==1 ? "E1 ":"")+(this.eyes[1].sees==1 ? "E2 ":"")+(this.eyes[2].sees==1 ? "E3 ":"")+(this.eyes[3].sees==1 ? "E4 ":"")+(this.eyes[4].sees==1 ? "E5 ":""), posx, posy+=10);
    ctx4.fillText("R: "+round(this.red)+"/"+round(this.netRed)+" ("+round(100*this.red/this.netRed)+"%)", posx, posy+=10);
    ctx4.fillText("G: "+round(this.green)+ "/"+round(this.netGreen)+" ("+round(100*this.green/this.netGreen)+"%)", posx, posy+=10);
    ctx4.fillText("B: "+round(this.blue)+ "/"+round(this.netBlue)+" ("+round(100*this.blue/this.netBlue)+"%)", posx, posy+=10);
    ctx4.fillStyle= rgbToHex(this.cols[12],this.cols[13],this.cols[14]);
    ctx4.fillRect(200,200,10,10);
    ctx4.fillRect(220,200,10,10);
    ctx4.fillRect(240,200,10,10);
    ctx4.fillRect(260,200,10,10);
    ctx4.fillRect(280,200,10,10);
    ctx4.fillRect(300,200,10,10);
    ctx4.fillStyle=rgbToHex(this.cols[9],this.cols[10],this.cols[11]);
    ctx4.fillText("X",201,209);
    ctx4.fillText("B",221,209);
    ctx4.fillText("F",241,209);
    ctx4.fillText("M",261,209);
    ctx4.fillText("R",281,209);
    ctx4.fillText("K",301,209);

    if(mouseOverConsole && leftPressed) {
      if(mouseX>200 && mouseX<210 && mouseY>200 && mouseY<210) { // Exit
        display=0;
        highlighted=null;
        ctx3.fillStyle="#323232";
        ctx3.fillRect(200, 200, 400, 200);
        leftPressed=false;
      } else if(mouseX>220 && mouseX<230 && mouseY>200 && mouseY<210) { // Brain
        display=1;
        leftPressed=false;
      } else if(mouseX>240 && mouseX<250 && mouseY>200 && mouseY<210) { // Fam
        display=3;
        leftPressed=false;
      } else if(mouseX>260 && mouseX<270 && mouseY>200 && mouseY<210) { // Muts
        display=4;
        leftPressed=false;
      } else if(mouseX>280 && mouseX<290 && mouseY>200 && mouseY<210) { // Reincarnate
        this.reincarnate();
        leftPressed=false;
      } else if(mouseX>300 && mouseX<310 && mouseY>200 && mouseY<210) {
        this.kill();
        leftPressed=false;
      }
    }
  } else if(display==1) { // BRAIN DISPLAY
    ctx3.beginPath();
    ctx3.fillStyle="#808080";
    ctx3.fillRect(0,0,DASHX,DASHY);
    ctx3.fillStyle="#A0A0A0"
    ctx3.fillRect(0,0,10,10);
    ctx3.fillStyle="#606060"
    ctx3.fillText("X",1,9);
    ctx3.fillStyle=rgbToHex(round(255*this.red/this.netFood),round(255*this.green/this.netFood),round(255*this.blue/this.netFood));
    ctx3.arc(40,40, 25, 0, TWOPI);
    ctx3.fill();
    ctx3.fillStyle="#FFFFFF";

    posx=120;
    posy=30;
    var spcx=60;
    var spcy=22;

    ctx3.fillStyle= "#FFFFFF";
    if(this.red/this.netFood>0.5 || this.green/this.netFood>0.5 || this.blue/this.netFood>0.5) {
      ctx3.fillStyle= "#000000";
    }
    ctx3.beginPath();
    posx=75;
    posy=40-6;
    ctx3.fillText("FOOD", posx, posy+=spcy);
    ctx3.fillText("ECHG",posx, posy+=spcy);
    ctx3.fillText("MR",posx, posy+=spcy);
    ctx3.fillText("MG",posx, posy+=spcy);
    ctx3.fillText("MB",posx, posy+=spcy);
    ctx3.fillText("MSEN",posx, posy+=spcy);
    ctx3.fillText("HLTH", posx, posy+=spcy);
    ctx3.fillText("SIZE", posx, posy+=spcy);
    ctx3.fillText("VEL", posx, posy+=spcy);
    for(var i=0; i<5; i++) {
      ctx3.fillText("E"+(i+1)+"R",posx,posy+=spcy);
      ctx3.fillText("E"+(i+1)+"G",posx,posy+=spcy);
      ctx3.fillText("E"+(i+1)+"B",posx,posy+=spcy);
      ctx3.fillText("E"+(i+1)+"SEN",posx,posy+=spcy);
    }
    display=2;
  } else if(display==3) { // FAMILY
    posx=210;
    posy=210;
    ctx4.beginPath();
    ctx4.fillStyle=rgbToHex(round(255*this.red/this.netFood),round(255*this.green/this.netFood),round(255*this.blue/this.netFood));
    ctx4.fillRect(200,200,400,200);
    ctx4.fillStyle= rgbToHex(this.cols[12],this.cols[13],this.cols[14]);
    ctx4.fillRect(200,200,10,10);
    ctx4.fillStyle= rgbToHex(this.cols[9],this.cols[10],this.cols[11]);
    ctx4.fillText("X",201,209);
    ctx4.fillStyle= "#FFFFFF";
    if(this.red/this.netFood>0.5 || this.green/this.netFood>0.5 || this.blue/this.netFood>0.5) {
      ctx4.fillStyle= "#000000";
    }
    if(this.alive==true) {
      ctx4.fillText(this.name+"-"+this.gen+"A"+this.children.length, posx, posy+=10);
    } else {
      ctx4.fillText(this.name+"-"+this.gen+"D"+this.children.length, posx, posy+=10);
    }
    ctx4.fillText("IDX: "+this.index,posx,posy+=10);
    if(this.parent!=null) {
      if(this.pidx<0) {
        ctx4.fillText("PAR: "+this.parent+"D"+graveyard[(-(this.pidx+1))].children.length,posx, posy+=10);
      }else {
        ctx4.fillText("PAR: "+this.parent+"A"+animals[this.pidx].children.length,posx, posy+=10);
      }
      if(mouseOverConsole && leftPressed) {
        if(mouseX>posx && mouseX<posx+80) {
          if(mouseY>posy-5 && mouseY<posy+5) {
            highlighted=this.pidx;
            leftPressed=false;
          }
        }
      }
    }
    posy+=10;
    for(var i=0;i<this.children.length;i++) {
      if(posy>380) {
        posx+=100;
        posy=210;
      }
      if(this.children[i]<0) {
        ctx4.fillText(graveyard[(-(this.children[i]+1))].name+"-"+graveyard[(-(this.children[i]+1))].gen+"D"+graveyard[(-(this.children[i]+1))].children.length,posx, posy+=10);
      } else {
        ctx4.fillText(animals[this.children[i]].name+"-"+animals[this.children[i]].gen+"A"+animals[this.children[i]].children.length,posx, posy+=10);
      }
      if(mouseOverConsole && leftPressed) {
        if(mouseX>posx && mouseX<posx+80) {
          if(mouseY>posy-5 && mouseY<posy+5) {
            highlighted=this.children[i];
            leftPressed=false;
          }
        }
      }
    }


    if(mouseOverConsole && leftPressed) {
      if(mouseX>200 && mouseX<210 && mouseY>200 && mouseY<210) {
        display=0;
        leftPressed=false;
      }
    }
  } else if(display==4) { // EMPTY (UNUSED!)
    posx=210;
    posy=210;
    ctx4.beginPath();
    ctx4.fillStyle=rgbToHex(round(255*this.red/this.netFood),round(255*this.green/this.netFood),round(255*this.blue/this.netFood));
    ctx4.fillRect(200,200,400,200);
    ctx4.fillStyle= rgbToHex(this.cols[12],this.cols[13],this.cols[14]);
    ctx4.fillRect(200,200,10,10);
    ctx4.fillStyle= rgbToHex(this.cols[9],this.cols[10],this.cols[11]);
    ctx4.fillText("X",201,209);
    ctx4.fillStyle= "#FFFFFF";
    if(this.red/this.netFood>0.5 || this.green/this.netFood>0.5 || this.blue/this.netFood>0.5) {
      ctx4.fillStyle= "#000000";
    }
    if(this.alive==true) {
      ctx4.fillText(this.name+"-"+this.gen+"A"+this.children.length, posx, posy+=10);
    } else {
      ctx4.fillText(this.name+"-"+this.gen+"D"+this.children.length, posx, posy+=10);
    }
    if(this.parent!=null) {
      if(this.pidx<0) {
        ctx4.fillText("PAR: "+this.parent+"D"+graveyard[(-(this.pidx+1))].children.length,posx, posy+=10);
      }else {
        ctx4.fillText("PAR: "+this.parent+"A"+animals[this.pidx].children.length,posx, posy+=10);
      }
      if(mouseOverConsole && leftPressed) {
        if(mouseX>posx && mouseX<posx+80) {
          if(mouseY>posy-5 && mouseY<posy+5) {
            highlighted=this.pidx;
            leftPressed=false;
          }
        }
      }
    }

    if(mouseOverConsole && leftPressed) {
      if(mouseX>200 && mouseX<210 && mouseY>200 && mouseY<210) {
        display=0;
        leftPressed=false;
      }
    }
  }
  //Leave display 2 separate from above else-ifs to ensure immediate dashboard display switching between profiles
  if(display==2) {
    posx=120;
    posy=30;
    var spcx=60;
    var spcy=22;

    ctx4.fillStyle= "#FFFFFF";
    if(this.red/this.netFood>0.5 || this.green/this.netFood>0.5 || this.blue/this.netFood>0.5) {
      ctx4.fillStyle= "#000000";
    }

    posx=10;
    posy=10;
    if(this.alive==true) {
      ctx4.fillText(this.name+"-"+this.gen+"A"+this.children.length, posx, posy+=10);
    } else {
      ctx4.fillText(this.name+"-"+this.gen+"D"+this.children.length, posx, posy+=10);
    }
    if(this.parent!=null) {
      if(this.pidx<0) {
        ctx4.fillText("PAR: "+this.parent+"D"+graveyard[(-(this.pidx+1))].children.length,posx, posy+=10);
      }else {
        ctx4.fillText("PAR: "+this.parent+"A"+animals[this.pidx].children.length,posx, posy+=10);
      }
      if(mouseOverConsole && leftPressed) {
        if(mouseX>posx && mouseX<posx+80) {
          if(mouseY>posy-5 && mouseY<posy+5) {
            highlighted=this.pidx;
            display=1;
            leftPressed=false;
          }
        }
      }
    }
    ctx4.fillText("NRG: "+round(100*this.energy)/100, posx, posy+=10);

    spcy=22;
    posx=530;
    posy=56;
    if(this.outputs[0]>0.2) {
      ctx4.fillText("VEL++", posx,posy);
    } else if(this.outputs[0]<-0.2) {
      ctx4.fillText("VEL--", posx,posy);
    }
    posy+=spcy;
    if(this.outputs[1]>0.2) {
      ctx4.fillText("ROT++", posx,posy);
    } else if(this.outputs[1]<-0.2) {
      ctx4.fillText("ROT--", posx,posy);
    }
    posy+=spcy;
    if(this.outputs[2]<-0.33) {
      ctx4.fillText("CARN", posx,posy);
    } else if(this.outputs[2]>=0.33){
      ctx4.fillText("HERB", posx,posy);
    }
    posy+=spcy;
    if(this.outputs[3]<-0.80) {
      ctx4.fillText("EATR--",posx,posy);
    } else if(this.outputs[3]<-0.5) {
      ctx4.fillText("EATR-",posx,posy);
    } else if(this.outputs[3]<-0.20) {
      ctx4.fillText("EATR",posx,posy);
    } else if(this.outputs[3]>=0.80) {
      ctx4.fillText("EATR++",posx,posy);
    } else if(this.outputs[3]>=0.50) {
      ctx4.fillText("EATR+",posx,posy);
    } else if(this.outputs[3]>=0.20) {
      ctx4.fillText("EATR",posx,posy);
    }
    posy+=spcy;
    if(this.outputs[4]<-0.80) {
      ctx4.fillText("EATG--",posx,posy);
    } else if(this.outputs[4]<-0.5) {
      ctx4.fillText("EATG-",posx,posy);
    } else if(this.outputs[4]<-0.20) {
      ctx4.fillText("EATG",posx,posy);
    } else if(this.outputs[4]>=0.80) {
      ctx4.fillText("EATG++",posx,posy);
    } else if(this.outputs[4]>=0.50) {
      ctx4.fillText("EATG+",posx,posy);
    } else if(this.outputs[4]>=0.20) {
      ctx4.fillText("EATG",posx,posy);
    }
    posy+=spcy;
    if(this.outputs[5]<-0.80) {
      ctx4.fillText("EATB--",posx,posy);
    } else if(this.outputs[5]<-0.5) {
      ctx4.fillText("EATB-",posx,posy);
    } else if(this.outputs[5]<-0.20) {
      ctx4.fillText("EATB",posx,posy);
    } else if(this.outputs[5]>=0.80) {
      ctx4.fillText("EATB++",posx,posy);
    } else if(this.outputs[5]>=0.50) {
      ctx4.fillText("EATB+",posx,posy);
    } else if(this.outputs[5]>=0.20) {
      ctx4.fillText("EATB",posx,posy);
    }
    posy+=spcy;

    if(this.outputs[6]>=0.33) {
      ctx4.fillText("MITO",posx,posy);
    }else if(this.outputs[6]>-0.33){
      ctx4.fillText("GROW",posx,posy);
    }
    ctx4.fillText("VDIR",posx,posy+=spcy);
    posy+=spcy;
    ctx4.fillText("MDR",posx,posy+=spcy);
    ctx4.fillText("MDS",posx,posy+=spcy);
    posy+=spcy;
    for(var i=0; i<5; i++) {
      ctx4.fillText("E"+i+"DR",posx,posy+=spcy);
      ctx4.fillText("E"+i+"DS",posx,posy+=spcy);
    }

    posx=120;
    spcx=60;
    var neu=null;
    var idx=null;

    var tN;
    posy=52;
    for(var j=0; j<BSIZE; j++) { // iterate through each neuron
      if(j==MAXBINS){
        posx=520;
        posy=52;
      } else if(j==MAXBINS+MAXBOUTS){
        posx=200;
        posy=52;
      } else if(j==MAXBINS+MAXBOUTS+16){
        posx=280;
        posy=52;
      } else if(j==MAXBINS+MAXBOUTS+32){
        posx=360;
        posy=52;
      } else if(j==MAXBINS+MAXBOUTS+48){
        posx=440;
        posy=52;
      }
      if(j<MAXBINS+MAXBOUTS){
        tN=this.brain[j];
        var oS;
        oS=tN.out;
        oS=round(255*(oS+1)/2);
        if(oS>255){
          oS=255;
        } else if(oS<0){
          oS=0;
        }
        ctx4.fillStyle=rgbToHex(oS,oS,oS);
        ctx4.beginPath();
        ctx4.arc(posx, posy, 8, 0, TWOPI);
        ctx4.fill();
        ctx4.beginPath();
        if(oS>127){
          ctx4.fillStyle="#000000";
        } else {
          ctx4.fillStyle="#FFFFFF";
        }
        if(mouseOverConsole && mouseX>posx-100 && mouseX<posx+100 && mouseY>posy-100 && mouseY<posy+100) {
          ctx4.fillText(round(100*tN.in)/100, posx-10, posy-2);
          ctx4.fillText(round(100*tN.out)/100, posx-10, posy+8);
        }
        if(mouseOverConsole && mouseX>posx-10 && mouseX<posx+10 && mouseY>posy-10 && mouseY<posy+10) {
          if(leftPressed || rightPressed) {
            neu=this.brain[j];
            idx=j;
          }
        }
      }
      posy+=spcy;
    }

    posy=60;
    if(neu!=null) { // SEE MUTATIONS
      if(leftPressed) {
        var posy2=30;
        ctx4.fillStyle="#FFFFFF";
        ctx4.fillRect(10,10,580,500);
        ctx4.fillStyle="#323232";
        ctx4.fillText("N"+idx,20,posy2);
        ctx4.fillText("$: "+round(neu.cost*1000)/1000, 20, posy2+=10);
        /*
        ctx4.fillStyle="#00AA00";
        ctx4.fillText(round(1000*this.getAdvantageousMutations(2,idx,0))/1000,80,posy2);
        ctx4.fillStyle="#AA0000";
        ctx4.fillText(round(1000*this.getDetrimentalMutations(2,idx,0))/1000,120,posy2);
        */
        ctx4.fillStyle="#323232";
        ctx4.fillText("BIAS: "+round(1000*neu.bias)/1000,20,posy2+=10);
        /*
        ctx4.fillStyle="#00AA00";
        ctx4.fillText(round(1000*this.getAdvantageousMutations(1,idx,0))/1000,90,posy2);
        ctx4.fillStyle="#AA0000";
        ctx4.fillText(round(1000*this.getDetrimentalMutations(1,idx,0))/1000,130,posy2);
        */
        ctx4.fillStyle="#323232";
        ctx4.fillText("WEIGHTS:",20,posy2+=10);
        posx=20;
        for(var i=0; i<BSIZE; i++) {
          ctx4.fillText(i+":  "+round(1000*neu.weights[i])/1000, posx, posy2+=10);
          if(i==50){
            posx=180;
            posy2=posy;
          }
        }
        posx=80;
        posy2=posy;
        ctx4.fillText("WEIGHTS2:",80,posy2);
        for(var i=0; i<BSIZE; i++) {
          ctx4.fillText(i+":  "+round(1000*neu.weights2[i])/1000, posx, posy2+=10);
          if(i==50){
            posx=240;
            posy2=posy;
          }
        }
        /*
        posx=70;
        posy2=posy;
        ctx4.fillStyle="#00AA00"; // positive direction
        for(var i=0; i<BSIZE; i++) {
          ctx4.fillText(round(1000*this.getAdvantageousMutations(0,idx,i))/1000, posx, posy2+=10);
          if(i==50){
            posx=220;
            posy2=posy;
          }
        }
        posx=120;
        posy2=posy;
        ctx4.fillStyle="#AA0000"; // negative direction
        for(var i=0; i<BSIZE; i++) {
          ctx4.fillText(round(1000*this.getDetrimentalMutations(0,idx,i))/1000,posx,posy2+=10);
          if(i==50){
            posx=270;
            posy2=posy;
          }
        }
        */
      }
    }

    if(mouseOverConsole && leftPressed && mouseX>0 && mouseX<10 && mouseY>0 && mouseY<10) {
      display=0;
      dashboard.setup();
      leftPressed=false;
    }
  }
}
