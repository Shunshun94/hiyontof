var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};
com.hiyoko.tofclient.ServerImageList = function($html, url, tofUrl) {
	this.html = $html;
	this.clazz = $html.attr('class');
	this.imageClass = this.clazz + '-image';
	this.imgDir = tofUrl;
	
	$.getJSON(url, function(result){
		this.html.append('<div class="' + this.clazz + '-close">閉じる</div>');
		this.buildImageList(result);
		this.html.show();
		this.bindEvents();
	}.bind(this));
};

com.hiyoko.tofclient.ServerImageList.prototype.bindEvents = function() {
	this.html.click(function(e){
		this.html.hide();
		this.html.empty();
	}.bind(this));
	this.html.find('.' + this.imageClass).click(function(e){
		this.html.trigger(new $.Event('ServerImageListSelect', {url: $(e.target).attr('title')}));
	}.bind(this));
};

com.hiyoko.tofclient.ServerImageList.prototype.buildImageList = function(result) {
	var $base = $('<div></div>');
	var list = result.imageTags;
	for(var url in list) {
		(function(){
			var $img = $('<div title="' + url +'" class="' + this.imageClass + '"></div>')
			$img.css('background-image', 'url(\'' + this.imgDir + url + '\' )');
			$base.append($img);
		}.bind(this))();
	}
	this.html.append($base);
};