# 📚 Notionコンテンツインポートツール

このツールは、NotionからエクスポートしたHTMLファイルを自動的に整理してLMSに取り込みます。

## ✅ 現在の状態

- **学習カリキュラム（基礎マスターコース）**: コンテンツ配置済み、進捗管理機能あり
- **PC初心者用カリキュラム**: UIの準備完了、コンテンツ待ち（進捗管理なし・読み取り専用）

## 🚀 使い方

### ステップ1: Notionからエクスポート

1. Notionでカリキュラムページを開く
2. 右上の「…」→「エクスポート」
3. **「HTMLを含める」** を選択
4. **「サブページを含める」** をON
5. 「エクスポート」をクリックしてZIPファイルをダウンロード

### ステップ2: スクリプトを実行

```bash
cd scripts

# PC初心者用カリキュラムの場合
python import-notion-content.py ダウンロードしたZIPファイル.zip pc-beginner

# 基礎マスターコースの場合
python import-notion-content.py ダウンロードしたZIPファイル.zip basic-course
```

### ステップ3: 確認

- `content/` ディレクトリにHTMLファイルが追加される
- `images/` ディレクトリに画像が整理される

## 📋 例

```bash
# 例: PC初心者用カリキュラムをインポート
python import-notion-content.py ~/Downloads/PC初心者カリキュラム-export.zip pc-beginner

# 実行結果:
# content/pc-step1-chapter1.html
# content/pc-step1-chapter2.html
# images/pc-beginner/step1/chapter1-image1.png
# images/pc-beginner/step1/chapter1-image2.png
```

## 🔧 スクリプトが行うこと

1. ✅ ZIPファイルを解凍
2. ✅ HTMLファイルを検索
3. ✅ ファイル名からレッスン・チャプター番号を抽出
4. ✅ ファイル名をリネーム
   - `STEP 1 パソコンの基本操作 abc123.html` → `pc-step1-chapter1.html`
5. ✅ 画像ファイルをリネーム
   - `Untitled 1.png` → `chapter1-image1.png`
6. ✅ HTML内の画像パスを自動更新
   - `src="images/Untitled 1.png"` → `src="../images/pc-beginner/step1/chapter1-image1.png"`
7. ✅ NotionのIDを削除
8. ✅ 整理されたファイルを保存

## 📝 ファイル命名規則

### PC初心者用カリキュラム

```
content/pc-step1-chapter1.html
content/pc-step1-chapter2.html
content/pc-step2-chapter1.html
...

images/pc-beginner/step1/chapter1-image1.png
images/pc-beginner/step1/chapter1-image2.png
images/pc-beginner/step2/chapter1-image1.png
...
```

### 基礎マスターコース

```
content/lesson1-chapter1.html
content/lesson1-chapter2.html
content/lesson2-chapter1.html
...

images/lesson1/chapter1-image1.png
images/lesson1/chapter1-image2.png
images/lesson2/chapter1-image1.png
...
```

## ⚠️ 注意事項

- Notionのファイル名に **「STEP X」** または **「Lesson X」** が含まれている必要があります
- **「Chapter Y」** が含まれていると、チャプター番号も自動抽出されます
- 画像ファイルは `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg` に対応

## 🐛 トラブルシューティング

### エラー: ファイルが見つかりません

ZIPファイルのパスが正しいか確認してください。

```bash
# 絶対パスで指定
python import-notion-content.py C:/Users/tooth/Downloads/export.zip pc-beginner

# または相対パスで指定
python import-notion-content.py ../Downloads/export.zip pc-beginner
```

### エラー: レッスン/チャプター番号が見つかりません

Notionのページタイトルに「STEP」または「Lesson」が含まれているか確認してください。

## 📞 サポート

問題が発生した場合は、以下を確認してください：
- ZIPファイルが正しく解凍できるか
- NotionエクスポートにHTMLファイルが含まれているか
- ファイル名に「STEP」または「Lesson」が含まれているか
