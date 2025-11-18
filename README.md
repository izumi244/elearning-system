# 📚 学習管理システム (Learning Management System)

PC初心者向けの学習カリキュラムを提供するWebベースの学習管理システム

## 目次

- [概要](#概要)
- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [プロジェクト構成](#プロジェクト構成)
- [セットアップ](#セットアップ)
- [使い方](#使い方)
- [開発ガイド](#開発ガイド)
- [アーキテクチャ](#アーキテクチャ)
- [セキュリティ](#セキュリティ)
- [トラブルシューティング](#トラブルシューティング)

## 📚 詳細ドキュメント

より詳しいセットアップ方法は、以下のドキュメントを参照してください:

- **[Notionセットアップガイド](docs/NOTION_SETUP.md)** - Notion APIの設定とコンテンツ変換の詳細手順
- **[Google Sheetsセットアップガイド](docs/GOOGLE_SHEETS_SETUP.md)** - 進捗管理・課題提出機能の詳細設定
- **[ドキュメント一覧](docs/README.md)** - 全ドキュメントの目次

---

## 概要

このシステムは、PC初心者がステップバイステップで学習できるように設計された学習管理システムです。NotionをCMSとして使用し、コンテンツを動的にHTMLに変換して提供します。

### ✨ 主な特徴

- **ハイブリッド進捗管理**: localStorage（高速表示）+ Google Sheets（マルチデバイス同期）
- **Notion連携**: NotionページからHTMLへの自動変換
- **27ユーザー対応**: 個別アカウント・進捗管理
- **課題提出機能**: ユーザー別Google Sheets連携
- **セキュリティ強化**: XSS対策、環境変数管理
- **モジュール化設計**: 保守性の高いコード構造

---

## 主な機能

### 1. 認証システム
- ユーザーID/パスワードによるログイン
- LocalStorageベースのセッション管理
- 27個の個別ユーザーアカウント
- 自動ログアウト機能

### 2. カリキュラム管理
- **5レッスン、27チャプター**の体系的な学習コース
- サイドバーナビゲーション
- チャプター完了状態の可視化
- 進捗率の自動計算

### 3. 学習コンテンツ
- **Notionから変換されたHTMLコンテンツ**
- リッチコンテンツのサポート:
  - 画像（自動ダウンロード・保存）
  - テーブル
  - コードブロック
  - 箇条書き・番号付きリスト
  - 引用・コールアウト
  - 文字色・背景色（18色対応）

### 4. 進捗管理
- チャプターごとの完了ステータス
- 完了日時の記録
- 進捗率の表示
- LocalStorageとGoogle Sheetsのハイブリッド同期

### 5. 課題提出
- 特定チャプター（13箇所）での課題提出ボタン表示
- ユーザー別Google Sheetsへのリンク
- チャプターからの往復ナビゲーション

---

## 技術スタック

### フロントエンド
- **HTML5/CSS3**: セマンティックマークアップ、レスポンシブデザイン
- **JavaScript (ES6+)**: モジュール化されたクライアントサイドロジック
- **LocalStorage**: クライアント側データ永続化

### バックエンド/ツール
- **Python 3**: Notion API統合スクリプト
  - `notion-client`: Notion API クライアント
  - `requests`: HTTP通信
- **Notion API**: コンテンツ管理システム
- **Google Sheets API**: 課題提出・進捗管理

### セキュリティ対策
- **XSS対策**: `innerHTML`回避、`textContent`/`createElement`使用
- **環境変数管理**: 機密情報の外部化
- **入力バリデーション**: ユーザー入力の検証

---

## プロジェクト構成

```
learning/
├── index.html              # ログインページ
├── home.html              # ホームダッシュボード
├── curriculum.html        # カリキュラム一覧
├── chapter.html           # チャプター表示ページ
├── assignment.html        # 課題提出ページ
│
├── css/
│   └── style.css         # メインスタイルシート
│
├── js/
│   ├── config.js         # API設定（要作成、.gitignoreで除外）
│   ├── config.example.js # 設定ファイルのテンプレート
│   ├── common.js         # 共通ヘルパー関数 ✨NEW
│   ├── app-config.js     # アプリケーション設定 ✨NEW
│   ├── auth.js           # 認証システム
│   ├── progress.js       # 進捗管理（基本クラス）
│   ├── hybrid-progress.js # ハイブリッド進捗管理
│   ├── sheets-api-simple.js # Google Sheets API
│   └── user-assignments.js # ユーザー別課題シートURL
│
├── content/              # HTMLコンテンツファイル
│   ├── lesson1-chapter1.html
│   ├── lesson1-chapter2.html
│   └── ... (全27ファイル)
│
├── images/               # 画像ファイル
│   ├── lesson1/
│   ├── lesson2/
│   └── ...
│
├── scripts/              # Python変換スクリプト
│   ├── notion_utils.py   # 共通変換ユーティリティ ✨NEW
│   ├── notion-to-html.py # 単一ページ変換
│   └── batch-convert-notion.py # 一括変換
│
├── .gitignore
└── README.md
```

---

## セットアップ

### 前提条件

- **Python 3.7以上**
- **pip**（Pythonパッケージマネージャー）
- **Notion API キー**
- **Google Apps Script デプロイURL**（課題提出機能用）

### インストール手順

#### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd learning
```

#### 2. Python依存関係のインストール

```bash
pip install notion-client requests
```

#### 3. 設定ファイルの作成

`js/config.example.js`を`js/config.js`にコピーして編集：

```bash
cp js/config.example.js js/config.js
```

`js/config.js`を編集：

```javascript
const CONFIG = {
    gasApiUrl: 'YOUR_GOOGLE_APPS_SCRIPT_URL',
    users: [
        { userId: 'demo456', password: 'demo123', name: 'デモユーザー' },
        { userId: 'test123', password: 'test456', name: 'テストユーザー' },
        // ...他のユーザー
    ]
};
```

> **⚠️ 重要**: `config.js`は`.gitignore`で除外されているため、Git管理されません。

#### 4. Notion API キーの設定

**Windows:**
```cmd
set NOTION_API_KEY=your_notion_api_key_here
```

**Mac/Linux:**
```bash
export NOTION_API_KEY=your_notion_api_key_here
```

または、`.env`ファイルに記載：
```
NOTION_API_KEY=your_notion_api_key_here
```

#### 5. ローカルサーバーの起動

```bash
python -m http.server 3000
```

ブラウザで `http://localhost:3000` を開きます。

---

## 使い方

### ユーザーとしての利用

#### 1. ログイン
- `index.html`でユーザーID/パスワードを入力
- **デモアカウント**:
  - ユーザーID: `demo456`
  - パスワード: `demo123`

#### 2. カリキュラム閲覧
- ホーム画面でレッスンを選択
- サイドバーからチャプターを選択
- コンテンツを読む

#### 3. 学習進捗の記録
- チャプター学習後、「チャプターの学習を完了しました」ボタンをクリック
- 進捗が自動保存されます（LocalStorage + Google Sheets）
- 完了チャプターはサイドバーでチェックマーク表示

#### 4. 課題提出
- 対象チャプター（L1C6, L1C7, L2C4, L3C2, L3C4, L4C2, L4C4, L5全章）で「📝 課題を提出する」ボタンが表示
- クリックすると個人用Google Sheetsが新しいタブで開きます
- 課題を記入後、元のチャプターに戻るボタンで戻れます

### 管理者向け：コンテンツ更新

#### 単一チャプターの更新

```bash
cd scripts
set NOTION_API_KEY=your_key  # Windows
# または export NOTION_API_KEY=your_key  # Mac/Linux

python notion-to-html.py <notion_page_id> lesson1-chapter1.html
```

**例:**
```bash
python notion-to-html.py 29c3f0bae9be816e80d4e285a3399c12 lesson1-chapter1.html
```

#### 全チャプターの一括更新

```bash
cd scripts
python batch-convert-notion.py
```

> **注**: `batch-convert-notion.py`内のチャプターリストを事前に更新してください。

---

## 開発ガイド

### コーディング規約

#### JavaScript
- **命名規則**: キャメルケース（`camelCase`）
- **定数**: 大文字スネークケース（`STORAGE_KEYS`, `CHAPTER_CONFIG`）
- **関数**: 動詞から始める（`loadContent`, `saveProgress`）
- **XSS対策**: `innerHTML`は使用禁止 → `textContent`または`createElement`を使用

#### Python
- **命名規則**: スネークケース（`snake_case`）
- **関数**: docstringを必ず記述
- **エラーハンドリング**: try-exceptで適切な例外処理

### 主要モジュールの説明

#### `js/common.js` - 共通ヘルパー関数

XSS対策済みのDOM操作ヘルパー、LocalStorage操作、URL操作などを提供。

```javascript
// LocalStorage操作
StorageHelper.getItem(key, defaultValue)
StorageHelper.setItem(key, value)
StorageHelper.removeItem(key)

// DOM操作（XSS対策済み）
DOMHelper.setTextContent(element, text)
DOMHelper.createElement(tag, attributes, content)
DOMHelper.toggleDisplay(element, show)

// エラー表示
ErrorHelper.showError(container, message, options)
ErrorHelper.clearError(container)

// URL操作
URLHelper.getQueryParam(name)
URLHelper.buildQueryString(params)

// 文字列操作
StringHelper.escapeHTML(str)
StringHelper.truncate(str, maxLength)
```

#### `js/app-config.js` - アプリケーション設定

マジックナンバー/ストリングを一元管理。

```javascript
// チャプター設定
CHAPTER_CONFIG.CHAPTERS_WITH_ASSIGNMENT  // 課題提出対象チャプター
CHAPTER_CONFIG.CONTENT_PATH_TEMPLATE     // コンテンツファイルパス

// LocalStorageキー
STORAGE_KEYS.CURRENT_USER                // 現在のユーザー
STORAGE_KEYS.USER_PROGRESS_PREFIX        // 進捗データのプレフィックス

// UI設定
UI_CONFIG.ERROR_AUTO_CLEAR_DELAY         // エラーメッセージの自動クリア時間
UI_CONFIG.SUCCESS_MESSAGE_DURATION       // 成功メッセージの表示時間

// メッセージテンプレート
MESSAGES.ERRORS.NETWORK                  // ネットワークエラー
MESSAGES.SUCCESS.CHAPTER_COMPLETED       // チャプター完了
```

#### `scripts/notion_utils.py` - Notion変換ユーティリティ

Notionブロックの変換処理を集約した共通モジュール。

```python
from notion_utils import NotionContentConverter

# 初期化
converter = NotionContentConverter(images_dir='../images')

# ブロックをHTMLに変換
html = converter.block_to_html(block, lesson_num, chapter_num)

# リッチテキストをHTMLに変換
html = converter.rich_text_to_html(rich_text_array)

# ブロックリストを処理してHTMLボディを生成
body_html = converter.process_blocks(blocks, lesson_num, chapter_num)

# 完全なHTMLドキュメント生成
document = converter.generate_html_document(title, body_html)
```

**対応ブロックタイプ:**
- `paragraph`, `heading_1/2/3`
- `bulleted_list_item`, `numbered_list_item`
- `image`, `code`, `quote`, `callout`, `divider`

**リッチテキスト装飾:**
- 太字、斜体、下線、取り消し線、インラインコード
- 文字色（9色）、背景色（9色）
- リンク、改行

### 新機能の追加方法

#### 新しいチャプターの追加

1. **Notionでコンテンツ作成**
   - Notionで新しいページを作成
   - ページURLからページIDを取得

2. **HTMLに変換**
   ```bash
   cd scripts
   python notion-to-html.py <page_id> lesson1-chapter8.html
   ```

3. **カリキュラムに追加**
   - `curriculum.html`の該当レッスンに追加
   - サイドバー生成ロジックに追加（`chapter.html`の`CURRICULUM`）

4. **課題提出が必要な場合**
   - `js/app-config.js`の`CHAPTERS_WITH_ASSIGNMENT`に追加
   ```javascript
   CHAPTERS_WITH_ASSIGNMENT: [
       // ...既存のチャプター
       'lesson1-chapter8'  // 追加
   ]
   ```
   - `js/user-assignments.js`に全ユーザー分のシートURLを追加

---

## アーキテクチャ

### システム全体のデータフロー

```
[Notion CMS]
    ↓ (Python Scripts: notion-to-html.py)
[HTML Content Files in content/]
    ↓ (fetch API)
[Browser]
    ↓ ← → [LocalStorage]  (即座に反映)
    ↓
[Google Sheets API]  (30秒ごとに同期)
```

### 認証フロー

```
1. ユーザーがログイン画面でID/PWを入力
   ↓
2. auth.js が config.js のユーザーリストと照合
   ↓
3. 成功時、ユーザー情報をLocalStorageに保存
   Key: 'currentUser'
   Value: { userId, name }
   ↓
4. 各ページでrequireAuth()により認証チェック
   ↓
5. 未認証時はindex.htmlにリダイレクト
```

### 進捗管理フロー（ハイブリッド同期）

```
【書き込み】
1. チャプター完了ボタンクリック
   ↓
2. progress.js/hybrid-progress.js
   ↓
3. LocalStorageに保存（即座）
   Key: userProgress_{userId}
   Value: {
     completedChapters: [
       { lessonId, chapterId, completedAt }
     ],
     lastUpdated: timestamp
   }
   ↓
4. Google Apps Scriptに送信（バックグラウンド）
   ↓
5. Google Sheetsに書き込み

【読み取り・同期】
1. 30秒ごとにsetIntervalで実行
   ↓
2. Google Sheets API経由で全ユーザー進捗を取得
   ↓
3. LocalStorageと比較
   ↓
4. より新しいデータでLocalStorageを更新
   ↓
5. 画面に反映（サイドバー、ダッシュボード）
```

### Notionコンテンツ変換フロー

```
1. Notion API経由でページブロックを取得
   ↓
2. NotionContentConverter.block_to_html()
   各ブロックタイプに応じて処理
   ├─ paragraph → <p>
   ├─ heading_1/2/3 → <h1>/<h2>/<h3>
   ├─ image → ダウンロード → <img src="local_path">
   ├─ bulleted_list_item → <ul><li>
   ├─ numbered_list_item → <ol><li>
   ├─ code → <pre><code>
   ├─ quote → <blockquote>
   ├─ callout → <div class="callout">
   └─ divider → <hr>
   ↓
3. rich_text_to_html()
   テキスト装飾を適用
   ├─ 太字 → <strong>
   ├─ 斜体 → <em>
   ├─ 下線 → <u>
   ├─ 取り消し線 → <s>
   ├─ インラインコード → <code>
   ├─ 文字色・背景色 → <span style="...">
   └─ リンク → <a href="...">
   ↓
4. process_blocks()
   連続するリスト項目を<ul>/<ol>でグループ化
   ↓
5. generate_html_document()
   完全なHTMLドキュメントを生成（スタイル含む）
   ↓
6. content/ディレクトリに保存
   ファイル名: lessonX-chapterY.html
```

---

## セキュリティ

### 実装済みのセキュリティ対策

#### 1. XSS（クロスサイトスクリプティング）対策

**問題点（修正前）:**
```javascript
// ❌ 危険: ユーザー入力をinnerHTMLで挿入
element.innerHTML = `<p>${error.message}</p>`;
```

**対策（修正後）:**
```javascript
// ✅ 安全: textContentまたはcreateElementを使用
const errorDiv = document.createElement('div');
errorDiv.className = 'error-message';

const errorPara = document.createElement('p');
errorPara.textContent = error.message;  // XSS対策

errorDiv.appendChild(errorPara);
```

**対策箇所:**
- [chapter.html:437-468](chapter.html#L437-L468) - `showContentError()`関数
- [assignment.html:156-215](assignment.html#L156-L215) - メッセージ表示処理

#### 2. 機密情報の保護

**問題点（修正前）:**
```python
# ❌ 危険: APIキーをハードコード
NOTION_API_KEY = 'secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx'
```

**対策（修正後）:**
```python
# ✅ 安全: 環境変数から取得
NOTION_API_KEY = os.environ.get('NOTION_API_KEY')
if not NOTION_API_KEY:
    print("❌ エラー: NOTION_API_KEY 環境変数が設定されていません")
    sys.exit(1)
```

**対策箇所:**
- [scripts/notion-to-html.py:25-33](scripts/notion-to-html.py#L25-L33)
- [scripts/batch-convert-notion.py:24-32](scripts/batch-convert-notion.py#L24-L32)
- `js/config.js`は`.gitignore`で除外

#### 3. 入力バリデーション

```javascript
// ユーザーIDのバリデーション（app-config.js）
REGEX_PATTERNS.USER_ID = /^[a-zA-Z0-9_-]+$/;

// チャプターキーのバリデーション
REGEX_PATTERNS.CHAPTER_KEY = /^lesson(\d+)-chapter(\d+)$/;
```

### ⚠️ 今後の改善が必要な点

このシステムは学習・デモ目的です。**本番環境では以下を改善してください：**

#### 1. 認証システム
**現在の問題:**
- パスワードが平文でハードコード
- セッション管理がLocalStorage（盗聴リスク）

**推奨される対策:**
- サーバーサイド認証の実装
- パスワードのハッシュ化（bcrypt等）
- JWTトークンの使用
- HTTPOnly CookieによるセッFション管理

#### 2. APIキーの保護
**現在の問題:**
- `config.js`がクライアント側に存在
- ブラウザからAPIキーが見える

**推奨される対策:**
- サーバーサイドプロキシの実装
- 環境変数でのAPIキー管理
- Google Apps ScriptのAPIキー制限設定

**例: Node.js + Express**
```javascript
// server.js
app.post('/api/save-progress', async (req, res) => {
    const apiKey = process.env.GOOGLE_API_KEY;  // サーバー側で管理
    // Google Sheetsに保存処理
});
```

#### 3. CSP（Content Security Policy）の設定

```html
<!-- HTMLヘッダーに追加 -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

---

## トラブルシューティング

### Q1: コンテンツが表示されない

**症状:**
- チャプターページが空白
- 「コンテンツの読み込みに失敗しました」エラー

**解決方法:**

1. **ブラウザのコンソールを確認**
   - `F12`キーを押してDevToolsを開く
   - `Console`タブでエラーメッセージを確認

2. **ファイルパスを確認**
   ```bash
   ls content/lesson1-chapter1.html  # ファイルが存在するか
   ```
   - ファイル名が正しいか（大文字小文字、ハイフンの位置）

3. **CORSエラーの場合**
   - HTTPサーバー経由でアクセスしているか確認
   - `file://`プロトコルではなく`http://localhost:3000`を使用

### Q2: 進捗が保存されない

**症状:**
- チャプター完了ボタンをクリックしても反映されない
- ページをリロードすると進捗が消える

**解決方法:**

1. **LocalStorageの確認**
   - DevTools > Application > Local Storage
   - `userProgress_{userId}`キーが存在するか確認

2. **ブラウザのプライベートモード**
   - プライベート/シークレットモードではLocalStorageが無効化される
   - 通常モードで試す

3. **Google Sheets同期の確認**
   - `js/config.js`の`gasApiUrl`が正しく設定されているか
   - ブラウザのConsoleでネットワークエラーがないか確認

### Q3: Notion変換エラー

**症状:**
- `python notion-to-html.py`実行時にエラー

**解決方法:**

1. **API キーの確認**
   ```bash
   echo %NOTION_API_KEY%   # Windows
   echo $NOTION_API_KEY    # Mac/Linux
   ```

2. **ページIDの確認**
   - Notion URLから正しいページIDを抽出
   - 32文字の16進数文字列（例: `29c3f0bae9be816e80d4e285a3399c12`）

3. **Pythonパッケージの確認**
   ```bash
   pip list | grep notion-client
   pip list | grep requests
   ```

   インストールされていない場合:
   ```bash
   pip install notion-client requests
   ```

### Q4: 課題提出ボタンが表示されない

**症状:**
- 対象チャプターで課題提出ボタンが表示されない

**解決方法:**

1. **設定ファイルの確認**
   - `js/app-config.js`の`CHAPTERS_WITH_ASSIGNMENT`を確認
   - 現在のチャプターキーが含まれているか

2. **スクリプトの読み込み確認**
   - `chapter.html`に`<script src="js/app-config.js"></script>`が存在するか
   - ブラウザConsoleで`CHAPTER_CONFIG`が定義されているか確認

### Q5: 画像が表示されない

**症状:**
- Notionから変換したHTMLで画像が表示されない

**解決方法:**

1. **画像ファイルの存在確認**
   ```bash
   ls images/lesson1/
   ```

2. **パスの確認**
   - HTMLファイル内の画像パスが`../images/lesson1/...`形式になっているか

3. **Notion画像のダウンロード失敗**
   - Pythonスクリプト実行時のログで`⚠️ 画像のダウンロードに失敗`がないか確認
   - ネットワーク接続を確認

---

## カリキュラム内容

### PC初心者向けカリキュラム（全27チャプター、5レッスン）

#### Lesson 1: 基礎知識（7チャプター）
- Chapter 1: はじめに
- Chapter 2: 基本操作
- Chapter 3: タイピング練習
- Chapter 4: ファイル管理
- Chapter 5: インターネット基礎
- Chapter 6: メール操作 ✅ 課題提出あり
- Chapter 7: セキュリティ基礎 ✅ 課題提出あり

#### Lesson 2: 応用編（4チャプター）
- Chapter 1: Word基礎
- Chapter 2: Excel基礎
- Chapter 3: PowerPoint基礎
- Chapter 4: クラウドサービス ✅ 課題提出あり

#### Lesson 3: 実践編（4チャプター）
- Chapter 1: 文書作成
- Chapter 2: データ入力 ✅ 課題提出あり
- Chapter 3: プレゼンテーション作成
- Chapter 4: 総合演習 ✅ 課題提出あり

#### Lesson 4: 発展編（6チャプター）
- Chapter 1: 画像編集
- Chapter 2: 動画編集基礎 ✅ 課題提出あり
- Chapter 3: Webブラウザ活用
- Chapter 4: オンライン会議 ✅ 課題提出あり
- Chapter 5: SNS活用
- Chapter 6: 総合課題

#### Lesson 5: 総まとめ（6チャプター）
- Chapter 1: 総復習 ✅ 課題提出あり
- Chapter 2: ケーススタディ1 ✅ 課題提出あり
- Chapter 3: ケーススタディ2 ✅ 課題提出あり
- Chapter 4: ケーススタディ3 ✅ 課題提出あり
- Chapter 5: ケーススタディ4 ✅ 課題提出あり
- Chapter 6: 修了テスト ✅ 課題提出あり

---

## 貢献

バグ報告や機能リクエストは、GitHubのIssuesセクションにお願いします。

### プルリクエストの流れ

1. このリポジトリをフォーク
2. フィーチャーブランチを作成
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. 変更をコミット
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. ブランチをプッシュ
   ```bash
   git push origin feature/amazing-feature
   ```
5. プルリクエストを作成

---

## 変更履歴

### v2.0.0 (2025-01-18) - セキュリティ・リファクタリング版

**セキュリティ強化:**
- ✅ XSS脆弱性の修正（innerHTML → textContent/createElement）
- ✅ 機密情報のハードコード削除（環境変数化）
- ✅ .gitignoreの適切な設定

**コード品質向上:**
- ✅ 共通モジュールの作成
  - Python: `notion_utils.py`
  - JavaScript: `common.js`, `app-config.js`
- ✅ マジックストリング/ナンバーの設定ファイル化
- ✅ エラーハンドリングの強化
- ✅ 命名規則の統一

**保守性向上:**
- ✅ 詳細なコメント・docstringの追加
- ✅ 長い関数の分割（単一責任の原則）
- ✅ 包括的なREADMEドキュメント作成

### v1.0.0 - 初版リリース
- ユーザー認証システム
- カリキュラム・チャプター表示
- 進捗管理機能
- 課題提出機能
- Notion連携

---

## ライセンス

このプロジェクトは教育目的で作成されています。

---

## サポート

問題が解決しない場合は、以下を確認してください：

1. [トラブルシューティング](#トラブルシューティング)セクション
2. GitHubのIssuesページ
3. ブラウザの開発者ツール（F12）のConsoleタブ

---

**開発**: LMS Development Team
**最終更新**: 2025年1月18日
