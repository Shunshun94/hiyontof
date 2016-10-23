var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};
com.hiyoko.tofclient.Map = function(tof, interval, serverInfo, options){
	var isDrag = options.isDraggable ? true : false;
	var debugMode = options.debug;
	var $html = options.html ? options.html : $("#tofChat-map");
	var id = $html.attr('id');
	
	var $disp = $("#" + id + "-display");
	var $reset = $("#" + id + "-reset");
	var $reload = $("#" + id + "-reload");
	var $update = $("#" + id + "-lastupdate");
	var $switchChar = $("#" + id + "-char-switch");
	var $switchLine = $("#" + id + "-line-switch");
	var $status = $('#' + id + '-status');
	
	var $mode = $('#' + id + '-mode');
	var $cards = $('#' + id + '-cards');
	var $map = $('#' + id + '-map');

	var map = new com.hiyoko.tofclient.Map.MapBack($disp);
	var card = new com.hiyoko.tofclient.Map.Cards($cards, serverInfo.cardInfos, tof.getStatus().url);
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

		$mode.change(function(e){
			if($mode.val() === 'map') {
				$cards.hide();
				$map.show();
			} else {
				$cards.show();
				$map.hide();			
			}
		});
		
		$reload.click(function(e){
			getCharacters(function(r){
				map.update(r);
				card.update(r);
			});
		});
		
		$disp.on('startMoveCharacter', function(e){
			$status.text(e.name);
		});
		
		$disp.on("endMoveCharacter", function(e){
			tof.moveCharacter(e.name, e.x, e.y);
			$status.text('');
		});
		
		$disp.on('updateEvent', function(e){
			var now = new Date();
			$update.text('Map Last Update： ' + now.getHours() + '：' + now.getMinutes() + '：' + now.getSeconds());
		});
		
		$disp.click(function(e){
			alert('disp clicked');
			var $dom = $(e.target);
			console.log($dom.attr('class'));
			if($dom.hasClass(id + "-display-card") && $dom.text()) {
				alert($dom.text());
			}
		});
		
		$switchChar.click(function(e){
			map.toggleName();
		});
		
		$switchLine.click(function(e){
			map.toggleLine();
		});
		
		$reset.click(function(e){
			getMap(function(r){
				map.updateAll(r);
				card.update(r);
			});
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

com.hiyoko.tofclient.Map.MapBack = function($base) {
	var parseUrl = com.hiyoko.tof.parseResourceUrl;
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
		drawMapMasks(info.characters);
		drawMapMakers(info.characters);
		drawCards(info.characters);
		drawCharacters(info.characters);
		drawDiceSymbols(info.characters);
		drawChits(info.characters);
		
		$base.trigger(new $.Event('updateEvent'));
	};
	
	this.toggleName = function() {
		$('.' + id + '-object-name').toggle();
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
		var chars = {};
		$('.' + id + '-char').remove();
		$.each(cData, function(ind, char){
			if(char.type === "characterData"){
				var newCharacter = new com.hiyoko.tofclient.Map.Character(char, boxSize, id);
				chars[newCharacter.name] = newCharacter;
				$base.append(newCharacter.$elem);
			}
		});
		$('.' + id + '-char').pep({
			constrainTo: 'parent',
			shouldEase: false,
			start: function(ev, obj){
				var name = this.$el.text();
				$base.trigger(new $.Event("startMoveCharacter", {name: name}));
			},
			stop: function(ev, obj){
				chars[this.$el.text()].fixPosition();
			}
		});
	}
	
	function drawChits(cData) {
		$('.' + id + '-chit').remove();
		$.each(cData, function(ind, chit){
			if(chit.type === "chit"){
				var newChit = new com.hiyoko.tofclient.Map.Chit(chit, boxSize, id);
				$base.append(newChit.$elem);
			}
		});
	}
	
	function drawCards(cData) {
		$('.' + id + '-card').remove();
		$.each(cData, function(ind, card){
			if(card.type === "Card"){
				var newCard = new com.hiyoko.tofclient.Map.Card(card, boxSize, id);
				$base.append(newCard.$elem);
			}
		});
	}
	
	function drawDiceSymbols(cData) {
		$('.' + id + '-dice').remove();
		$.each(cData, function(ind, dice){
			if(dice.type === "diceSymbol"){
				var newDice = new com.hiyoko.tofclient.Map.DiceSymbol(dice, boxSize, id);
				$base.append(newDice.$elem);
			}
		});
	}
	
	function drawMapMakers(cData) {
		$('.' + id + '-marker').remove();
		$.each(cData, function(ind, tile){
			if(tile.type === "mapMarker"){
				var newMarker = new com.hiyoko.tofclient.Map.MapMarker(tile, boxSize, id);
				$base.append(newMarker.$elem);
			}
		});
	}
	
	function drawMapMasks(cData) {
		$('.' + id + '-mask').remove();
		$.each(cData, function(ind, tile){
			if(tile.type === "mapMask"){
				var newMask = new com.hiyoko.tofclient.Map.MapMask(tile, boxSize, id);
				$base.append(newMask.$elem);
			}
		});
	}
	
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
				"url('" + parseUrl(mapData.imageSource, com.hiyoko.tofclient.Map.tofUrl) + "')");
	}
};

com.hiyoko.tofclient.Map.Chit = function(chit, size, parentId) {
	var parseUrl = com.hiyoko.tof.parseResourceUrl;
	var self = this;
	this.$elem = $("<div class='" + parentId + "-chit'></div>");
	
	function rend(){
		self.$elem.css({
			"position": "absolute",
			"width": (chit.width * (size) - 8) + "px",
			"height": (chit.height * (size) - 8) + "px",
			"top": (1 + chit.y * (size)) + "px",
			"left": (1 + chit.x * (size)) + "px",
			"background-image":
				"url('" + parseUrl(chit.imageUrl, com.hiyoko.tofclient.Map.tofUrl) + "')"		
		});
		
		var $name = $("<div class='" + parentId + "-object-name' style='height:"+(chit.height * (size) - 8)+"px'></div>");
		$name.text(chit.info);
		self.$elem.append($name);
	};
	rend();	
};

com.hiyoko.tofclient.Map.MapMarker = function(marker, size, parentId) {
	var self = this;
	this.$elem = $("<div class='" + parentId + "-marker'></div>");
	
	function rend(){
		self.$elem.css({
			"position": "absolute",
			"width": (marker.width * (size) - 8) + "px",
			"height": (marker.height * (size) - 8) + "px",
			"top": (1 + marker.y * (size)) + "px",
			"left": (1 + marker.x * (size)) + "px",
			"border": 'solid 3px ' + intToColor(marker.color)
		});

		if(marker.isPaint) {
			self.$elem.css('background-color', intToColor(marker.color));
		}

		var $name = $("<div class='" + parentId + "-object-name' style='height:"+(marker.height * (size) - 8)+"px'></div>");
		$name.text(marker.message);
		self.$elem.append($name);
	};
	rend();
};

com.hiyoko.tofclient.Map.MapMask = function(mask, size, parentId) {
	var self = this;
	this.$elem = $("<div class='" + parentId + "-mask'></div>");
	
	function rend(){
		self.$elem.css({
			"position": "absolute",
			"width": (mask.width * (size) - 2) + "px",
			"height": (mask.height * (size) - 2) + "px",
			"top": (1 + mask.y * (size)) + "px",
			"left": (1 + mask.x * (size)) + "px",
			"background-color": intToColor(mask.color),
			"opacity": mask.alpha
		});
		var $name = $("<div class='" + parentId + "-object-name' style='height:"+(mask.height * (size) - 2)+"px'></div>");
		$name.text(mask.name);
		self.$elem.append($name);
	};
	rend();	
};

com.hiyoko.tofclient.Map.FloorTile = function(tile, size, parentId) {
	var parseUrl = com.hiyoko.tof.parseResourceUrl;
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
				"url('" + parseUrl(tile.imageUrl, com.hiyoko.tofclient.Map.tofUrl) + "')"		
		});
	};
	rend();	
};

com.hiyoko.tofclient.Map.Card = function(card, size, parentId) {
	this.$elem = $("<div class='" + parentId + "-card'></div>");
	var self = this;
	var parseUrl = com.hiyoko.tof.parseResourceUrl;
	
	var position = {
			x: Math.floor(card.x/50),
			y: Math.floor(card.y/50)
	};
	
	var isNormalSize = Boolean(card.mountName.indexOf('1x1') === -1);
	
	var cardSize = isNormalSize ? {
		w:2,h:3
	} : {
		w:1,h:1
	};
	
	function rend() {
		self.$elem.css({
			"position": "absolute",
			"width": (cardSize.w * (size) - 4) + "px",
			"height": (cardSize.h * (size) - 4) + "px",
			"top": (1 + position.y * (size)) + "px",
			"left": (1 + position.x * (size)) + "px",
			"border": "1px solid black",
			"border-radius": "2px",
			"opacity": "0.8",
			"background-color": "white"
		});
		var $name = $("<div class='" + parentId + "-object-name " + parentId + "-card' style='height:"+(cardSize.h * (size) - 4)+"px'></div>");
		var name = card.imageName.split('\t')[0];
		
		if(card.isText){
			if(card.isOpen) {
				if(card.isUpDown) {
					$name.html((Boolean(card.rotation) ? '(逆)' : '(正)') + name.replace(/<br>/gi, '').replace(/<[^>]*>/g, ''));
				} else {
					var execResult = /FONT SIZE="42">([^<]*)<\/FONT>/.exec(name);
					if(execResult) {
						$name.text(execResult[1]);
					} else {
						$name.html(name.replace(/<br>/gi, '###BR###').replace(/■■■■/g, '■■').replace(/<[^>]*>/g, '').replace(/###BR###/g, '<br/>'));
					}
				}
			} else {
				$name.text('非公開');
			}
		} else {
			if(card.mountName.startsWith('trump') || card.mountName === 'randomDungeonTrump') {
				if(card.isOpen){
					$name.text(card.imageName.split('\t')[1]);
				} else {
					$name.text('非公開');
				}
			} else {
				$name = '';
				if(card.isOpen){
					self.$elem.css("background-image",
						"url('" + parseUrl(name, com.hiyoko.tofclient.Map.tofUrl) + "')");
				} else {
					self.$elem.css("background-image",
						"url('" + parseUrl(card.imageNameBack, com.hiyoko.tofclient.Map.tofUrl) + "')");
				}
			}
		}
		self.$elem.append($name);
		
	};
	rend();
}

com.hiyoko.tofclient.Map.Character = function(char, boxsize, parentId) {
	this.$elem = $("<div class='" + parentId + "-char'></div>");
	var self = this;
	var parseUrl = com.hiyoko.tof.parseResourceUrl;
	this.name = char.name;
	this.image = parseUrl(char.imageName, com.hiyoko.tofclient.Map.tofUrl);
	this.size = char.size;
	var position = {
			x: char.x,
			y: char.y
	};
	
	function rend() {
		var $name = $("<div class='" + parentId + "-object-name' style='height:"+(self.size * (boxsize) - 2)+"px'></div>");
		$name.text(char.name);
		
		self.$elem.css("width", (self.size * (boxsize) - 2) + "px");
		self.$elem.css("height", (self.size * (boxsize) - 2) + "px");

		self.$elem.css("top", (1 + position.y * (boxsize)) + "px");
		self.$elem.css("left", (1 + position.x * (boxsize)) + "px");
		self.$elem.css("background-image", "url('" + self.image + "')");
		self.$elem.append($name);
	};
	
	this.fixPosition = function() {
		var pos = self.$elem.position();
		var half = boxsize / 2;
		var posY = Math.floor((half + pos.top)  / (boxsize));
		var posX = Math.floor((half + pos.left) / (boxsize));
		var event = new $.Event("endMoveCharacter",
				{name: self.name,
				 x: posX, y: posY});
		self.$elem.trigger(event);
	
		self.position = {x:posX, y:posY};
		placeCharacter(posX, posY);
	};
	
	function placeCharacter(x, y){
		var realX = (1 + x * (boxsize)) - Number(self.$elem.css("left").replace("px", ""));
		var realY = (1 + y * (boxsize)) - Number(self.$elem.css("top").replace("px", ""));
		
		self.$elem.css("transform", "matrix(1, 0, 0, 1," + realX + "," + realY +")");
	}

	rend();
};

com.hiyoko.tofclient.Map.DiceSymbol = function(dice, size, parentId) {	
	var self = this;
	this.$elem = $("<div class='" + parentId + "-dice'></div>");
	
	function rend(){
		self.$elem.css({
			"position": "absolute",
			"width": (size - 10) + "px",
			"height": (size - 10) + "px",
			"top": (1 + dice.y * (size)) + "px",
			"left": (1 + dice.x * (size)) + "px",
			'border': 'outset 4px black',
			'border-radius': '1ex',
			"background-color": 'white',
			'color': 'black',
			'text-align': 'center'
 		});
		self.$elem.text(dice.owner ? '？' : dice.number);

		self.$elem.click(function(e) {
			alert('ダイスシンボル' +
					'\n持ち主：' + dice.ownerName +
					'\n出目：' + (dice.owner ? '非公開' : dice.number) +
					'\nダイス：' + dice.maxNumber + '面体');
		});
	};
	rend();	
};

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
