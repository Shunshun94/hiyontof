var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};
com.hiyoko.tofclient.Map = function(tof, interval, options){
	var isDrag = options.isDraggable ? true : false;
	var debugMode = options.debug;
	var $html = options.html ? options.html : $("#tofChat-map");
	var id = $html.attr('id');
	
	var $disp = $("#" + id + "-display");
	var $reset = $("#" + id + "-reset");
	var $reload = $("#" + id + "-re  load");
	var $update = $("#" + id + "-lastupdate");
	var $switchChar = $("#" + id + "-char-switch");
	var $switchLine = $("#" + id + "-line-switch");

	//var mapWriter = new com.hiyoko.tofclient.Map.MapWriter(id, tof, isDrag, debugMode);
	
	var map = new com.hiyoko.tofclient.Map.MapBack($disp);
	com.hiyoko.tofclient.Map.tofUrl = tof.getStatus().url;

	function isActive() {
		return $html.css('display') !== 'none';
	}
	
	function getMap(callback) {
		tof.getRefresh(callback, true, true);
	};
	
	function getCharacters(callback) {
		tof.getRefresh(callback, true);
	};
	
	this.init = function(){

		$reload.click(function(e){
			getCharacters(map.update);
			//mapWriter.rewriteCharacters();
		});
		$disp.on("moveCharacter", function(e){
			e.obj.move(e.x, e.y);
		});
		$switchChar.click(function(e){
			map.toggleName();
		});
		
		$switchLine.click(function(e){
			map.toggleLine();
		});
		
		$reset.click(function(e){
			getMap(map.updateAll);
		});
		
		if(interval){
			window.setInterval(function(){
				if(isActive()){
					$reload.click();
				}
			}, interval);
		}
		
		// 少し時間をおいてロードしないと横幅がうまくとれない
		window.setTimeout(function(){
			try{
				$reset.click();
			} catch(e) {
				alert(e);
			}
		}, 100);
	};

	this.init();

};

com.hiyoko.tofclient.Map.MapWriter = function(id, tof, opt_dragMode, opt_debugMode){
	var isDrag = opt_dragMode ? true : false;
	var debugMode = opt_debugMode;
	var tofUrl = tof.getStatus().url;
	var self = this;
	
	// $(window).width() - 30 = $disp().parent().parent().width() (means $disp.width()) 
	// Because of unknown reason, $disp().parent().parent().width() couldn't be get from Safari.
	var boxSize = Math.floor(($(window).width() - 30)  / (20)) - 1;
	var $status = $("#" + id + "-status");
	var $update = $("#" + id + "-lastupdate");
	var $disp = $("#" + id + "-display");
	
	var debugLog = debugMode ? function(str){alert(str)} : function(str){};
	
	this.toggleName = function() {
		
	};
	
	this.toggleLine = function() {
		var $box = $('.' + id + '-box');
		if($box.hasClass(id + '-box-lined')) {
			$('.' + id + '-box').removeClass(id + '-box-lined');
			$('.' + id + '-box').css('width', ((Number($('.' + id + '-box').css('width').replace('px','')) + 2)+'px'));
			$('.' + id + '-box').css('height', ((Number($('.' + id + '-box').css('height').replace('px','')) + 2)+'px'));
		} else {
			$('.' + id + '-box').addClass(id + '-box-lined');
			$('.' + id + '-box').css('width', ((Number($('.' + id + '-box').css('width').replace('px','')) - 2)+'px'));
			$('.' + id + '-box').css('height', ((Number($('.' + id + '-box').css('height').replace('px','')) - 2)+'px'));
		}		
	}
	
	this.displaySwitch = function(){
		this.toggleName();
		this.toggleLine();
	};

	this.rewriteMap = function(){
		tof.getRefresh(rewriteMapAll_,true, true);
	};

	this.rewriteCharacters = function(){
		tof.getRefresh(rerendCharacters_,true);
	};

	function parseUrl(picUrl){
		if(startsWith(picUrl, "http")){
			return picUrl;
		}
		if(startsWith(picUrl, "../") || startsWith(picUrl, "/")){
			return tofUrl.replace("DodontoFServer.rb?", picUrl);				
		}
		if(startsWith(picUrl, "./")){
			return tofUrl.replace("DodontoFServer.rb?", picUrl.substring(1));		
		}
		return tofUrl.replace("DodontoFServer.rb?", "/" + picUrl);
	}

	function rewriteMapAll_(result){
		try{		
			var urlParser = com.hiyoko.tofclient.Map.getPicUrl;
			var chars = result.characters;
			boxSize = Math.floor(($(window).width() - 30)  / (result.mapData.xMax)) - 1;
			clearMap();
			drawMap(result);
	
	
			$("." + id + "-box").css("width", boxSize + "px");
			$("." + id + "-box").css("height", boxSize + "px");
	
			rendCharacters(chars, boxSize);
		} catch (e) {
			alert("ERROR @Shunshun94 にこの文字列 (ないし画面) を送ってください\n" + e.stack);
		}
	}

	function clearMap(){
		$disp.empty();
	}

	function drawMap(data){
		var mapData = data.mapData;
		var backgroundColors = mapData.mapMarks;
		var $map = $("<div id='" + id + "-map'></div>");

		rendFloorTiles(data.characters, $map);
		if(backgroundColors && backgroundColors.length !== 0){
			$.each(backgroundColors, function(ia, boxs){
				var $tr = $("<div class='" + id + "-line'></div>");
				$.each(boxs, function(ib, box){
					var $sq = $("<div class='" + id + "-box'></div>");
					$sq.css("background-color", intToColor(box));
					$tr.append($sq);
				});
				$map.append($tr);
			});
		} else {
			for(var i = 0; i < mapData.yMax; i++) {
				var $tr = $("<div class='" + id + "-line'></div>");
				for(var j = 0; j < mapData.xMax; j++) {
					var $sq = $("<div class='" + id + "-box'></div>");
					$tr.append($sq);					
				}
				$map.append($tr);
			}
		}
		$disp.append($map);
		$("." + id + "-box").css("opacity", mapData.mapMarksAlpha);
		$("#" + id + "-map").css("background-image",
				"url('" + parseUrl(mapData.imageSource) + "')");
	}

	function clearCharacters(){
		$("." + id + "-char").remove();
	}

	function rerendCharacters_(result){
		clearCharacters();
		rendCharacters(result.characters);
	};

	function rendFloorTiles(tiles, opt_parent, opt_size) {
		var $tag = opt_parent ? opt_parent : $("#" + id + "-map");
		var size = opt_size ? opt_size : boxSize;
		$.each(tiles, function(ind, tile){
			if(tile.type === "floorTile"){
				$tag.append(rendTile(tile, size));
			}
		});
	}

	function rendTile(tile, opt_size){
		var size = opt_size || boxSize;
		var $tile = $("<div class='" + id + "-tile'></div>");
		$tile.css("position", "absolute");
		$tile.css("width", (tile.width * (size) - 2) + "px");
		$tile.css("height", (tile.height * (size) - 2) + "px");

		$tile.css("top", (1 + tile.y * (size)) + "px");
		$tile.css("left", (1 + tile.x * (size)) + "px");
		$tile.css("background-image",
				"url('" + parseUrl(tile.imageUrl, tofUrl) + "')");
		return $tile;
	};

	function rendCharacters(chars, opt_size){
		var size = opt_size ? opt_size : boxSize;
		var charList = {};
		$.each(chars, function(ind, char){
			if(char.type === "characterData"){
				charList[char.name] = tof.generateCharacterFromResult(char);
				charList[char.name].x = char.x;
				charList[char.name].y = char.y;
				charList[char.name].elem = rendCharacter(char, size);
				$("#" + id + "-map").append(charList[char.name].elem);
			}
		});

		if(isDrag){
			$("." + id + "-char").pep({
				constrainTo: 'parent',
				shouldEase: false,
				start: function(ev, obj){
					$status.text(this.$el.text());
				},
				stop: function(ev, obj){
					$status.text("");
					if(this.$el.hasClass(id + "-char-pop-triger")){
						this.$el.removeClass(id + "-char-pop-triger");
						return;
					}
					var $tag = this.$el;
					var pos = $tag.position();
					var half = size / 2;
					var posY = Math.floor((half + pos.top)  / (size));
					var posX = Math.floor((half + pos.left) / (size));
					var event = new $.Event("moveCharacter",
							{obj:charList[this.$el.text()],
							 x: posX, y: posY});
					$tag.trigger(event);
					$tag.removeClass(id + "-char-pop");
					placeCharacter(posX, posY, $tag, size);
					charList[$tag.text()].x = posX;
					charList[$tag.text()].y = posY;
					closeSamePlaceCharacters(charList);
				}
			});
			$("." + id + "-char").mousedown(function(e){
				var samePlaceList = [];
				var target = charList[$(e.target).text()];
				var x = target.x;
				var y = target.y;
				for(key in charList) {
					if(charList[key].x === x && charList[key].y === y){
						samePlaceList.push(charList[key]);
					}
				}
				if(samePlaceList.length === 1 || $(e.target).hasClass(id + "-char-pop")){
					return;
				}
				$(e.target).addClass(id + "-char-pop-triger");
				openSamePlaceCharacters(samePlaceList);
			});
		}
		
		var now = new Date();
		$update.text('Map Last Update： ' + now.getHours() + '：' + now.getMinutes() + '：' + now.getSeconds());
	}
	
	function placeCharacter(x, y, $tag, opt_scale){
		var size = opt_scale || boxSize;
		var realX = (1 + x * (size)) - Number($tag.css("left").replace("px", ""));
		var realY = (1 + y * (size)) - Number($tag.css("top").replace("px", ""));
		
		$tag.css("transform", "matrix(1, 0, 0, 1," + realX + "," + realY +")");
	}
	
	function openSamePlaceCharacters(charList){
		$.each(charList, function(i, char){
			char.elem.addClass(id + "-char-pop");
			placeCharacter(char.x, char.y + i, char.elem);
		});
	}
	
	function closeSamePlaceCharacters(charList){
		$.each($("." + id + "-char-pop"),function(i, elem){
			var $elem = $(elem);
			var char = charList[$elem.text()];
			$elem.removeClass(id + "-char-pop");
			placeCharacter(char.x, char.y, $elem);
		});
	}
	
	function rendCharacter(char, opt_size){
		var size = opt_size || boxSize;
		var $char = $("<div class='" + id + "-char'></div>");
		var $name = $("<div class='" + id + "-char-name' style='height:"+(char.size * (size) - 2)+"px'></div>");
		$name.text(char.name);
		
		$char.css("width", (char.size * (size) - 2) + "px");
		$char.css("height", (char.size * (size) - 2) + "px");

		$char.css("top", (1 + char.y * (size)) + "px");
		$char.css("left", (1 + char.x * (size)) + "px");
		$char.css("background-image",
				"url('" + parseUrl(char.imageName, tofUrl) + "')");
		$char.append($name);
		return $char;
	}
};

com.hiyoko.tofclient.Map.MapBack = function($base) {
	var parseUrl = com.hiyoko.tofclient.Map.parseUrl;
	var id = $base.attr('id');
	var self = this;
	
	var boxSize = 0;
	
	var tiles = [];
	
	this.updateAll = function(info) {
		var chars = info.characters;
		
		boxSize = Math.floor(($(window).width() - 30)  / (info.mapData.xMax)) - 1;
		clearMap();
		
		drawMap(info.mapData);
		drawTile(chars);
		self.update(info);
	};
	
	this.update = function(info) {
		drawCharacters(info.characters);
		drawDiceSymbols(info.characters);
	};
	
	this.toggleName = function() {
		$('.' + id + '-char-name').toggle();
	};
	
	this.toggleLine = function() {
		var $box = $('.' + id + '-box');
		if($box.hasClass(id + '-box-lined')) {
			$('.' + id + '-box').removeClass(id + '-box-lined');
			$('.' + id + '-box').css('width', ((Number($('.' + id + '-box').css('width').replace('px','')) + 2)+'px'));
			$('.' + id + '-box').css('height', ((Number($('.' + id + '-box').css('height').replace('px','')) + 2)+'px'));
		} else {
			$('.' + id + '-box').addClass(id + '-box-lined');
			$('.' + id + '-box').css('width', ((Number($('.' + id + '-box').css('width').replace('px','')) - 2)+'px'));
			$('.' + id + '-box').css('height', ((Number($('.' + id + '-box').css('height').replace('px','')) - 2)+'px'));
		}	
	};
	
	function clearMap() {
		$base.empty();
	}
	
	function drawCharacters(cData) {
		$.each(cData, function(ind, char){
			if(char.type === "characterData"){
				var newCharacter = new com.hiyoko.tofclient.Map.Character(char, boxSize, id);
				$base.append(newCharacter.$elem);
			}
		});
	}
	
	function drawDiceSymbols(cData) {}
	
	function drawMapMakers(cData) {}
	
	function drawTile(cData) {
		$.each(cData, function(ind, tile){
			if(tile.type === "floorTile"){
				var newTile = new com.hiyoko.tofclient.Map.FloorTile(tile, boxSize, id);
				$base.append(newTile.$elem);
			}
		});
	}
	
	function drawMap(mapData){
		var backgroundColors = mapData.mapMarks;
		var $map = $("<div id='" + id + "-map'></div>");

		//rendFloorTiles(data.characters, $map);
		if(backgroundColors && backgroundColors.length !== 0){
			$.each(backgroundColors, function(ia, boxs){
				var $tr = $("<div class='" + id + "-line'></div>");
				$.each(boxs, function(ib, box){
					var $sq = $("<div class='" + id + "-box'></div>");
					$sq.css("background-color", intToColor(box));
					$tr.append($sq);
				});
				$map.append($tr);
			});
		} else {
			for(var i = 0; i < mapData.yMax; i++) {
				var $tr = $("<div class='" + id + "-line'></div>");
				for(var j = 0; j < mapData.xMax; j++) {
					var $sq = $("<div class='" + id + "-box'></div>");
					$tr.append($sq);					
				}
				$map.append($tr);
			}
		}
		$base.append($map);
		$("." + id + "-box").css("opacity", mapData.mapMarksAlpha);
		$("." + id + "-box").css("width", boxSize + "px");
		$("." + id + "-box").css("height", boxSize + "px");
		$("#" + id + "-map").css("background-image",
				"url('" + parseUrl(mapData.imageSource) + "')");
	}
};

com.hiyoko.tofclient.Map.FloorTile = function(tile, size, parentId) {
	var parseUrl = com.hiyoko.tofclient.Map.parseUrl;
	var self = this;
	this.$elem = $("<div class='" + parentId + "-tile'></div>");
	
	function rend(){
		self.$elem.css({
			"position": "absolute",
			"width": (tile.width * (size) - 2) + "px",
			"height": (tile.height * (size) - 2) + "px",
			"top": (1 + tile.y * (size)) + "px",
			"left": (1 + tile.x * (size)) + "px",
			"background-image":
				"url('" + parseUrl(tile.imageUrl) + "')"		
		});
	};
	rend();	
};

com.hiyoko.tofclient.Map.Character = function(char, boxsize, parentId) {
	this.$elem = $("<div class='" + parentId + "-char'></div>");
	var self = this;
	var parseUrl = com.hiyoko.tofclient.Map.parseUrl;
	var name = char.name;
	var image = parseUrl(char.imageName);
	var size = char.size;
	var position = {
			x: char.x,
			y: char.y
	};
	
	function rend() {
		var $name = $("<div class='" + parentId + "-char-name' style='height:"+(size * (boxsize) - 2)+"px'></div>");
		$name.text(char.name);
		
		self.$elem.css("width", (size * (boxsize) - 2) + "px");
		self.$elem.css("height", (size * (boxsize) - 2) + "px");

		self.$elem.css("top", (1 + position.y * (boxsize)) + "px");
		self.$elem.css("left", (1 + position.x * (boxsize)) + "px");
		self.$elem.css("background-image", "url('" + image + "')");
		self.$elem.append($name);
	};
	rend();
};

com.hiyoko.tofclient.Map.MapMask = function($map, tile) {};

com.hiyoko.tofclient.Map.DiceSymbol = function($map, tile) {};

com.hiyoko.tofclient.Map.parseUrl = function(picUrl){
	if(startsWith(picUrl, "http")){
		return picUrl;
	}
	if(startsWith(picUrl, "../") || startsWith(picUrl, "/")){
		return com.hiyoko.tofclient.Map.tofUrl.replace("DodontoFServer.rb?", picUrl);				
	}
	if(startsWith(picUrl, "./")){
		return com.hiyoko.tofclient.Map.tofUrl.replace("DodontoFServer.rb?", picUrl.substring(1));		
	}
	return com.hiyoko.tofclient.Map.tofUrl.replace("DodontoFServer.rb?", "/" + picUrl);
};
