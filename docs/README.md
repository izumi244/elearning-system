# 📚 ドキュメント

学習管理システムの詳細ドキュメント一覧

---

## 📖 セットアップガイド

### [Notionセットアップガイド](NOTION_SETUP.md)
Notion APIを使用したコンテンツ管理・変換の完全ガイド

**内容:**
- Notion APIキーの取得方法
- Notionページの準備
- ページIDの取得方法
- 単一/一括コンテンツ変換の実行
- 対応ブロックタイプ一覧
- リッチテキスト装飾の対応表
- トラブルシューティング

**対象者:** コンテンツ管理者、開発者

---

### [Google Sheetsセットアップガイド](GOOGLE_SHEETS_SETUP.md)
Google Sheetsを使った進捗管理と課題提出機能のセットアップ

**内容:**
- Google Apps Scriptのセットアップ
- ユーザー別課題シートの作成
- 進捗管理シートの設定
- フロントエンドの設定
- マルチデバイス同期のテスト方法
- セキュリティに関する注意事項
- トラブルシューティング

**対象者:** システム管理者、開発者

---

## 🚀 クイックスタート

初めての方は以下の順序でセットアップしてください:

### 1. 基本セットアップ

メインの[README.md](../README.md)を参照:
- リポジトリのクローン
- Python依存関係のインストール
- 設定ファイルの作成
- ローカルサーバーの起動

### 2. Notion連携（オプション）

コンテンツを更新する場合:
- [Notionセットアップガイド](NOTION_SETUP.md)を参照
- Notion APIキーを取得
- コンテンツを変換

### 3. Google Sheets連携（推奨）

進捗管理・課題提出機能を使用する場合:
- [Google Sheetsセットアップガイド](GOOGLE_SHEETS_SETUP.md)を参照
- Google Apps Scriptをデプロイ
- ユーザー別課題シートを作成
- フロントエンドを設定

---

## 📂 ドキュメント構成

```
docs/
├── README.md                    # このファイル（ドキュメント一覧）
├── NOTION_SETUP.md              # Notion連携ガイド
└── GOOGLE_SHEETS_SETUP.md       # Google Sheets連携ガイド
```

---

## 🔗 関連リンク

### 公式ドキュメント
- [Notion API Documentation](https://developers.notion.com/)
- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)

### Pythonライブラリ
- [notion-client (Python SDK)](https://github.com/ramnes/notion-sdk-py)
- [requests](https://docs.python-requests.org/)

### JavaScript/Web API
- [Fetch API](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API)
- [LocalStorage](https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage)

---

## 🆘 サポート

問題が発生した場合:

1. **トラブルシューティングを確認**
   - [Notionセットアップガイド - トラブルシューティング](NOTION_SETUP.md#トラブルシューティング)
   - [Google Sheetsセットアップガイド - トラブルシューティング](GOOGLE_SHEETS_SETUP.md#トラブルシューティング)
   - [メインREADME - トラブルシューティング](../README.md#トラブルシューティング)

2. **ブラウザConsoleを確認**
   - F12キーでDevToolsを開く
   - Consoleタブでエラーメッセージを確認

3. **Issueを作成**
   - GitHubのIssuesページで問題を報告

---

## 📝 貢献

ドキュメントの改善提案やバグ報告は歓迎します。

### ドキュメント更新の流れ

1. このリポジトリをフォーク
2. ドキュメントを編集
3. プルリクエストを作成

### ドキュメント作成のガイドライン

- **Markdown形式**: すべてのドキュメントは`.md`形式
- **目次**: 各ドキュメントに目次を含める
- **コード例**: 実際に動作するコード例を記載
- **スクリーンショット**: 必要に応じて画像を追加
- **更新日**: ドキュメント末尾に最終更新日を記載

---

**最終更新**: 2025年1月18日
