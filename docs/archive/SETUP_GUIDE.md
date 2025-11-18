# 🚀 ハイブリッドシステム セットアップガイド

## 📋 前提条件

- Googleアカウント
- Google Sheetsの既存スプレッドシート: `LMS_UserProgress`
- スプレッドシートID: `1sTUclxyzGIWNcpbr7u91whFnDmJBKp9CG8-dFgt_Biw`

## ステップ1: Google Apps Scriptのデプロイ

### 1-1. Apps Scriptを開く

1. スプレッドシート `LMS_UserProgress` を開く
2. 「拡張機能」→「Apps Script」をクリック

### 1-2. コードを置き換える

1. 既存のコードを**すべて削除**
2. [`apps-script/Code-Updated.gs`](apps-script/Code-Updated.gs) の内容を**すべてコピー**して貼り付け
3. 保存（Ctrl+S または Cmd+S）

### 1-3. テスト実行

1. 関数選択ドロップダウンで `testUpdateProgress` を選択
2. 「実行」ボタンをクリック
3. 初回実行時に権限の承認を求められたら：
   - 「権限を確認」をクリック
   - 自分のGoogleアカウントを選択
   - 「このアプリは確認されていません」と表示されたら：
     - 「詳細」をクリック
     - 「（プロジェクト名）に移動」をクリック
     - 「許可」をクリック
4. 実行ログで「✅ Test SUCCESS」を確認
5. スプレッドシートに `user001` のデータが更新されていることを確認

### 1-4. ウェブアプリとしてデプロイ

1. 「デプロイ」→「新しいデプロイ」をクリック
2. 歯車アイコン「種類を選択」→「ウェブアプリ」を選択
3. 以下の設定：
   - **説明**: `LMS Progress API v2`
   - **次のユーザーとして実行**: `自分`
   - **アクセスできるユーザー**: `全員`
4. 「デプロイ」をクリック
5. **ウェブアプリのURL**をコピー
   ```
   例: https://script.google.com/macros/s/AKfycbz.../exec
   ```

## ステップ2: Google Cloud API の有効化

### 2-1. Google Cloud Consoleにアクセス

1. [https://console.cloud.google.com/](https://console.cloud.google.com/) を開く
2. 既存プロジェクト `learning-mgmt-sys-67847dd3a59f` を選択
   - または新しいプロジェクトを作成

### 2-2. Google Sheets API を有効化

1. 左メニュー「APIとサービス」→「ライブラリ」
2. 検索ボックスに `Google Sheets API` と入力
3. 「Google Sheets API」をクリック
4. 「有効にする」をクリック（既に有効な場合はスキップ）

### 2-3. APIキーを作成

1. 左メニュー「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「APIキー」をクリック
3. APIキーが作成されます
4. **APIキーをコピー**して安全な場所に保存

### 2-4. APIキーを制限（推奨）

1. 作成したAPIキーの「編集」をクリック
2. 「API の制限」で「キーを制限」を選択
3. 「Google Sheets API」のみを選択
4. 「保存」をクリック

## ステップ3: config.js の設定

### 3-1. config.js を開く

エディタで `js/config.js` を開く

### 3-2. 値を置き換える

```javascript
const CONFIG = {
    // スプレッドシートID（そのまま）
    SPREADSHEET_ID: '1sTUclxyzGIWNcpbr7u91whFnDmJBKp9CG8-dFgt_Biw',

    // ステップ1-4でコピーしたデプロイURL
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/【ここを置き換え】/exec',

    // ステップ2-3でコピーしたAPIキー
    GOOGLE_API_KEY: '【ここを置き換え】',

    // その他はそのまま
    GOOGLE_SHEETS_API_BASE_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
    SYNC_INTERVAL: 30000,
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    LOCAL_STORAGE_PREFIX: 'userProgress_',
    ACTIVITIES_KEY: 'userActivities',
    LAST_SYNC_KEY: 'lastSyncTime'
};
```

### 3-3. 保存

ファイルを保存します。

## ステップ4: スプレッドシートの共有設定

### 4-1. 共有設定を変更

1. スプレッドシート `LMS_UserProgress` を開く
2. 右上の「共有」ボタンをクリック
3. 「一般的なアクセス」を「リンクを知っている全員」に変更
4. 権限を「閲覧者」に設定
5. 「完了」をクリック

## ステップ5: 動作テスト

### 5-1. ブラウザで開く

1. `index.html` をブラウザで開く
2. `user001` / `user001` でログイン

### 5-2. 開発者ツールを開く

- Windows: `F12` または `Ctrl+Shift+I`
- Mac: `Cmd+Option+I`

### 5-3. チャプターを完了

1. カリキュラムページに移動
2. 任意のチャプターを開く
3. 「チャプター完了」ボタンをクリック
4. Consoleタブで以下を確認：
   ```
   ✅ チャプター完了: lesson1-chapter1 をGoogle Sheetsに保存しました
   🔄 Google Sheetsから進捗を同期中...
   ✅ 同期完了: Google Sheetsから最新データを取得しました
   ```

### 5-4. スプレッドシートを確認

1. Google Sheetsを開く
2. `user001` の行が更新されていることを確認
   - `completedChapters` が増えている
   - `completionRate` が更新されている
   - `completedChaptersList` に新しいチャプターが追加されている

### 5-5. マルチデバイス同期をテスト

1. 別のブラウザ（またはシークレットモード）で開く
2. 同じユーザーでログイン
3. 30秒待つ（または手動でページをリロード）
4. 進捗が同期されていることを確認

## トラブルシューティング

### ❌ エラー: 「設定エラー: APPS_SCRIPT_URLが設定されていません」

**原因**: `config.js` が正しく設定されていない

**解決策**:
1. `js/config.js` を開く
2. `APPS_SCRIPT_URL` と `GOOGLE_API_KEY` が正しく設定されているか確認
3. `YOUR_XXX_HERE` のままになっていないか確認

### ❌ エラー: 「Google Apps Scriptへの送信エラー」

**原因**: Apps Scriptのデプロイが正しくない

**解決策**:
1. Apps Scriptで「デプロイ」→「デプロイを管理」
2. 「アクセスできるユーザー」が「全員」になっているか確認
3. URLをコピーし直して `config.js` に設定

### ❌ エラー: 「Google Sheets API エラー: 403」

**原因**: APIキーが無効、またはスプレッドシートの共有設定が間違っている

**解決策**:
1. Google Cloud Consoleで「Google Sheets API」が有効か確認
2. APIキーが正しくコピーされているか確認
3. スプレッドシートの共有設定が「リンクを知っている全員」になっているか確認

### ❌ 同期が動作しない

**原因**: ブラウザのConsoleにエラーが表示されている

**解決策**:
1. F12でConsoleを開く
2. エラーメッセージを確認
3. 上記のエラーパターンに該当するか確認

### ℹ️ 同期タイミングについて

- チャプター完了時: 即座にGoogle Sheetsに保存
- 定期同期: 30秒ごとにGoogle Sheetsから読み取り
- 手動同期: ページリロードで即座に同期

## 完了チェックリスト

- [ ] Apps Scriptのテスト実行が成功
- [ ] Apps Scriptのデプロイ完了
- [ ] Google Sheets APIを有効化
- [ ] APIキーを作成
- [ ] config.jsに値を設定
- [ ] スプレッドシートの共有設定を変更
- [ ] ブラウザでチャプター完了をテスト
- [ ] Consoleでエラーがないことを確認
- [ ] Google Sheetsにデータが保存されることを確認
- [ ] マルチデバイス同期をテスト

すべてチェックが完了したら、ハイブリッドシステムの実装完了です！

## サポート

問題が解決しない場合は、以下を確認してください：
- ブラウザのConsole（F12）
- Apps Scriptの実行ログ
- Google Cloud Consoleの「APIとサービス」→「認証情報」
