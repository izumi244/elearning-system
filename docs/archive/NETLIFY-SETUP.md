# Netlify デプロイ設定ガイド

## 環境変数の設定

Netlifyにデプロイするには、以下の環境変数を設定する必要があります。

### 設定手順

1. Netlifyダッシュボードを開く
2. プロジェクトを選択
3. **Site settings** → **Environment variables** に移動
4. 以下の環境変数を追加

### 必要な環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `SPREADSHEET_ID` | Google SheetsのスプレッドシートID | `1sTUclxyzGIWNcpbr7u91whFnDmJBKp9CG8-dFgt_Biw` |
| `APPS_SCRIPT_URL` | Google Apps ScriptのWeb App URL | `https://script.google.com/macros/s/xxxxx/exec` |
| `GOOGLE_API_KEY` | Google Sheets APIキー | `AIzaSyD7KqKKKq9tVr9ljTkufAS1tPSf0PaA2JU` |

### 環境変数の取得方法

#### SPREADSHEET_ID
1. Google Sheetsを開く
2. URLから取得: `https://docs.google.com/spreadsheets/d/[この部分がSPREADSHEET_ID]/edit`

#### APPS_SCRIPT_URL
1. Google Apps Scriptを開く
2. 「デプロイ」→「デプロイを管理」
3. 「ウェブアプリ」のURLをコピー

#### GOOGLE_API_KEY
1. Google Cloud Consoleを開く
2. 「APIとサービス」→「認証情報」
3. 既存のAPIキーをコピー、または新規作成

## ローカル開発環境の設定

ローカルで開発する場合は、`js/config.js`を手動で作成してください：

```javascript
const CONFIG = {
    SPREADSHEET_ID: '1sTUclxyzGIWNcpbr7u91whFnDmJBKp9CG8-dFgt_Biw',
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/xxxxx/exec',
    GOOGLE_API_KEY: 'AIzaSyD7KqKKKq9tVr9ljTkufAS1tPSf0PaA2JU',
    GOOGLE_SHEETS_API_BASE_URL: 'https://sheets.googleapis.com/v4/spreadsheets',
    SYNC_INTERVAL: 30000,
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    LOCAL_STORAGE_PREFIX: 'userProgress_',
    ACTIVITIES_KEY: 'userActivities',
    LAST_SYNC_KEY: 'lastSyncTime'
};
```

**注意**: `js/config.js`は`.gitignore`に含まれているため、Gitにコミットされません。

## デプロイ後の確認

1. Netlifyでビルドログを確認
   - ✅ `config.js を生成しました` というメッセージが表示されるはず

2. デプロイされたサイトを開く

3. ブラウザのDevToolsでエラーを確認
   - Consoleタブで `CONFIG is not defined` エラーがないこと
   - Networkタブで `config.js` が200で読み込まれていること

## トラブルシューティング

### config.jsが404エラー

**原因**: ビルドスクリプトが正しく実行されていない

**解決策**:
1. Netlifyのビルドログを確認
2. 環境変数が正しく設定されているか確認
3. `build.sh`に実行権限があるか確認

### CONFIGが定義されていないエラー

**原因**: 環境変数が正しく設定されていない、または置換されていない

**解決策**:
1. Netlifyの環境変数をもう一度確認
2. デプロイを再実行（**Trigger deploy** → **Deploy site**）

### Google Sheets APIエラー

**原因**: APIキーの制限設定

**解決策**:
1. Google Cloud ConsoleでAPIキーの設定を確認
2. 「アプリケーションの制限」を「なし」に設定
3. 「APIの制限」で「Google Sheets API」が有効になっているか確認

## セキュリティに関する注意事項

- ✅ `js/config.js`は`.gitignore`に含まれており、Gitにコミットされません
- ✅ 環境変数はNetlifyのダッシュボードでのみ管理されます
- ✅ ローカルの`js/config.js`は絶対にGitにコミットしないでください
- ⚠️ Google SheetsとApps Scriptの共有設定を適切に管理してください
