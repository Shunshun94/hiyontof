var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.HiyoLogger = com.hiyoko.HiyoLogger || function(){
	this.log = function(msg){};
};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};
com.hiyoko.tofclient.Table = function(tof, interval, options){
	var $html = options.html ? options.html : $("#tofChat-table");
	var id = $html.attr('id');
	
	var debug = options.debug ? true : false;
	
	var logger = new com.hiyoko.HiyoLogger(debug, debug);
	var $disp = $("#tofChat-table-display");
	var $read = $("#tofChat-table-reload");
	var $update = $("#tofChat-table-lastupdate");

	var chars = [];
	
	function isActive() {
		return $html.css('display') !== 'none';
	}
	
	this.generateServerImageButton = function() {
		var url = com.hiyoko.tof.getImageJsonUrl(tof.getStatus().url);
		if(! Boolean(url)) {
			return '';
		}
		
		return '<span class="' + $html.attr('id') + '-display-serverImageButton">画像変更</span>' +
				'<div class="' + $html.attr('id') + '-display-serverImageList"></div>';
	};
	
	
	var outerImage = options.outerImage;
	var serverImageButton = this.generateServerImageButton();
	
	this.getValuesAsync = function(opt_callback) {
		tof.getRefresh(function(result){rend(result.characters, function(){
			var result = {};
			
			$.each(chars, function(i, c) {
				result[c.getName()] = c;
			});
			
			if(opt_callback) {
				opt_callback(result);
			} else {
				console.log(result);
			}
		})}, true);
	};
	
	this.init = function(){
		$read.click(function(e){
			tof.getRefresh(function(result){rend(result.characters)}, true);
		});
		if(interval){
			window.setInterval(function(){
				if((! isActive()) ||
					$(document.activeElement).is('#tofChat-table-display input') ||
					$(document.activeElement).is('#tofChat-table-display textarea') ||
					$('.tofChat-table-display-serverImageList').filter(function(i, dom){
						return $(dom).css('display') === 'block'
					}).length ||
					$('.' + id + '-display-serverImageUpload-selectpic').filter(function(i, dom){
						return $(dom).prop('files')[0];
					}).length ) {
					return;
				}
				$read.click();
			}, interval);
		}
		$disp.on(com.hiyoko.tof.ImageUploader.Events.REQUEST, function(e) {
			tof.uploadPicture(e.resolve, e.reject, e);
		});
		$disp.on(com.hiyoko.tof.ImageUploader.Events.DONE, function(e) {
			alert('画像の変更に成功しました。');
			$(e.target).trigger(new $.Event(com.hiyoko.tofclient.Table.ImageChangeRequestFromChild, {url: e.fileName}));
		});
		$disp.on(com.hiyoko.tof.ImageUploader.Events.NO_PATH, function(e) {
			alert('画像のアップロードを試みました。\nタグとして ' + e.params.tags + ' が付与されています。\n他ユーザに画像の確認と設定を依頼してください\n\n' +
					'もしされていなかったら?\n画像のサイズが大きすぎるかもしれません。小さくリサイズしてやり直してください。');
			$read.click();
		});
		$disp.on(com.hiyoko.tof.ImageUploader.Events.FAIL, function(e) {
			alert(e.message);
		});
		// 少し時間をおいてロードしないと先頭項目のチェックボックスが変になる
		window.setTimeout(function(){
			$read.click();
		}, 100);
	};
	
	var generateCharacterFromResult = function(cdata) {
		var counter = [];
		for(key in cdata.counters){
			counter.push({
				name: key,
				value:cdata.counters[key]
			});
		}
		
		var tofStatus = tof.getStatus();
		var roomUrl = tofStatus.url + "&room="+tofStatus.room;
		if(tofStatus.pass != ""){
			roomUrl += "&password=" + tofStatus.pass;
		}
		
		return new com.hiyoko.tof.room.Character(cdata.name, roomUrl, counter);
	};
	
	var rend = function(charCandidates, opt_callback){
		$disp.empty();
		rendCharacterTable(charCandidates);
		appendAddButton();
		var now = new Date();
		$update.text('Table Last Update： ' + now.getHours() + '：' + now.getMinutes() + '：' + now.getSeconds());
		if(opt_callback) {
			opt_callback();
		}
	};
	
	var addCharacter = function(){
		var cName = window.prompt("名前を入力", "New Character" + rndString("＃", 8));
		if(cName !== null){
			tof.getCharacterBuilder(cName).build();
			$read.click();
		}
	};
	
	var appendAddButton = function(){
		var button = $("<div " +
				"class='ui-btn ui-shadow ui-btn-corner-all ui-fullsize ui-btn-block tofChat-button-heavy'>" +
				"キャラクター追加</div>");
		button.click(addCharacter);
		$disp.append(button);
	};
	
	var rendCharacterTable = function(charCandidates){
		chars = [];
		var list = charCandidates.filter(function(cc){
			return cc.type === "characterData" && cc.isHide === false;
		}).sort(function(a, b){
			return b.initiative - a.initiative;
		});
		if(list.length === 0){
			$disp.append("<p>表示すべきキャラクターが見つかりませんでした</p>");
			return;
		}
		
		var keysV = [];
		var keysB = [];
		var keys = tof.getStatus().counters;

		$.each(keys, function(i, v){
			if(startsWith(v, "*")){
				keysB.push(v.substring(1));
			} else {
				keysV.push(v);
			}
		});

		$table = drawAccordion(keysV, keysB, list);
		$disp.append($table);
		
		$('.' + id + '-display-serverImageUpload').each(function(i) {
			new com.hiyoko.tof.ImageUploader($(this), {tags: 'キャラクター画像 ひよんとふ ' + list[i].name})
		});
	};
	
	var drawAccordion = function(keysV, keysB, list) {
		var $base = $("<div></div>");
		
		$.each(list, function(i, c){
			chars.push(tof.generateCharacterFromResult(c));
			var cTable = c.counters;
			var $cn = $("<h2></h2>");
			var $ct = $("<table border='1'></table>");
			
			$cn.text(c.name);
			$ct.append("<tr><th>イニシアティブ</th><td><input name='initiative' type='number' value='" + c.initiative + "' /></td></tr>");
			$.each(keysV, function(j, k){
				var $tr = $('<tr></tr>');
				
				var $key = $('<th></th>');
				$key.text(k);
				$tr.append($key);
				
				var $value = $('<td></td>');
				var $value_input = $('<input />');
				$value_input.attr({
					name: k,
					type: 'number',
					value: cTable[k]
				});
				$value.append($value_input);
				$tr.append($value);
				
				$ct.append($tr);
			});
			$.each(keysB, function(j, k){
				var $tr = $('<tr></tr>');
				
				var $key = $('<th></th>');
				$key.text(k);
				$tr.append($key);
				
				var $value = $('<td></td>');
				var $value_input = $('<input />');
				$value_input.attr({
					name: k,
					type: 'checkbox',
				});
				
				if (cTable["*" + k] === "1") {
					$value_input.attr('checked', 'checked');
				}
				
				$value.append($value_input);
				$tr.append($value);
				
				$ct.append($tr);
			});
			
			var $picTr = $('<tr></tr>');
			$picTr.append('<th>画像</th>');
			var $picTd = $('<td></td>');
			if(outerImage || serverImageButton) {
				var $picInput = $('<input />');
				$picInput.attr({
					name: 'image',
					type: 'text',
					value: c.imageName,
					style: (outerImage ? '' : 'display:none;')
				});
				$picTd.append($picInput);
				$picTd.append(serverImageButton);
				$picTd.append('<hr/>');
			}
			$picTd.append(com.hiyoko.tofclient.Table.getImageUploaderDom(id + '-display-serverImageUpload-' + i, id + '-display-serverImageUpload'));
			$picTr.append($picTd);
			$ct.append($picTr);
			$ct.append("<tr><th>その他</th>"
						+ "<td><textarea name='info'>" + c.info + "</textarea></td></tr>");
			$ct.change(function(e){
				var $tag = $(e.target);
				if($tag.attr("type") !== "checkbox"){
					chars[i].setValue($(e.target).attr("name"), $tag.val());
				} else {
					chars[i].setValue('*' + $(e.target).attr("name"), $tag.prop("checked") ? "1" : "0");
				}
				$tag.css('opacity', '0').animate({opacity:'1'}, 800);
			});
			$ct.on(com.hiyoko.tofclient.Table.ImageChangeRequestFromChild, function(e){
				var $image = $ct.find('input[name="image"]');
				$image.val(e.url);
				$image.change();
			}.bind(this));
			
			$base.append($cn);
			$base.append($ct);
		});
		return $base;
	};
	
	$html.click(function(e) {
		if($(e.target).hasClass($html.attr('id') + '-display-serverImageButton')) {
			new com.hiyoko.tofclient.ServerImageList(
					$(e.target).parent().find('.' + $html.attr('id') + '-display-serverImageList'),
					com.hiyoko.tof.getImageJsonUrl(tof.getStatus().url),
					tof.getStatus().url.replace('DodontoFServer.rb?', ''));
		}
	});
	
	this.init();
};

com.hiyoko.tofclient.Table.ImageChangeRequestFromChild = 'ServerImageListSelect';

com.hiyoko.tofclient.Table.getImageUploaderDom = function(id, clazz) {
	return '<div id="' + id + '" class="' + clazz + '">' +
	'<input type="file" id="' + id + '-selectpic" class="' + clazz + '-selectpic" name="fileData" accept="image/*">' +
	'<input id="' + id + '-tags" class="' + clazz + '-tags" value="" />' +
	'<canvas id="' + id + '-canvas" class="' + clazz + '-canvas"></canvas><br/>' +
	'<button id="' + id + '-upload" class="' + clazz + '-upload">アップロードする</button></div>';
};
