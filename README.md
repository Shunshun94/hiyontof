# hiyontof

HTML/JS で動くスマートフォン向けどどんとふクライアントです。

ひよこどどんとふクライアント、略して **ひよんとふ** 、と呼んでます。
**ひよこんとふ** とか、 **ひよこクライアント** とか、そんな呼ばれ方をしていることもあります。

どどんとふについては [どどんとふ＠えくすとり～む](http://www.dodontof.com/) をお読みください。

## 他の資料

- [更新履歴](docs/HISTORY.md)
- [ひよんとふがどんな風に動いているのか](docs/HOW_HIYONTOF_WORKS.md)

## 使い方

``main/hiyontof.html`` にアクセスすればすぐ使えます。

``main/roomlist.html`` にアクセスするとサーバごとの部屋一覧が見られます。

## 設置手順

### ガイド

[超簡単 どどんとふ設置マニュアル | こかげ工房](https://cokage.works/trpg/dodontof_installer/) の手順に従えばさくらのレンタルサーバ限定ですが、どどんとふとひよんとふを簡単にセットアップできます。

また、 [超簡単 どどんとふメンテナンスマニュアル | こかげ工房](https://cokage.works/trpg/dodontof_maintenance/) の手順に従うことでバージョンアップも容易にできます。

### もう少し泥臭い方法

まずは、任意のディレクトリで以下を実行。

``` bash
$ git clone https://github.com/Shunshun94/hiyontof.git
```

以下3つのコマンドをリポジトリ内で実行し、
``main/hiyontof.conf.js`` を編集した上で
main ディレクトリの中身をまとめて任意のディレクトリにデプロイしてください。

``` bash
$ cd hiyontof
$ git submodule init
$ git submodule update
```

その後、ユーザを hiyontof.html にアクセスするように誘導してください。

#### 何故 git submodule を実行しないといけないの?

jscolor というライブラリをダウンロードしてくるためのコマンドです。
``main/js/lib/jscolor`` 以下に ``jscolor.min.js`` を手動で設置していただいてもかまいません。

#### 他のライブラリはどうするの?

各ライブラリがホストしている CDN 等からアクセスしています。
``git submodule`` で配置しているものは、その URL が公式に示されていないためにこのようにしています。

#### 既に設置済みでバージョンアップするにはどうすればいいの?

特に設定を変えていないのであれば ``$ git pull`` が早いです。

そうでなければ以下のコマンドが簡単です。

``` bash
cp main/hiyontof.conf.js ../hiyontof.conf.js.bk
git stash
git pull
rm main/hiyontof.conf.js
mv ../hiyontof.conf.js.bk main/hiyontof.conf.js
```

### git コマンドを使わずに導入する

以下の URL から最新版のソースコードをダウンロードできます。

https://github.com/Shunshun94/hiyontof/archive/master.zip

後は、 ``jscolor.min.js`` を ``main/js/lib/jscolor`` 以下にダウンロードしてきて配置するだけ。

更新の際は単純に上書きしましょう。

## 利用しているライブラリ類

### Template-Party のデザインテンプレート

見た目のために利用しています。
利用規約 http://template-party.com/read.html

### jQuery v.1.11.1

Copyright (c) 2005, 2014 jQuery Foundation, Inc.

MIT ライセンスです。

ライセンス情報:  https://jquery.org/license/

### jQuery Mobile v1.1.0

Copyright (c) 2010, 2012 jQuery Foundation, Inc.

MIT ライセンスです。

ライセンス情報 : https://jquery.org/license/

### jquery.pep.js

Copyright (c) 2014 Brian Gonzalez

マップのドラッグアンドドロップの制御に使っています。

MIT ライセンスです。

ライセンス情報: https://github.com/briangonzalez/jquery.pep.js#license

### jscolor

Copyright (c) 2010, 2015 East Desire

チャットの文字色選択に使っています。

GNU GENERAL PUBLIC LICENSE Version 3 です。

ライセンス情報: http://jscolor.com/download/

### CryptoJS

非公開発言の真正性検証に使っています。

MIT ライセンスです。

ライセンス情報: https://github.com/brix/crypto-js/blob/develop/LICENSE

### 立ち絵がないときに表示される画像

[かなひつじ](https://twitter.com/kana_1173) さんに描いていただきました。

ひよんとふ以外での利用は不可とします。

### チャット更新時の効果音

[フリー音楽素材/魔王魂](http://maoudamashii.jokersounds.com/) より頂いた
[紙01](http://maoudamashii.jokersounds.com/archives/se_maoudamashii_se_paper01.html) を使用しています。

素材利用規約: http://maoudamashii.jokersounds.com/music_rule.html

## ライセンス

ひよんとふは GNU GENERAL PUBLIC LICENSE Version 3 でライセンスします。
詳細は LICENSE ファイルを参照してください。

## お世話になっている方々

### 個人

ひよんとふの開発に際しては多くの人にお世話になりました。幾人かを紹介したいと思います。

まず、どどんとふを開発なさった [たいたい竹流](https://twitter.com/torgtaitai) さん。
そもそも、どどんとふが無ければひよんとふを開発しようとは考えませんでした。
また、どどんとふに WEBIF の機能があった、というのも開発のきっかけでした。

ひよんとふのソースコード公開のきっかけを作ってくださった [大ちゃん](https://twitter.com/DoDontoF_Srv) さんと [弓路](https://twitter.com/yumiji3156) さん。
2人のディスカッションをきっかけにひよんとふを github に公開しようと考えました。
また、2人はひよんとふを各々のサーバに設置してくださっています。

ひよんとふを最初に設置するサーバを貸してくださった [シン](http://www.pixiv.net/member.php?id=10771780) さん。
ひよんとふの設置場所に困っていた際に、快くサーバを貸してくださいました。
また、動作状況のフィードバックも頻繁にくださっています。

インタフェース周りの改善に知恵を貸してくれた [かなひつじ](https://twitter.com/kana_1173) さん。
インタフェースに関する更新は大体彼女の指摘がかかわっています。

<!-- 他にも載せたい人がたくさんいるのだけれども、文面がうまく書けなかったから次回以降の更新で。主にフィードバックコメントくださった方々とか。 -->

### 紹介記事 (既知のもののみ)

- 2016年03月26日 [スマホでどどんとふ！: セッションもぐもぐ](http://nomit.seesaa.net/article/435670815.html)
- 2016年05月08日 [スマホでTRPG「 ひよこどどんとふクライアント」 | こかげ工房](https://cokage.works/trpg/hiyoco-dodontof/)
- 2016年11月16日 [ひよんとふ140](https://twitter.com/i/moments/798415028697399296)

### 設置サーバ (直接連絡を頂いたもののみ)

- [http://sy17.sakura.ne.jp/shunshun/tofChatProto.html](http://sy17.sakura.ne.jp/shunshun/tofChatProto.html)
- [https://www.taruki.com/](https://www.taruki.com/)
- [https://cokage.works/](https://cokage.works/)

