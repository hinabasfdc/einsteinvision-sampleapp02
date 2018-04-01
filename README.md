# Einstein Vision サンプルアプリ 02 (API V2対応/シンプルUI版)

Einstein Vision を試用するために、GUIをNode.jsで実装したサンプルアプリです。Heroku Buttonでデプロイするだけで、デフォルトで用意されているモデルを使用した予測・解析を試してみることができます。
ロジックを見やすくするため、極力装飾を無くした版です。
2018/04/05

## 必要要件

 - Heroku アカウント (無償の範囲内で使えますが、Einstein Vision のアドオンを使用するため、クレジットカード情報の登録が必要です)

## 実装方法

 - Heroku ボタンを使ってください。
 - [![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## 特徴

 - スマートフォンのブラウザでこのWebアプリにアクセスすることで、カメラ起動→撮影→解析を試してみることが可能です。
 - 画像リサイズ処理をクライアント側で行った上でサーバーに送信し、予測・解析を行うようにしましています。(デフォルト長辺960ピクセル(script.js内の1行目に定義))
 - 予測・解析モデルのIDはHerokuの設定変数で指定します。デフォルトは"GeneralImageClassifier"です。
 - サーバー・クライアント共に、実装は動きを理解・説明しやすくするために、あえてシンプルにしています。実際のアプリケーション作成にあたっては、使用する言語の作法に則り、またUIフレームワークを活用するなど最適化を期待します。

## 使い方

1. デプロイが完了したら、作成されたアプリケーションURLにブラウザでアクセスしてください。(heroku openコマンド、Open Appボタンなどでも良いです)
2. 「ファイルを選択」ボタンをクリック or タップし、予測・解析したいファイルを選択する、もしくは、カメラが起動させて写真を撮影します。もしくは画像領域へ画像ファイルをドラッグ&ドロップします。
3. もし、カメラ撮影で画像の向きがおかしい場合は、画像をクリック or タップすることで、右に90度ずつ回転します。
4. 「Send」ボタンをクリック or タップすると、予測・解析が実行され、結果が表示されます。

## モデルの変更

Heroku のダッシュボードから当該アプリを選択し、"Settings" -> "Config Vars" -> "EINSTEIN_VISION_MODEL_ID"の値を使いたいモデルIDに変更します。

## ローカルでの実行方法

環境(Node.jsのランタイム)が揃っていればローカルで実行して試すことも可能です。ただし、Einstein Vision へのアクセス情報は、Heroku 用の Einstein Vision アドオンを追加した際に付与されるため、いずれにせよ Heroku 上でのアプリケーション作成・アドオン追加が必要です。

1. nodeを実行できるようにします。
2. このソースコードをダウンロードします。(git cloneを使うと良いです)
3. 依存関係のパッケージをダウンロードします。(package.jsonを見て必要なファイルがダウンロードされます)

```
$ node install
```

4. 環境変数設定の.envファイルを作成します。

```.env
EINSTEIN_VISION_URL=[Heroku アプリケーションの Config Vars から値をコピーします]
EINSTEIN_VISION_ACCOUNT_ID=[Heroku アプリケーションの Config Vars から値をコピーします]
EINSTEIN_VISION_MODEL_ID='GeneralImageClassifier'
API_VERSION='v2'
```

5. EINSTEIN_VISION_PRIVATE_KEYの値を Heroku アプリケーションの Config Variables からコピーし、ローカルに作成するファイル(ここではeinstein_platform.pem)に書き込み保存します。

```einstein_platform.pem
-----BEGIN RSA PRIVATE KEY-----
MIIEo〜
中略
-----END RSA PRIVATE KEY-----
```

6. EINSTEIN_VISION_PRIVATE_KEYを環境変数として定義します。(.envに書き込んでもうまくいかないので、この環境変数のみ個別にコマンドで定義します)

```
$ export EINSTEIN_VISION_PRIVATE_KEY=`cat einstein_platform.pem`
```

7. ローカルで起動します。

```
$ heroku local web
```

8. ブラウザでアクセスします。

```
http://localhost:5000
```
特に指定がなければ通常は5000番ポートで起動しますが、アクセスできない場合はログの出力などを確認してください。

## 免責事項

このサンプルコードは、あくまで機能利用の1例を示すためのものであり、コードの書き方や特定ライブラリの利用を推奨したり、機能提供を保証するものではありません。
