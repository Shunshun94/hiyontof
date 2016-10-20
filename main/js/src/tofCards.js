/**
 * どどんとふのカードを処理するクラス。
 * とりあえずは閲覧のみ。
 */

var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};
com.hiyoko.tofclient.Map = com.hiyoko.tofclient.Map || {};
com.hiyoko.tofclient.Map.Cards = function($html, cardsBaseInfo) {
	var id = $html.attr('id');
	
	var $disp = $('#' + id + '-display');
	
	var $mount = $('#' + id + '-display-mount');
	var $active = $('#' + id + '-display-active');
	var $trush = $('#' + id + '-display-trush');
	
	var cardType = {};
	$.each(cardsBaseInfo, function(i, v){
		cardType[v.type] = v.title;
	});
	
	this.update = function(res){
		var activeTypes = getCardTypes(res);
		
		displayCardMount(res.roomInfo.cardMount, activeTypes);
		console.log('手',extractCards(res.characters));
		displayCardTrush(res.roomInfo.cardTrushMount, activeTypes);
	}
	
	function printCard(card) {
		if(card.isOpen) {
			return $('<p>└' + (card.name || card.imageName.split('\t')[1] || card.imageName) + '</p>');
		} else {
			return $('<p>└非公開</p>');
		}
	}
	
	function displayCardTrush(cards, at) {
		var $base = $('<div></div>');
		$.each(at, function(i, v){
			var $cardTypeBase = $('<p class="' + id + '-display-card-title"></p>');
			$cardTypeBase.text(cardType[v] + '……捨' + cards[v].length + '枚');
			$base.append($cardTypeBase);
			
			var tCards = groupArray(cards[v], function(v){
				return v.ownerName;
			});
			
			for(var key in tCards) {
				var $owner = $('<p class="' + id + '-display-card-owner"></p>');
				$owner.text(key + '……捨' + tCards[key].length + '枚');
				$base.append($owner);
				$.each(tCards[key], function(i, v){
					$base.append(printCard(v));
				});
			}
		});
		$trush.empty();
		$trush.append($base);
	}
	
	function displayCardMount(cards, at) {
		var $base = $('<div></div>');
		
		$.each(at, function(i, v){
			var $cardTypeBase = $('<p class="' + id + '-display-card-title"></p>');
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
		return result;
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
