var com = com || {};
com.hiyoko = com.hiyoko || {};
com.hiyoko.tofclient = com.hiyoko.tofclient || {};
com.hiyoko.tofclient.HelpCard = com.hiyoko.tofclient.HelpCard || {};

com.hiyoko.tofclient.HelpCard.showHelp = function(helpCode) {
	$.each(com.hiyoko.tofclient.HelpCard[helpCode], function(i, card){
		alert(card.title + '\n=============\n\n' + card.content);
	});
};

com.hiyoko.tofclient.HelpCard['tofChat-chat-input-secret-help'] = [
	{title: '非公開発言',
	content:'どどんとふのシークレットダイスと似た機能です。\n' +
	'他の人には見えないようにダイスを振ったり発言をしたりします。\n\n' +
	'GM がプレイヤーに見られないようにダイスを振ったり、\n' +
	'リドルの答えをあらかじめ書いておいて\n「正解はこちら」などといったように公開する際に使えます。'},
	{title: '非公開発言の登録',
	content:'画面上部の入力欄に他の人から伏せておく発言の内容を打ち込みます。\n' +
	'そのうえで「登録」ボタンを押してください。\n\n' +
	'なお、非公開発言を登録すると\nチャットに登録した旨が投稿されます。'},
	{title: '非公開発言の公開',
	content: '画面下部の「リストから選択」をクリックし、\n公開する非公開発言を選択してください。\n\n' +
	'その後、公開をクリックすると他のユーザに発言を公開できます。'},
	{title: 'ダイジェスト値',
	content: '非公開発言を後から書き換えてないことを証明するための値です。\n\n' +
	'非公開発言を公開した際に表示されるリンク先ではこの値を使って、\n' +
	'書き換えられていないこと (真正性) を証明しています。\n\n' +
	'なぜこれで証明できるのかについては\n「SHA-256」や「ハッシュ値」等で調べてみてください。'}];

com.hiyoko.tofclient.HelpCard['tofChat-map-help'] = [
	{title:'マップ',
	content:'どどんとふの背景に表示されるマップです。\n\n' +
	'以下をサポートしています\n＊キャラクターの表示\n＊キャラクターの移動\n＊マップタイルの表示\n＊簡易マップの表示\n\n'+
	'以下は未サポートです (将来的にサポート予定)\n＊マップマーカーの表示\n＊ダイスシンボルの表示'},
	{title:'更新',
	content:'画面下部の「更新」を押すとキャラクターの位置情報が更新されます。\n' +
	'また、定期的にキャラクターの位置情報は更新されます。\n\n' +
	'マップタイルや簡易マップ、背景なども更新したい場合は\n「背景再読み込み」をクリックしてください。'},
	{title:'キャラクターの追加',
	content:'キャラクターの追加は能力表でサポートしています'}];

com.hiyoko.tofclient.HelpCard['tofChat-table-help'] = [
  	{title:'能力表',
  	content:'どどんとふのイニシアティブ表です。\n能力表という名前なのは表示の都合によります。\n\n' +
  	'イニシアティブ表の閲覧/編集が可能です。\n\nまた、定期的に自動更新されます。'},
  	{title:'キャラクターの追加',
  	content:'画面下部の「キャラクターの追加」からキャラクターの追加が可能です。\n' +
  	'HP やイニシアティブ値などの数値は作成後に設定してください。\n\n' +
  	'なお、キャラクター画像の変更は未サポートです。\n(外部  URL に限り将来的にサポート予定)'}];

com.hiyoko.tofclient.HelpCard['tofChat-chat-input-history-help'] = [
    {title:'発言履歴',
 	content:'過去の発言をそのまま使って発言ができます。\nまた、過去の発言を編集して発言することもできます。\n\n' +
 	'チャットパレットの簡易版としてご利用いただくことを想定しています。'},
 	{title:'操作 (参照して発言する)',
 	content:'画面上部のキャラクター名が書かれたタブからキャラクターを選択することで、\n' +
 	'ひよんとふから行われた過去の発言を参照できます。\n\n' +
 	'発言を名前タブ直下のリストから選択し、\n' +
 	'「編集して送信」をクリックすれば発言を編集できます。\n' +
 	'「送信」をクリックすれば編集することなく即座に送信できます。'},
 	{title: 'メンテナンス',
 	content: '使われない発言は自動的に削除されます。\n\n' +
 	'また、一覧はリアルタイムでは更新されないため、\n「更新」をクリックして更新してください。\n\n' +
 	'不要な発言を選択した状態で「削除」をクリックすることで\nその発言を一覧から削除することもできます。'}];

com.hiyoko.tofclient.HelpCard['tofChat-init-help'] = [
  	{title:'ログインするには',
  	content:'「サーバ・部屋一覧」をクリックし、\nそちらから入室するのが一番簡単です。\n\n'+
  	'ないしは、この画面からもログインはできます。\n' +
  	'Safari 以外のブラウザをご利用であれば「どどんとふ URL」を入力しようとすれば\n'+
  	'接続先となるどどんとふ候補の一覧が取得できるはずです。' +
  	'さらに部屋の番号とパスワードを入力して入室しましょう'},
  	{title:'リストにないどどんとふにアクセスする',
  	content:'「サーバ・部屋一覧」から見つからないどどんとふへは\n' +
  	'どどんとふ URL にどどんとふの URL を入力してアクセスします。' +
  	'\n※ひよんとふの設定によってはリストにあるどどんとふにしかアクセスできないかもしれません※\n\n' +
  	'どどんとふの URL は大体末尾が "DodontoF.swf" で終わっています。\n' +
  	'セッションで使うどどんとふを用意なさった方にどどんとふの URL を確認し、\n' +
  	'共有された URL を入力してください。'}];

/*
com.hiyoko.tofclient.HelpCard['tofChat-template'] = [
 	{title:'',
 	content:''},
 	{title:'',
 	content:''}];
*/

$('.tofChat-help').click(function(e) {
	var cards = com.hiyoko.tofclient.HelpCard[$(e.target).attr('id')];

	$.each(cards, function(i, card){
		alert(card.title + '\n=============\n\n' + card.content);
	});
});


