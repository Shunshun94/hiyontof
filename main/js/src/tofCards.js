/**
 * どどんとふのカードを処理するクラス。
 * とりあえずは閲覧のみ。
 */

var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};
com.hiyoko.tofclient.Map = com.hiyoko.tofclient.Map || {};
com.hiyoko.tofclient.Map.Cards = function($html, cardsBaseInfo, tofUrl) {
	var id = $html.attr('id');
	
	var $disp = $('#' + id + '-display');
	
	var $mount = $('#' + id + '-display-mount');
	var $active = $('#' + id + '-display-active');
	var $trush = $('#' + id + '-display-trush');
	
	var cardConverter = new com.hiyoko.tofclient.Map.Cards.Converter(id, tofUrl);
	
	var cardType = {
			// 何故か Card.mountName が cardBaseInfo にないものがあるのでその対策で初期値を入れておく
			'trump': 'トランプ',
			'trump	1x1': 'トランプ'
	};
	$.each(cardsBaseInfo, function(i, v){
		cardType[v.type] = v.title;
	});
	
	this.update = function(res){
		var activeTypes = getCardTypes(res);
		
		displayCardMount(res.roomInfo.cardMount, activeTypes);
		displayCardActive(res.characters, activeTypes);
		displayCardTrush(res.roomInfo.cardTrushMount, activeTypes);
	}
	
	function printCard(card) {
		return cardConverter.cardToDom(card);
	}
	
	function displayCardActive(cards, at) {
		var $base = $('<div></div>');
		
		$base.append('<h2>手札</h2>');
		
		cards = extractCards(cards);
		var mountNamedCards = groupArray(cards, function(c){return c.mountName;});
		
		
		$.each(at, function(i, v){
			var $cardTypeBase = $('<h3 class="' + id + '-display-card-title"></h3>');
			try{
				$cardTypeBase.text(cardType[v] + '……手' + mountNamedCards[v].length + '枚');
				$base.append($cardTypeBase);
				
				var tCards = groupArray(mountNamedCards[v], function(v){
					return v.ownerName;
				});
				
				for(var key in tCards) {
					var $owner = $('<h4 class="' + id + '-display-card-owner"></h4>');
					$owner.text((key || '持ち主不明') + '……手' + tCards[key].length + '枚');
					$base.append($owner);
					$.each(tCards[key], function(i, v){
						$base.append(printCard(v));
					});
				}
			} catch (e) {
				$cardTypeBase.text(cardType[v] + '……手0枚');
				$base.append($cardTypeBase);
			}
		});
		
		$active.empty();
		$active.append($base);
	}
	
	function displayCardTrush(cards, at) {
		var $base = $('<div></div>');
		
		$base.append('<h2>捨札</h2>');
		
		$.each(at, function(i, v){
			var $cardTypeBase = $('<h3 class="' + id + '-display-card-title"></h3>');
			try{
				$cardTypeBase.text(cardType[v] + '……捨' + cards[v].length + '枚');
				$base.append($cardTypeBase);
				
				var tCards = groupArray(cards[v], function(v){
					return v.ownerName;
				});
				
				for(var key in tCards) {
					var $owner = $('<h4 class="' + id + '-display-card-owner"></h4>');
					$owner.text((key || '持ち主不明') + '……捨' + tCards[key].length + '枚');
					$base.append($owner);
					$.each(tCards[key], function(i, v){
						$base.append(printCard(v));
					});
				} 
			} catch (e) {
				$cardTypeBase.text(cardType[v] + '……捨0枚');
				$base.append($cardTypeBase);
			}

		});
		$trush.empty();
		$trush.append($base);
	}
	
	function displayCardMount(cards, at) {
		var $base = $('<div></div>');
		
		$base.append('<h2>山札</h2>');
		
		$.each(at, function(i, v){
			var $cardTypeBase = $('<h3 class="' + id + '-display-card-title"></h3>');
			$cardTypeBase.text(cardType[v] + '……残' + cards[v].length + '枚');
			$base.append($cardTypeBase);
		});
		$mount.empty();
		$mount.append($base);
	}
	
	function getCardTypes(res) {
		var result = [];
		for(var key in res.roomInfo.cardMount) {
			result.push(key);
		}
		return result.sort();
	}
	
	function extractCards(cardsCand, opt_filters) {
		if(opt_filters){
			var result = cardsCand;
			for(var key in opt_filters) {
				result = result.filter(function(c){
					return c[key] === opt_filters[key];
				});
				return result;
			}
		} else {
			return cardsCand.filter(function(c){
				return c.type === 'Card';
			});	
		}
	}
};

com.hiyoko.tofclient.Map.Cards.Converter = function(_id, _url){
	var self = this;
	var id = _id;
	var url = _url;
	
	this.ctd = function(card) {
		return self.cardToDom(card);
	}
	
	this.cardToDom = function(card) {
		return (this.selectParser(card))(card, id, url);
	};
	
	this.selectParser = function(card) {
		var type = card.mountName;
		
		if(['insane'].includes(type) || type.startsWith('amadeus')) {
			return com.hiyoko.tofclient.Map.Cards.ComplexHtmlParser;
		}
		
		if(type.startsWith('trump') || type === 'randomDungeonTrump') {
			return com.hiyoko.tofclient.Map.Cards.TrumpParser;
		}
		
		if(type === 'witchQuestWitchTaro') {
			return com.hiyoko.tofclient.Map.Cards.WhichQuestWitchTaroParser;
		}
		
		if(type === 'witchQuestStructureCard') {
			return com.hiyoko.tofclient.Map.Cards.WhichQuestStructureParser;
		}
		
		if(type === 'cardRanker') {
			return com.hiyoko.tofclient.Map.Cards.CardRankerParser;
		}
		
		if(type.startsWith('hanafuda')) {
			return com.hiyoko.tofclient.Map.Cards.HanafudaParser;
		}
		
		if(type.startsWith('gunMetalBlaze')) {
			return com.hiyoko.tofclient.Map.Cards.GunMetalBlazeParser;
		}
		
		if(type.startsWith('torg')) {
			return com.hiyoko.tofclient.Map.Cards.TorgParser;
		}
		
		if(type === 'actCard2') {
			return com.hiyoko.tofclient.Map.Cards.MasqueradeStyleActParser;
		}

		return com.hiyoko.tofclient.Map.Cards.DefaultParser; 
	};
};

com.hiyoko.tofclient.Map.Cards.SimplePictParser = function(card, id, tof) {
	var $dom = $('<div class="' + id + '-display-card ' + card.mountName + '"></div>');
	if(card.isOpen) {
		var name = card.imageName.split('\t');
		$dom.append('<img height="212" width="150" src="'+com.hiyoko.tof.parseResourceUrl(name[0], tof)+'"/>');
	} else {
		$dom.append('<img height="212" width="150" src="'+com.hiyoko.tof.parseResourceUrl(card.imageNameBack, tof)+'"/>');
	}
	return $dom;
};

com.hiyoko.tofclient.Map.Cards.ComplexHtmlParser = function(card, id) {
	var $dom = $('<div class="' + id + '-display-card ' + card.mountName + '"></div>');
	if(card.isOpen) {
		var text = card.imageName.split('\t')[0]
			.replace(/\s*/g, '')
			.replace(/<BR>/gi, '###BR###')
			.replace(/FONT SIZE="42">([^<]*)<\/FONT>/, '<strong>$&</strong>###BR###')
			.replace(/<[^>]*>/g, '');
		$dom.html(text.replace(/###BR###/g, '<br/>'));
	} else {
		$dom.text('非公開');
	}
	return $dom;
}

com.hiyoko.tofclient.Map.Cards.SimpleHtmlParser = function(card, id) {
	var $dom = $('<div class="' + id + '-display-card ' + card.mountName + '"></div>');
	if(card.isOpen) {
		var text = card.imageName.split('\t').join('###BR######BR###')
			.replace(/<br>/gi, '###BR###')
			.replace(/<[^>]*>/g, '');
		$dom.html(text.replace(/###BR###/g, '<br/>'));
	} else {
		$dom.text('非公開');
	}
	return $dom;
};

com.hiyoko.tofclient.Map.Cards.SimpleRotationHtmlParser = function(card, id) {
	var $dom = $('<div class="' + id + '-display-card ' + card.mountName + '"></div>');
	if(card.isOpen) {
		var text = (card.rotation ? '(逆)' : '(正)' ) + card.imageName.split('\t')[0]
			.replace(/<br>/gi, '###BR###')
			.replace(/<[^>]*>/g, '');
		$dom.html(text.replace(/###BR###/g, '<br/>'));
	} else {
		$dom.text('非公開');
	}
	return $dom;
};

com.hiyoko.tofclient.Map.Cards.DefaultParser = function(card, id, url){
	if(card.isText){
		if(card.isUpDown) {
			return com.hiyoko.tofclient.Map.Cards.SimpleRotationHtmlParser(card, id, url);
		} else {
			return com.hiyoko.tofclient.Map.Cards.SimpleHtmlParser(card, id, url);
		}
	} else {
		return com.hiyoko.tofclient.Map.Cards.SimplePictParser(card, id, url);
	}
};

com.hiyoko.tofclient.Map.Cards.MasqueradeStyleActParser = function(card, id, tof) {
	// クラス名の自動取得がうまくいかないので独自パーサ
	var $dom = $('<div class="' + id + '-display-card masqueradestyle"></div>');
	if(card.isOpen) {
		var name = card.imageName;
		$dom.append('<img height="212" width="150" src="'+com.hiyoko.tof.parseResourceUrl(name, tof)+'"/>');
	} else {
		$dom.append('<img height="212" width="150" src="'+com.hiyoko.tof.parseResourceUrl(card.imageNameBack, tof)+'"/>');
	}
	return $dom;
};

com.hiyoko.tofclient.Map.Cards.HanafudaParser = function(card, id, tof) {
	var $dom = $('<div class="' + id + '-display-card cardranker"></div>');
	if(card.isOpen) {
		var name = card.imageName;
		$dom.append('<img height="210" width="140" src="'+com.hiyoko.tof.parseResourceUrl(name, tof)+'"/>');
		var execResult = /(\d\d)(\d\d)/.exec(name);
		
		$dom.append('<p>'+
				com.hiyoko.tofclient.Map.Cards.HanafudaParser.NAME[[Number(execResult[1])]][0] + 'の' +
				(com.hiyoko.tofclient.Map.Cards.HanafudaParser.NAME[[Number(execResult[1])]][Number(execResult[2])] || 'カス') + '</p>');
	} else {
		$dom.append('<img height="210" width="140" src="'+com.hiyoko.tof.parseResourceUrl(card.imageNameBack, tof)+'"/>');
		$dom.append('<p>非公開</p>');
	}
	return $dom;
};

com.hiyoko.tofclient.Map.Cards.HanafudaParser.NAME = [[],
['松', '鶴', '赤短'],
['梅', '鶯', '赤短'],
['桜', '幕', '赤短'],
['藤', '不如帰', '短冊'],
['菖蒲', '八橋', '短冊'],
['牡丹', '蝶', '青短'],
['萩', '猪', '短冊'],
['芒', '月', '雁'],
['菊', '盃', '青短'],
['紅葉', '鹿', '青短'],
['柳', '小野道風', '燕', '短冊'],
['桐', '鳳凰']];

com.hiyoko.tofclient.Map.Cards.TorgParser = function(card, id) {
	var $dom = $('<div class="' + id + '-display-card torg"></div>');
	if(card.isOpen) {
		var text = card.imageName
			.replace(/<br>/g, '###BR###')
			.replace(/■■■■/g, '■■')
			.replace(/<[^>]*>/g, '');
		$dom.html(text.replace(/###BR###/g, '<br/>'));
	} else {
		$dom.text('非公開');
	}
	return $dom;
};

com.hiyoko.tofclient.Map.Cards.GunMetalBlazeParser = function(card, id) {
	var $dom = $('<div class="' + id + '-display-card gunmetalblaze"></div>');
	
	if(card.isOpen) {
		var text = card.imageName
			.replace(/<br>/g, '###BR###')
			.replace(/<[^>]*>/g, '').split('\t').join('<hr/>');
		$dom.html(text.replace(/###BR###/g, '<br/>'));
	} else {
		$dom.text('非公開');
	}
	return $dom;
};

com.hiyoko.tofclient.Map.Cards.CardRankerParser = function(card, id, tof) {
	var $dom = $('<div class="' + id + '-display-card cardranker"></div>');
	if(card.isOpen) {
		var name = card.imageName.split('\t');
		$dom.append('<img height="210" width="140" src="'+com.hiyoko.tof.parseResourceUrl(name[0], tof)+'"/>');
		$dom.append('<p>'+name[1]+'</p>');
	} else {
		$dom.append('<img height="210" width="140" src="'+com.hiyoko.tof.parseResourceUrl(card.imageNameBack, tof)+'"/>');
		$dom.append('<p>非公開</p>');
	}
	return $dom;
};

com.hiyoko.tofclient.Map.Cards.WhichQuestWitchTaroParser = function(card, id) {
	var $dom = $('<div class="' + id + '-display-card whichquest"></div>');
	if(card.isOpen) {
		var text = (card.rotation ? '(逆)' + card.imageName.split('\t')[5] : '(正)' + card.imageName.split('\t')[4]);
		$dom.html(text.replace(/\\n/g, '<br/><br/>'));
	} else {
		$dom.text('非公開');
	}
	return $dom;	
};

com.hiyoko.tofclient.Map.Cards.WhichQuestStructureParser = function(card, id) {
	var $dom = $('<div class="' + id + '-display-card whichquest"></div>');
	if(card.isOpen) {
		var text = card.imageName.split('\t')[4];
		$dom.html(text.replace(/\\n/g, '<br/><br/>'));
	} else {
		$dom.text('非公開');
	}
	return $dom;	
};

com.hiyoko.tofclient.Map.Cards.TrumpParser = function(card, id) {
	var $dom = $('<div class="' + id + '-display-card trump"></div>');
	if(card.isOpen) {
		var name = card.imageName.split('\t')[1].split('の');
		$dom.html(com.hiyoko.tofclient.Map.Cards.TrumpParser.NAME[name[0]] + (name[1] || ''));
	} else {
		$dom.text('非公開');
	}
	return $dom;
};

com.hiyoko.tofclient.Map.Cards.TrumpParser.NAME = {
		'ダイア': '<span class="trump_red">♦</span>',
		'ハート': '<span class="trump_red">♥</span>',
		'スペード': '♠',
		'クラブ': '♣',
		'ジョーカー': 'JOKER'
}
