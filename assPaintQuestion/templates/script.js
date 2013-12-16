function PaintTask(resumeImage){
    // Variablen
    var canvas = document.getElementById("paintCanvas");
    var textarea = document.getElementById("answerImage");
    var ctx = canvas.getContext("2d");
    var backgroundImage = textarea.value;
    // flag -> wird maustaste gedrückt?
    var flag = false;
    // vorhergehende mausposition
    var prevX = 0, prevY = 0;
    // stack funktioniert, könnte vllt. aber etwas performanter sein
    var undoRedoStack = new Array(); 
    var stackPos = -1;
    // soll durch mausemove inhalt gelöscht (true) oder gezeichnet (false) werden?
    var erase = false;
    
    function initBackground(){
		// viel zuviele daten, wird extrem langsam...
		/*if (backgroundImage.length < 1)
			return;
		var imageObj = new Image();
		imageObj.onload = function() {
			ctx.globalCompositeOperation="destination-over";
			ctx.drawImage(imageObj, 0,0);
			ctx.globalCompositeOperation="source-over";
		};
		imageObj.src = backgroundImage;
		*/
	}
	
    //**********
    //********** Funktionen 
    //**********
    
    function save(){			
		var base = canvas.toDataURL(); 
		//textarea.value = base.replace('data:image/png;base64,', "");	
		textarea.value = base;
	}	
	
    this.undo = function() {
        if (stackPos > 0) {            
            stackPos--;
            var canvasPic = undoRedoStack[stackPos];
            ctx.putImageData(canvasPic, 0, 0);             
            save();
        }            
    }

    this.redo = function() {
        if (stackPos < undoRedoStack.length-1) {
            stackPos++;
            var canvasPic = undoRedoStack[stackPos];
            ctx.putImageData(canvasPic, 0, 0); 
            save();
        }
    }

    function pushDrawAction() {
        // erzeuge neues bild nach letzter zeichenaktion
        // und halte es im stack      
        stackPos++;
        if (stackPos < undoRedoStack.length){
            undoRedoStack.length = stackPos;
        }
        undoRedoStack.push(ctx.getImageData(0,0,ctx.canvas.width,ctx.canvas.height));   
        save();
    }

    this.clear = function() {
        // lösche den gesamten inhalt, hintergrundbild wird wieder vollständig angezeigt
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
        initBackground();
        pushDrawAction();
    }

    this.erasePaint = function(button){
        // der radiergummie ;)
        // button ist das object, welches diese funktion aufruft    
        if (button.value == "paint"){
            button.value = "erase";
            erase = true;
        } else{
            button.value = "paint";
            erase = false;
        }
    }  
    
    function getMousePos(e) {
        // liefert mausposition passend zum canvas
        // wichtig vorallem dann, wenn canvas in einem div steht,
        // welches kleiner ist als das canvas
        var rect = canvas.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }

    function draw(mousePos) {
        // zeichnen?
        if (!erase){
            ctx.beginPath();
            ctx.strokeStyle = document.getElementById("selColor").value;
            ctx.lineWidth = document.getElementById("selWidth").value;
            ctx.lineJoin = "round";
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(mousePos.x, mousePos.y);
            ctx.closePath();
            ctx.stroke();
        } else{
            // löschen?
            var breite = document.getElementById("selWidth").value * 1 + 3;            
            ctx.clearRect(prevX-Math.round(breite/2), prevY-Math.round(breite/2), breite, breite);
            initBackground();
        }
        prevX = mousePos.x;
        prevY = mousePos.y;
    }

    function mouseMove(e){
        // wenn mousedown, dann zeichnen (oder löschen)
        if (flag){                
            draw(getMousePos(e));
        }            
    }

    function mouseDown(e){        
        flag = true;
        // setzte startpunkt auf aktuelle mauskoordinaten
        var mousePos = getMousePos(e);
        prevX = mousePos.x;
        prevY = mousePos.y;        
    }

    function mouseUp(e){
        flag = false;
        // lege nach jeder zeichenaktion ein neues bild im undoRedoStack ab
        pushDrawAction();
    }

    function mouseOut(e){
        // stoppe alle zeichnenaktionen
        if (flag){
            // wurde vor verlassen gezeichnet, dann erzeuge bild
            pushDrawAction();
        }
        flag = false;        
    }

    //**********
    //********** EventListener
    //**********
    
    canvas.oncontextmenu = function() {
        // unterdrücke Kontextmenu vom canvas
        return false;  
    } 
    canvas.addEventListener("mousemove", function (e) {
        mouseMove(e);        
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        mouseDown(e);
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        mouseUp(e);
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        mouseOut(e);
    }, false);

    //**********
    //********** weitere initialisierung
    //**********
    //pushDrawAction();        
    
	function resume(){
		if (resumeImage){
			var img = new Image;
			img.src = resumeImage;
			//img.onload = function(){
				// zeichne abgabe
				ctx.drawImage(img,0,0); 
			//};
			img.src = resumeImage;
			//alert(resumeImage);
			pushDrawAction(); 
			save();
		}
	}
	
	window.onload = function()
	{
		// ist beides nötig, da sonst nicht immer 
		// die gemachten zeichnungen dagestellt werden...
		resume();
		setTimeout(resume,500);
	}
    
    initBackground();
    pushDrawAction(); 
}
