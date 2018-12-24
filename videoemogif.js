'use strict'
	class Processor{
		constructor(file_input, video_input, col_input, row_input, fps_input ,canvas_grid)
		{
		//Declare all class member variables used.
			this.file_input = document.getElementById(file_input);
			this.video_input = document.getElementById(video_input);
			this.col_input = document.getElementById(col_input);
			this.row_input = document.getElementById(row_input);
			this.canvas_grid = document.getElementById(canvas_grid);
			this.fps_input = document.getElementById(fps_input);
			this.ratio = 16/9;
			this.vWidth = undefined;
			this.vHeight = undefined;
			this.cols = parseInt(this.col_input.value);
			this.rows = undefined;
			this.vOff = undefined;
			this.cWidth = undefined;
			this.canvas_arr = [];
			this.canvas_arr_cx = [];
			this.canvas_width = 384; // TODO: Make user input-able.
			
		//End of variable list.
			let self = this;
			//File Change Listener
			this.file_input.addEventListener('change', function()
			{
				var file = self.file_input.files[0];
				var type = file.type;
			
				if(self.video_input.canPlayType(type) === "")
					return;
				self.video_input.src = URL.createObjectURL(file);
			},false);
			//Video Play Listener
			this.video_input.addEventListener('play', function()
			{
				self.timerFrameProc();
			}, false);
			//Video Can Play Listener
			this.video_input.addEventListener('canplay',function()
			{
				self.vWidth = self.video_input.videoWidth;
				self.vHeight = self.video_input.videoHeight;
				self.ratio = self.vWidth/ self.vHeight;
				self.cScale = self.canvas_width/self.vWidth;
				self.cWidth = self.vWidth/self.cols;
				self.vOffs = (self.cWidth*self.rows - self.vHeight)/2;
				self.adjustCanvasGrid();
			},false);
			//Column Input Listener
			this.col_input.addEventListener('input', function()
			{
				self.cols = parseInt(self.col_input.value);
				self.rows = Math.ceil(self.cols / self.ratio);
				self.cWidth = self.vWidth/self.cols;
				self.vOffs = (self.cWidth*self.rows - self.vHeight)/2;
				self.adjustCanvasGrid();
			},false);
		}
		timerFrameProc()
		{
			if(this.video_input.paused|| this.video_input.ended)
				return;
			let t1 = performance.now();
			this.videoCutter();
			let tOff = performance.now() - t1;
			let timeout = 1000/parseInt(this.fps_input.value) - tOff;
			let self = this;
			setTimeout(function(){self.timerFrameProc();
			}, Math.max(0,timeout));
		}
		adjustCanvasGrid()
		{
			let diff = this.cols*this.rows- this.canvas_arr.length;
			
			if(diff == 0) return;
			if(diff>0)
				this.addCanvas(diff);
			else
				this.removeCanvas(-diff);			
		}
		addCanvas(num)
		{
			for(let i = 0; i<num;i++)
			{
				let new_canvas = document.createElement("canvas");
				let new_canvas_cx = new_canvas.getContext("2d", {alpha:false});
				this.canvas_grid.appendChild(new_canvas);
				this.canvas_arr.push(new_canvas);
				this.canvas_arr_cx.push(new_canvas_cx);
				
			}
			this.adjustCSSGrid();
		}
		removeCanvas(num)
		{
			for(let i = 0; i<num;i++)
			{
				this.canvas_grid.removeChild(this.canvas_arr.pop());
				this.canvas_arr_cx.pop();
			}
			this.adjustCSSGrid();
		}
		adjustCSSGrid()
		{
			let cols = this.col_input.value
			let rows = Math.ceil(cols / this.ratio);
			let ind_size = 32;//640/cols;
			this.canvas_grid.style.gridTemplateColumns = (ind_size.toString()+"px ").repeat(cols);
			this.canvas_grid.style.gridTemplateRows = (ind_size.toString()+"px ").repeat(rows);
			for( let canvas_item of this.canvas_arr)
			{
				canvas_item.style.width = canvas_item.style.height = ind_size.toString()+"px";
				canvas_item.width = canvas_item.height = this.canvas_width;
			}
			for(let context of this.canvas_arr_cx)
			{
				context.fillStyle = "black";
				context.fillRect(0,0, this.canvas_arr[0].width,this.canvas_arr[0].height);
			}
			
		}
		videoCutter()
		{
			let sx = 0, sy = 0;
			let ccScale = this.cScale*this.cols;
			for(let i = 0; i < this.rows;i++)
			{
				let vTop = i == 0 ? this.vOffs:0;
				let vBottom = i == (this.rows-1) ? this.vOffs:0;
				let cTop = vTop*ccScale;
				let cBottom = vBottom*ccScale;
				for(let j = 0 ; j < this.cols; j++)
				{
					
					
					//ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
					//this.canvas_arr_cx[j+i*cols].scale(this.cScale,this.cScale);
					this.canvas_arr_cx[j+i*this.cols].drawImage(this.video_input,sx,sy, this.cWidth, this.cWidth - vTop - vBottom, 0, cTop, this.canvas_width, this.canvas_width - cTop -cBottom);
					sx+=this.cWidth;
				}
				sy+=this.cWidth-vTop;
				sx=0;
			}
			/*{
			this.canvas_arr_cx[0].drawImage(this.video_input,0,0, 384, 312, 0, 6, 32, 26);
			this.canvas_arr_cx[1].drawImage(this.video_input,384,0, 384, 312, 0, 6, 32, 26);
			this.canvas_arr_cx[2].drawImage(this.video_input,768,0, 384, 312, 0, 6, 32, 26);
			this.canvas_arr_cx[3].drawImage(this.video_input,1152,0, 384, 312, 0, 6, 32, 26);
			this.canvas_arr_cx[4].drawImage(this.video_input,1536,0, 384, 312, 0, 6, 32, 26);
			this.canvas_arr_cx[5].drawImage(this.video_input,0,312, 384, 384 , 0, 0, 32, 32);
			this.canvas_arr_cx[6].drawImage(this.video_input,384,312, 384, 384 , 0, 0, 32, 32);
			this.canvas_arr_cx[7].drawImage(this.video_input,768,312, 384, 384 , 0, 0, 32, 32);
			this.canvas_arr_cx[8].drawImage(this.video_input,1152,312, 384, 384 , 0, 0, 32, 32);
			this.canvas_arr_cx[9].drawImage(this.video_input,1536,312, 384, 384 , 0, 0, 32, 32);
			this.canvas_arr_cx[10].drawImage(this.video_input,0,696, 384, 312, 0, 0, 32, 26);
			this.canvas_arr_cx[11].drawImage(this.video_input,384,696, 384, 312, 0, 0, 32, 26);
			this.canvas_arr_cx[12].drawImage(this.video_input,768,696, 384, 312, 0, 0, 32, 26);
			this.canvas_arr_cx[13].drawImage(this.video_input,1152,696, 384, 312, 0, 0, 32, 26);
			this.canvas_arr_cx[14].drawImage(this.video_input,1536,696, 384, 312, 0, 0, 32, 26);
			}*/
		}
		
	}
	
	var processor = new Processor("videoin","vidplayer","colin",null,"fps","canvas-grid"); //file_input, video_input, col_input, row_input, fps_input ,canvas_grid
	//var processor2 = new Processor("videoin","vidplayer","colin2",null,"fps2","canvas-grid2"); //file_input, video_input, col_input, row_input, fps_input ,canvas_grid
	/*var processor = {
		source_vid: null,
		user_file: null,
		c1: null,
		ctx1:null,
		fetch: function(jsEvent)
		{
		console.log(jsEvent);
			var file = this.user_file.files[0];
			var type = file.type;
			
			if(this.source_vid.canPlayType(type) === "")
				return;
			this.source_vid.src = URL.createObjectURL(file);
				
			
			console.log(this + "." +this +" woop");
		},
		getFrame:function(jsEvent,parent_proc)
		{
			
			console.log(jsEvent);
			console.log("Function called by:" + this);
			console.log("paused:" + this.source_vid);
			this.ctx1.save();
			this.ctx1.scale(this.c1.width/this.source_vid.videoWidth,this.c1.height/this.source_vid.videoHeight);
			this.ctx1.drawImage(this.source_vid,0,0, this.c1.width, this.c1.height);
			this.ctx1.restore();
		},
		doLoad: function(user_file_id,video_id,canvas_id)
		{
		
			this.source_vid = document.getElementById(video_id);
			this.user_file = document.getElementById(user_file_id);
			this.c1 = document.getElementById(canvas_id);
			this.ctx1 = this.c1.getContext('2d',false);
			this.user_file.addEventListener('change', this.fetch.bind(processor));
			this.source_vid.addEventListener('pause', this.getFrame.bind(processor));
		}
	}; */
	
	//processor.doLoad('videoin','vidplayer','framecanvas');
	