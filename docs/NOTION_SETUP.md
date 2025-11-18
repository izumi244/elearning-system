# Notion連携セットアップガイド

このドキュメントでは、Notion APIを使用してコンテンツを管理・変換する方法を詳しく説明します。

## 目次

- [Notion APIキーの取得](#notion-apiキーの取得)
- [Notionページの準備](#notionページの準備)
- [ページIDの取得方法](#ページidの取得方法)
- [コンテンツ変換の実行](#コンテンツ変換の実行)
- [対応ブロックタイプ](#対応ブロックタイプ)
- [トラブルシューティング](#トラブルシューティング)

---

## Notion APIキーの取得

### 1. Notion Integrationの作成

1. [Notion Developers](https://www.notion.so/my-integrations) にアクセス
2. 「New integration」をクリック
3. 必要な情報を入力:
   - **Name**: `Learning Management System` (任意)
   - **Associated workspace**: 使用するワークスペースを選択
   - **Type**: Internal integration
4. 「Submit」をクリック
5. **Internal Integration Token** をコピー（これがAPIキー）

### 2. APIキーの設定

**Windows:**
```cmd
set NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Mac/Linux:**
```bash
export NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**永続的に設定（推奨）:**

`.env`ファイルを作成:
```
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Notionページの準備

### 1. Notionでコンテンツページを作成

1. Notionワークスペースで新しいページを作成
2. ページタイトルを設定（例: "Lesson 1 - Chapter 1"）
3. コンテンツを作成:
   - 見出し（Heading 1, 2, 3）
   - 段落（Paragraph）
   - 箇条書き（Bulleted list）
   - 番号付きリスト（Numbered list）
   - 画像（Image）
   - コードブロック（Code）
   - 引用（Quote）
   - コールアウト（Callout）
   - 区切り線（Divider）

### 2. Integrationにページへのアクセス権を付与

1. ページ右上の「…」メニューをクリック
2. 「Add connections」を選択
3. 作成したIntegration（例: "Learning Management System"）を選択
4. 「Confirm」をクリック

> **重要**: この手順を忘れると、APIからページにアクセスできません！

---

## ページIDの取得方法

### 方法1: URLから取得（推奨）

Notionページを開いた時のURLから抽出:

```
https://www.notion.so/My-Page-29c3f0bae9be816e80d4e285a3399c12
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                        ↑ ページID
```

**形式:**
- 32文字の16進数文字列
- ハイフン区切りの場合もあり: `29c3f0ba-e9be-816e-80d4-e285a3399c12`
- ハイフンは削除して使用

### 方法2: 「Copy link」から取得

1. ページ右上の「Share」ボタンをクリック
2. 「Copy link」をクリック
3. URLから32文字の部分を抽出

**例:**
```
https://www.notion.so/workspace/Lesson-1-Chapter-1-29c3f0bae9be816e80d4e285a3399c12?pvs=4
                                                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

ページID: `29c3f0bae9be816e80d4e285a3399c12`

---

## コンテンツ変換の実行

### 単一ページの変換

```bash
cd scripts

# APIキーを設定（セッションごとに必要）
set NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Windows
# または
export NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Mac/Linux

# 変換実行
python notion-to-html.py <page_id> <output_filename>
```

**例:**
```bash
python notion-to-html.py 29c3f0bae9be816e80d4e285a3399c12 lesson1-chapter1.html
```

**実行結果:**
```
============================================================
📚 Notion → HTML 変換ツール
============================================================

📝 ページ 'Lesson 1 - Chapter 1' を処理中...
  📦 15 個のブロックを取得
  ⚠️  画像のダウンロードに失敗: HTTPSConnectionPool(host='www.notion.so', port=443)...
  ✅ 保存完了: ..\content\lesson1-chapter1.html

============================================================
✅ 変換完了！
============================================================
```

### 一括変換（全チャプター）

#### 1. チャプターリストの設定

`scripts/batch-convert-notion.py`を編集:

```python
def get_all_chapters(self):
    """全Lessonのチャプターリスト（手動）"""
    print("📚 全レッスンのチャプター情報を取得中...")

    # 全LessonのURL一覧
    all_lessons = {
        '1': [
            {
                'page_id': '29c3f0bae9be816e80d4e285a3399c12',
                'chapter': '1',
                'title': 'はじめに'
            },
            {
                'page_id': '1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p',
                'chapter': '2',
                'title': '基本操作'
            },
            # ... 他のチャプター
        ],
        '2': [
            # Lesson 2のチャプター
        ],
        # ...
    }
```

#### 2. 一括変換の実行

```bash
cd scripts
python batch-convert-notion.py
```

**実行結果:**
```
============================================================
📚 Notion → HTML 一括変換ツール
============================================================
📚 全レッスンのチャプター情報を取得中...

✅ 27 個のチャプターを発見しました

============================================================

📝 変換中: Lesson 1 - はじめに
    📦 15 個のブロックを取得
    ✅ 保存完了: ..\content\lesson1-chapter1.html

📝 変換中: Lesson 1 - 基本操作
    📦 20 個のブロックを取得
    ⚠️  画像のダウンロードに失敗: ...
    ✅ 保存完了: ..\content\lesson1-chapter2.html

...

============================================================
✅ 変換完了: 27/27 個のチャプターを変換しました
============================================================
```

---

## 対応ブロックタイプ

### 基本ブロック

| Notionブロック | HTML出力 | 対応状況 |
|---|---|---|
| Paragraph | `<p>` | ✅ |
| Heading 1 | `<h1>` | ✅ |
| Heading 2 | `<h2>` | ✅ |
| Heading 3 | `<h3>` | ✅ |
| Bulleted list | `<ul><li>` | ✅ |
| Numbered list | `<ol><li>` | ✅ |
| Quote | `<blockquote>` | ✅ |
| Divider | `<hr>` | ✅ |
| Callout | `<div class="callout">` | ✅ |

### メディア

| Notionブロック | HTML出力 | 対応状況 |
|---|---|---|
| Image | `<img>` または `<figure>` | ✅ 自動ダウンロード |
| Code | `<pre><code>` | ✅ |
| Table | `<table>` | ✅ (batch-convert-notion.pyのみ) |

### 未対応ブロック

以下のブロックは現在未対応です:

- Video
- File
- PDF
- Bookmark
- Link preview
- Embed
- Column layout
- Toggle
- Child page
- Child database

> これらのブロックは変換時にスキップされます。

### リッチテキスト装飾

以下の装飾がサポートされています:

| Notion装飾 | HTML出力 |
|---|---|
| **太字** | `<strong>` |
| *斜体* | `<em>` |
| <u>下線</u> | `<u>` |
| ~~取り消し線~~ | `<s>` |
| `インラインコード` | `<code>` |
| リンク | `<a href="...">` |
| 文字色（9色） | `<span style="color: #...">` |
| 背景色（9色） | `<span style="background-color: #...">` |

### 色の対応表

**文字色:**
- Gray: `#9B9A97`
- Brown: `#64473A`
- Orange: `#D9730D`
- Yellow: `#DFAB01`
- Green: `#0F7B6C`
- Blue: `#0B6E99`
- Purple: `#6940A5`
- Pink: `#AD1A72`
- Red: `#E03E3E`

**背景色:**
- Gray background: `#F1F1EF`
- Brown background: `#F4EEEE`
- Orange background: `#FAEBDD`
- Yellow background: `#FBF3DB`
- Green background: `#EDF3EC`
- Blue background: `#E7F3F8`
- Purple background: `#F6F3F9`
- Pink background: `#FAF1F5`
- Red background: `#FDEBEC`

---

## 画像の処理

### 自動ダウンロード

Notion上の画像は自動的にダウンロードされ、ローカルに保存されます:

```
images/
├── lesson1/
│   ├── chapter1-image1.png
│   ├── chapter1-image2.jpg
│   └── chapter2-image1.png
├── lesson2/
│   └── chapter1-image1.png
└── ...
```

### 対応フォーマット

- PNG (.png)
- JPEG (.jpg)
- GIF (.gif)

### キャプション

Notionで画像にキャプションを設定すると、HTMLでは`<figure>`タグで出力されます:

**Notion:**
```
[画像]
キャプション: グラフの説明
```

**HTML出力:**
```html
<figure>
    <img src="../images/lesson1/chapter1-image1.png" alt="グラフの説明">
    <figcaption>グラフの説明</figcaption>
</figure>
```

---

## トラブルシューティング

### エラー: NOTION_API_KEY 環境変数が設定されていません

**原因:**
環境変数が設定されていない

**解決方法:**
```bash
# Windows
set NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Mac/Linux
export NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### エラー: APIリクエストが403 Forbiddenで失敗

**原因:**
NotionページにIntegrationのアクセス権が付与されていない

**解決方法:**
1. Notionページを開く
2. 右上の「…」メニュー → 「Add connections」
3. Integrationを選択して追加

### エラー: ページIDが見つからない

**原因:**
- ページIDが間違っている
- ページが削除された
- アクセス権がない

**解決方法:**
1. NotionページのURLから正しいページIDを確認
2. ページが存在するか確認
3. Integrationのアクセス権を確認

### 警告: 画像のダウンロードに失敗

**原因:**
- ネットワーク接続の問題
- Notion側の一時的な制限
- 画像URLの有効期限切れ

**解決方法:**
1. インターネット接続を確認
2. 数分待ってから再試行
3. Notionで画像を再アップロード

### エラー: ファイル名は 'lessonX-chapterY.html' の形式にしてください

**原因:**
出力ファイル名が規定の形式と一致しない

**解決方法:**
```bash
# ❌ 間違った形式
python notion-to-html.py <page_id> chapter1.html
python notion-to-html.py <page_id> lesson1_chapter1.html

# ✅ 正しい形式
python notion-to-html.py <page_id> lesson1-chapter1.html
python notion-to-html.py <page_id> lesson2-chapter3.html
```

### Pythonモジュールがインストールされていない

**エラーメッセージ:**
```
ModuleNotFoundError: No module named 'notion_client'
```

**解決方法:**
```bash
pip install notion-client requests
```

---

## ベストプラクティス

### 1. Notionでのコンテンツ作成

- **構造化**: 見出しを使って階層構造を作成
- **画像最適化**: 大きすぎる画像は事前に圧縮
- **キャプション**: 画像には必ずキャプションを付ける
- **リンク**: 外部リンクは必ず動作確認

### 2. 定期的な変換

コンテンツを更新したら、すぐに変換を実行:

```bash
# 単一ページの更新
python notion-to-html.py <page_id> lesson1-chapter1.html

# または全体を再変換
python batch-convert-notion.py
```

### 3. バージョン管理

変換後のHTMLファイルはGitでバージョン管理:

```bash
git add content/lesson1-chapter1.html
git commit -m "Update lesson1-chapter1 content from Notion"
git push
```

### 4. テスト

変換後は必ずブラウザで確認:

```bash
python -m http.server 3000
# ブラウザで http://localhost:3000 を開く
```

---

## 高度な使用方法

### カスタムスタイルの適用

変換後のHTMLには、`notion_utils.py`で定義されたスタイルが適用されます。

カスタマイズしたい場合は、`scripts/notion_utils.py`の`generate_html_document()`メソッドを編集:

```python
def generate_html_document(self, title, body_html):
    return f"""<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        /* ここにカスタムCSSを追加 */
        body {{
            font-family: 'Your Custom Font', sans-serif;
        }}
    </style>
</head>
<body>
    <h1>{title}</h1>
{body_html}
</body>
</html>"""
```

---

## 関連ドキュメント

- [Notion API Documentation](https://developers.notion.com/)
- [notion-client Python Library](https://github.com/ramnes/notion-sdk-py)
- [メインREADME](../README.md)
- [Google Sheetsセットアップガイド](GOOGLE_SHEETS_SETUP.md)

---

**最終更新**: 2025年1月18日
