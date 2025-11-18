# Google Sheets連携セットアップガイド

このドキュメントでは、Google Sheetsを使った進捗管理と課題提出機能のセットアップ方法を詳しく説明します。

## 目次

- [概要](#概要)
- [Google Apps Scriptのセットアップ](#google-apps-scriptのセットアップ)
- [ユーザー別課題シートの作成](#ユーザー別課題シートの作成)
- [進捗管理シートの設定](#進捗管理シートの設定)
- [フロントエンドの設定](#フロントエンドの設定)
- [動作確認](#動作確認)
- [トラブルシューティング](#トラブルシューティング)

---

## 概要

### システム構成

```
[ブラウザ] ← → [LocalStorage]  (即座に反映)
    ↓
[Google Apps Script]  (書き込み: doPost())
    ↓
[Google Sheets]  (データ保存)
    ↑
[Google Sheets API]  (読み取り: 30秒ごと同期)
```

### 2つの機能

1. **進捗管理**: チャプター完了状態をGoogle Sheetsに保存・同期
2. **課題提出**: ユーザー別のGoogle Sheetsで課題を管理

---

## Google Apps Scriptのセットアップ

### 1. 新しいGoogle Sheetsを作成

1. [Google Sheets](https://sheets.google.com/) にアクセス
2. 「空白」をクリックして新しいスプレッドシートを作成
3. 名前を「LMS進捗管理」に変更

### 2. Apps Scriptエディタを開く

1. メニューから「拡張機能」→「Apps Script」をクリック
2. 新しいタブでApps Scriptエディタが開きます

### 3. スクリプトコードの追加

`Code.gs`に以下のコードを貼り付け:

```javascript
/**
 * 学習管理システム - Google Apps Script
 * チャプター完了データをGoogle Sheetsに保存
 */

function doPost(e) {
  try {
    // POSTデータを解析
    const data = JSON.parse(e.postData.contents);
    const userId = data.userId;
    const lessonId = data.lessonId;
    const chapterId = data.chapterId;
    const completedAt = data.completedAt;

    // スプレッドシートを取得
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Progress');

    // シートが存在しない場合は作成
    if (!sheet) {
      sheet = ss.insertSheet('Progress');
      // ヘッダー行を追加
      sheet.appendRow(['UserId', 'LessonId', 'ChapterId', 'CompletedAt', 'Timestamp']);
    }

    // データを追加
    sheet.appendRow([
      userId,
      lessonId,
      chapterId,
      completedAt,
      new Date().toISOString()
    ]);

    // 成功レスポンスを返す
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // エラーレスポンスを返す
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * テスト用GET関数
 */
function doGet(e) {
  return ContentService
    .createTextOutput('Learning Management System API is running')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

### 4. デプロイ

1. 「デプロイ」→「新しいデプロイ」をクリック
2. 「種類の選択」→「ウェブアプリ」を選択
3. 設定:
   - **説明**: `LMS Progress API v1`
   - **次のユーザーとして実行**: 自分（あなたのGoogleアカウント）
   - **アクセスできるユーザー**: 全員
4. 「デプロイ」をクリック
5. **ウェブアプリURL** をコピー
   - 例: `https://script.google.com/macros/s/AKfycbx.../exec`

> **重要**: このURLを`js/config.js`の`gasApiUrl`に設定します

---

## ユーザー別課題シートの作成

### 方法1: テンプレートから一括作成（推奨）

#### 1. マスターテンプレートの作成

1. 新しいGoogle Sheetsを作成
2. 名前を「課題提出テンプレート」に変更
3. 以下の構造でシートを作成:

| チャプター | 課題内容 | 提出日 | 備考 |
|---|---|---|---|
| Lesson 1 - Chapter 6 |  |  |  |
| Lesson 1 - Chapter 7 |  |  |  |
| Lesson 2 - Chapter 4 |  |  |  |
| ... |  |  |  |

#### 2. スクリプトでコピー作成

Apps Scriptエディタで新しい関数を追加:

```javascript
/**
 * ユーザー別課題シートを一括作成
 */
function createUserAssignmentSheets() {
  const templateId = 'YOUR_TEMPLATE_SPREADSHEET_ID';  // テンプレートのID
  const userIds = [
    'demo456', 'test123', 'user001', 'user002', 'user003',
    // ... 全27ユーザー
  ];

  const templateFile = DriveApp.getFileById(templateId);
  const destinationFolder = DriveApp.getFolderById('YOUR_FOLDER_ID');  // 保存先フォルダ

  userIds.forEach(userId => {
    // テンプレートをコピー
    const newFile = templateFile.makeCopy(`課題提出_${userId}`, destinationFolder);
    const newSheet = SpreadsheetApp.open(newFile);

    // 共有設定（リンクを知っている全員が編集可能）
    newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);

    // URLを出力
    Logger.log(`${userId}: ${newSheet.getUrl()}`);
  });
}
```

#### 3. 実行

1. `createUserAssignmentSheets`関数を選択
2. 「実行」をクリック
3. 承認プロセスを完了
4. ログから各ユーザーのスプレッドシートURLを取得

### 方法2: 手動作成

各ユーザーごとに:

1. 新しいGoogle Sheetsを作成
2. 名前を「課題提出_{userId}」に設定
3. 課題リストを作成
4. 共有設定で「リンクを知っている全員が編集可能」に設定
5. URLをコピー

---

## 進捗管理シートの設定

### シート構造

Apps Scriptで自動作成される「Progress」シートの構造:

| UserId | LessonId | ChapterId | CompletedAt | Timestamp |
|---|---|---|---|---|
| demo456 | lesson1 | chapter1 | 2025-01-18T10:30:00.000Z | 2025-01-18T10:30:05.123Z |
| demo456 | lesson1 | chapter2 | 2025-01-18T11:15:00.000Z | 2025-01-18T11:15:03.456Z |
| test123 | lesson1 | chapter1 | 2025-01-18T09:00:00.000Z | 2025-01-18T09:00:02.789Z |

### データの見方

- **UserId**: ユーザーID
- **LessonId**: レッスンID（例: lesson1, lesson2）
- **ChapterId**: チャプターID（例: chapter1, chapter2）
- **CompletedAt**: ユーザーが完了ボタンを押した日時
- **Timestamp**: サーバー側で記録した日時

---

## フロントエンドの設定

### 1. config.jsの作成

`js/config.example.js`を`js/config.js`にコピー:

```bash
cp js/config.example.js js/config.js
```

### 2. config.jsの編集

```javascript
const CONFIG = {
    // Google Apps ScriptのウェブアプリURL
    gasApiUrl: 'https://script.google.com/macros/s/AKfycbx.../exec',

    // ユーザーリスト
    users: [
        { userId: 'demo456', password: 'demo123', name: 'デモユーザー' },
        { userId: 'test123', password: 'test456', name: 'テストユーザー' },
        { userId: 'user001', password: 'pass001', name: 'ユーザー001' },
        // ... 全27ユーザー
    ]
};
```

### 3. user-assignments.jsの編集

`js/user-assignments.js`にユーザー別の課題シートURLを設定:

```javascript
const USER_ASSIGNMENT_SHEETS = {
    'demo456': 'https://docs.google.com/spreadsheets/d/1abc.../edit',
    'test123': 'https://docs.google.com/spreadsheets/d/1def.../edit',
    'user001': 'https://docs.google.com/spreadsheets/d/1ghi.../edit',
    // ... 全27ユーザー
};
```

---

## 動作確認

### 1. 進捗保存のテスト

1. ブラウザで`http://localhost:3000`を開く
2. ユーザーでログイン（例: demo456 / demo123）
3. カリキュラムからチャプターを開く
4. 「チャプターの学習を完了しました」ボタンをクリック
5. Google Sheetsの「Progress」シートを確認
   - 新しい行が追加されているはず

### 2. 課題提出のテスト

1. 課題提出対象のチャプターを開く（例: Lesson 1 - Chapter 6）
2. 「📝 課題を提出する」ボタンが表示されることを確認
3. ボタンをクリック
4. 新しいタブでユーザー専用のGoogle Sheetsが開くことを確認
5. 「{チャプタータイトル} に戻る」ボタンで元のページに戻れることを確認

### 3. マルチデバイス同期のテスト

#### デバイス1（PC）:
1. ログイン（例: demo456）
2. Lesson 1 - Chapter 1を完了

#### デバイス2（スマホ/別ブラウザ）:
1. 同じユーザーでログイン（demo456）
2. 30秒待つ
3. サイドバーでLesson 1 - Chapter 1にチェックマークが表示されることを確認

---

## トラブルシューティング

### エラー: 進捗が保存されない

#### 症状:
- チャプター完了ボタンをクリックしても反映されない
- ブラウザConsoleに`POST 403 Forbidden`エラー

#### 原因:
- Apps ScriptのデプロイURLが間違っている
- デプロイ時の「アクセスできるユーザー」が「自分のみ」になっている

#### 解決方法:
1. Apps Scriptエディタで「デプロイ」→「デプロイを管理」
2. 「新しいデプロイ」を作成
3. 「アクセスできるユーザー」を**「全員」**に設定
4. 新しいURLを`config.js`に設定

### エラー: 課題シートが開かない

#### 症状:
- 「課題を提出する」ボタンをクリックしても何も起こらない
- または「スプレッドシートが見つかりませんでした」エラー

#### 原因:
- `user-assignments.js`にユーザーのURLが設定されていない
- URLが間違っている

#### 解決方法:
1. `js/user-assignments.js`を開く
2. 該当ユーザーIDのURLを確認
3. Google SheetsのURLが正しいか確認
4. URLは`https://docs.google.com/spreadsheets/d/.../edit`形式

### エラー: ポップアップがブロックされました

#### 症状:
- 課題シート表示時にポップアップブロックのメッセージ

#### 解決方法:
1. ブラウザのアドレスバー右側のアイコンをクリック
2. 「ポップアップとリダイレクトを常に許可」を選択
3. ページをリロード
4. または表示される「スプレッドシートを開く」リンクをクリック

### 警告: マルチデバイス同期が動作しない

#### 症状:
- 別デバイスで進捗が反映されない
- 30秒以上待っても同期されない

#### 原因:
- `hybrid-progress.js`が読み込まれていない
- Google Sheets APIが有効化されていない
- ネットワークエラー

#### 解決方法:
1. ブラウザConsole (F12) でエラーを確認
2. `chapter.html`に`<script src="js/hybrid-progress.js"></script>`があるか確認
3. ネットワーク接続を確認
4. Google Sheetsの共有設定が「リンクを知っている全員が閲覧可能」になっているか確認

### Apps Script実行時のエラー

#### エラーメッセージ:
```
Exception: サービスを呼び出すための承認が必要です: Spreadsheets
```

#### 解決方法:
1. Apps Scriptエディタで関数を選択
2. 「実行」をクリック
3. 「権限を確認」をクリック
4. Googleアカウントを選択
5. 「詳細」→「{プロジェクト名}（安全ではないページ）に移動」をクリック
6. 「許可」をクリック

---

## セキュリティに関する注意

### ⚠️ 本番環境での改善点

このセットアップは学習・デモ目的です。本番環境では以下を改善してください:

1. **認証の強化**
   - Google OAuth 2.0を使用
   - サーバーサイド認証の実装

2. **アクセス制御**
   - Apps Scriptで特定ドメインからのアクセスのみ許可
   - ユーザー認証トークンの検証

3. **データ暗号化**
   - 機密データの暗号化
   - HTTPS通信の強制

### 推奨される実装例

```javascript
// Apps Script側でトークン検証
function doPost(e) {
  // トークン検証
  const token = e.parameter.token;
  if (!isValidToken(token)) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Unauthorized' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 通常の処理...
}

function isValidToken(token) {
  // トークン検証ロジック（JWT等）
  return true;
}
```

---

## 高度な設定

### カスタムフィールドの追加

進捗データにカスタムフィールドを追加する場合:

#### 1. Apps Scriptを編集

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  // カスタムフィールド
  const studyTime = data.studyTime || 0;  // 学習時間（分）
  const score = data.score || 0;  // スコア

  sheet.appendRow([
    data.userId,
    data.lessonId,
    data.chapterId,
    data.completedAt,
    studyTime,  // 追加
    score,      // 追加
    new Date().toISOString()
  ]);
}
```

#### 2. フロントエンド側を編集

```javascript
// hybrid-progress.js
async completeChapter(lessonId, chapterId) {
  // ...existing code...

  const payload = {
    userId: this.userId,
    lessonId,
    chapterId,
    completedAt: new Date().toISOString(),
    studyTime: this.calculateStudyTime(),  // 追加
    score: this.calculateScore()            // 追加
  };

  await fetch(this.gasApiUrl, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
```

---

## 関連ドキュメント

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [メインREADME](../README.md)
- [Notionセットアップガイド](NOTION_SETUP.md)

---

**最終更新**: 2025年1月18日
