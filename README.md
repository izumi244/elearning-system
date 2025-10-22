# 📚 E-Learning Management System (LMS)

生成AI学習のためのハイブリッド進捗管理システム

## ✨ 特徴

- **ハイブリッド同期システム**: localStorage（高速表示） + Google Sheets（マルチデバイス同期）
- **マルチデバイス対応**: PC・スマホ・タブレットで同じ進捗を共有
- **完全自動化**: ボタンクリックで自動的にGoogle Sheetsに保存
- **管理者ダッシュボード**: 30人の学習進捗を一覧管理
- **完全無料**: Googleの無料サービスのみで運用可能

## 🚀 クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/izumi244/elearning-system.git
cd elearning-system
```

### 2. 設定ファイルの作成

```bash
cp js/config.example.js js/config.js
```

`js/config.js` を編集して、実際の値を設定：

```javascript
const CONFIG = {
    SPREADSHEET_ID: 'あなたのスプレッドシートID',
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/.../exec',
    GOOGLE_API_KEY: 'あなたのAPIキー'
};
```

詳細は [`apps-script/README.md`](apps-script/README.md) を参照してください。

### 3. ブラウザで開く

```bash
# ローカルサーバーを起動（推奨）
python -m http.server 8000

# ブラウザで開く
open http://localhost:8000
```

または、`index.html` を直接ブラウザで開くこともできます。

### 4. ログイン

デフォルトのテストユーザー：
- ユーザーID: `user001` ～ `user030`
- パスワード: ユーザーIDと同じ（例: `user001` / `user001`）
- 管理者: `admin` / `admin`

⚠️ **セキュリティ警告**: 本番環境では必ず認証システムを改善してください。

## 📁 プロジェクト構造

```
elearning-system/
├── index.html              # ログインページ
├── home.html               # ホームページ
├── curriculum.html         # カリキュラム一覧
├── chapter.html            # チャプター学習ページ
├── admin.html              # 管理者ダッシュボード
├── faq.html                # よくある質問
├── pc-beginner.html        # PC初心者用カリキュラム
├── css/
│   └── style.css           # スタイルシート
├── js/
│   ├── config.js           # 設定ファイル（Git管理外）
│   ├── config.example.js   # 設定ファイルのサンプル
│   ├── auth.js             # 認証システム
│   ├── progress.js         # 進捗管理（基本クラス）
│   └── hybrid-progress.js  # ハイブリッド進捗管理
├── apps-script/
│   ├── Code.gs             # Google Apps Scriptコード
│   └── README.md           # セットアップ手順
├── content/                # 学習コンテンツ（37チャプター）
└── images/                 # 画像ファイル
```

## 🔧 システムアーキテクチャ

### ハイブリッド進捗管理の仕組み

```
[ユーザー端末]                [Google Cloud]
     |
     | 1. チャプター完了ボタンクリック
     ↓
[localStorage保存] ← 即座に画面反映（サクサク動作）
     |
     | 2. fetch() でPOST送信
     ↓
[Google Apps Script] ← doPost()で受信
     |
     | 3. SpreadsheetApp で書き込み
     ↓
[Google Sheets] ← 進捗データを保存
     ↑
     | 4. 30秒ごとに同期（GET）
     |
[Google Sheets API] ← 高速読み取り
     |
     | 5. localStorageを更新
     ↓
[別端末で同期完了] ← マルチデバイス同期実現
```

### データフロー

#### 書き込み処理（Google Apps Script使用）
```javascript
// hybrid-progress.js
completeChapter()
  → localStorage に保存（即座）
  → fetch(APPS_SCRIPT_URL) で送信
  → doPost() で受信
  → SpreadsheetApp で書き込み
```

#### 読み取り処理（Google Sheets API使用）
```javascript
// hybrid-progress.js
syncFromGoogleSheets()
  → fetch(SHEETS_API_URL) で取得
  → JSON レスポンスをパース
  → localStorage を更新
  → 画面に反映
```

## 🛠️ 主要機能

### 学習者向け機能

- **進捗追跡**: チャプターごとの完了状況を自動記録
- **学習履歴**: 完了日時や学習時間を確認
- **マルチデバイス同期**: どの端末でも同じ進捗で継続
- **カリキュラム管理**: 37チャプターの体系的な学習コース

### 管理者向け機能

- **進捗ダッシュボード**: 30人の学習状況を一覧表示
- **完了率フィルター**: 進捗度でソート・検索
- **CSV エクスポート**: 月次レポート用にデータ出力
- **リアルタイム更新**: Google Sheetsで常に最新データを確認

## 🔐 セキュリティに関する注意

### 現在の実装での問題点

⚠️ **このシステムは学習・デモ目的です。本番環境では以下を改善してください：**

1. **認証システム**: パスワードがハードコードされています
   - サーバーサイド認証の実装
   - パスワードのハッシュ化
   - JWTトークンの使用

2. **APIキーの保護**: `config.js` がクライアント側にあります
   - 環境変数への移行
   - サーバーサイドプロキシの実装
   - API制限の設定

3. **入力検証**: XSS対策が不十分です
   - サニタイゼーション処理の追加
   - CSP（Content Security Policy）の設定

### 推奨される対策

```javascript
// 例: サーバーサイドでAPIキーを管理
// Node.js + Express の場合
app.post('/api/save-progress', async (req, res) => {
    const apiKey = process.env.GOOGLE_API_KEY; // 環境変数から取得
    // Google Sheetsに保存処理
});
```

## 📊 カリキュラム内容

### 基礎マスターコース（全37チャプター）

1. **Lesson 1**: 生成AIの基礎知識（6チャプター）
2. **Lesson 2**: プロンプトエンジニアリング入門（4チャプター）
3. **Lesson 3**: プロンプトエンジニアリング技法 基本編（4チャプター）
4. **Lesson 4**: プロンプトエンジニアリング技法 応用編（7チャプター）
5. **Lesson 5**: プロンプトエンジニアリングの収益化（4チャプター）
6. **Lesson 6**: 生成AIの実務活用演習（9チャプター）

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトは学習目的で作成されています。

## 🐛 トラブルシューティング

### Q: ログインできない

A: デフォルトのテストユーザー（`user001` / `user001`）を使用してください。

### Q: 進捗が保存されない

A:
1. `js/config.js` が正しく設定されているか確認
2. ブラウザのConsole（F12）でエラーを確認
3. [`apps-script/README.md`](apps-script/README.md) の手順を再確認

### Q: マルチデバイス同期が動作しない

A:
1. Google Sheets APIが有効化されているか確認
2. スプレッドシートの共有設定を確認（「リンクを知っている全員」）
3. `config.js` の `GOOGLE_API_KEY` が正しいか確認

### Q: 「設定エラー」が表示される

A: `config.example.js` を `config.js` にコピーして、実際の値を設定してください。

## 📞 サポート

問題が解決しない場合は、以下を確認してください：
1. [apps-script/README.md](apps-script/README.md) のトラブルシューティングセクション
2. GitHubのIssuesページ
3. ブラウザの開発者ツール（F12）のConsoleタブ

## 🚀 今後の改善予定

- [ ] サーバーサイド認証の実装
- [ ] パスワードリセット機能
- [ ] 学習時間の自動追跡
- [ ] 修了証の自動発行
- [ ] モバイルアプリ対応
- [ ] オフライン学習機能
- [ ] AIチャットボットによる学習サポート

---

**開発**: LMS Development Team
**最終更新**: 2025年10月22日
