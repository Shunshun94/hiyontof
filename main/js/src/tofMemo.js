var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};
com.hiyoko.tofclient.Memo = function(tof){
	var $disp = $("#tofChat-memo-display");
	var $read = $("#tofChat-memo-reload");
	var $cont = $("#tofChat-memo-content");
	var $send = $("#tofChat-memo-append");
	
	var list = [];
	
	var init = function(){
		$read.click(function(e){
			loadMemo();
		});
		$send.click(function(e){
			tof.appendMemo($cont.val(), loadMemo);
			$cont.val("");
		});
		
		$disp.on("updateMemo", function(e) {
			tof.changeMemo(e.memo.getText(), e.memo.getId());
		});
	};
	
	var displayMemos = function(result){
		$disp.empty();
		list = [];
		
		$.each(result.characters, function(ind, memo){
			if(memo.type !== "Memo"){return;}
			var memoObj = new com.hiyoko.tofclient.Memo.Memo(memo);
			list.push(memoObj);
			$disp.append(memoObj.rend());
		});
		if(list.length === 0) {
			$disp.append("<p>表示すべきメモがありません</p>");
		}
	};
	
	var loadMemo = function(){
		tof.getRefresh(function(result){displayMemos(result)}, true);
	};
	
	init();
};

com.hiyoko.tofclient.Memo.Memo = function(data) {
	var id = data.imgId;
	var text = data.message;
	var self = this;
	
	this.getId = function(){
		return id;
	};
	
	this.getText = function(){
		return text;
	};
	
	this.rend = function(){
		var $elem = $("<div class='tofChat-memo-memo'></div>");
		var $text = $("<textarea class='ui-input-text ui-body-f ui-corner-all ui-shadow-inset'></textarea>");
		$text.val(text);
		bindEvent($text);
		$elem.append($text);
		return $elem;
	};
	
	function bindEvent($tag){
		$tag.change(function(e){
			text = $tag.val();
			var event = new $.Event("updateMemo", {memo:self});
			$tag.trigger(event);
			$tag.css('opacity', '0').animate({opacity:'1'}, 800);
		});
	}
	
};