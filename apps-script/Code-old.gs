/**
 * LMS進捗管理システム - Google Apps Script
 *
 * このスクリプトはブラウザからのPOSTリクエストを受け取り、
 * Google Sheetsに学習進捗を自動保存します。
 *
 * デプロイ方法：
 * 1. Google Sheetsを開く
 * 2. 拡張機能 > Apps Script
 * 3. このコードを貼り付け
 * 4. デプロイ > 新しいデプロイ > ウェブアプリ
 * 5. 「全員」にアクセス権限を設定
 * 6. デプロイURLを config.js の APPS_SCRIPT_URL に設定
 */

// スプレッドシートのシート名
const SHEET_NAME = '進捗データ';

/**
 * POSTリクエストを受け取る関数
 */
function doPost(e) {
  try {
    // リクエストボディからデータを取得
    const data = JSON.parse(e.postData.contents);

    // スプレッドシートに保存
    const result = updateUserProgress(data);

    // レスポンスを返す
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: '進捗を保存しました',
      data: result
    }))
    .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // エラーハンドリング
    Logger.log('エラー: ' + error.toString());

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'エラーが発生しました',
      error: error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GETリクエストを受け取る関数（テスト用）
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'LMS Progress Management System is running',
    timestamp: new Date().toISOString()
  }))
  .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ユーザー進捗をスプレッドシートに保存
 */
function updateUserProgress(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  // シートが存在しない場合は作成
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    initializeSheet(sheet);
  }

  // データを追加
  const timestamp = new Date().toISOString();
  const row = [
    data.userId,
    getUserName(data.userId), // ユーザー名を取得
    data.lessonId,
    data.chapterId,
    data.chapterTitle,
    timestamp,
    data.totalChapters,
    data.completionRate
  ];

  sheet.appendRow(row);

  Logger.log('保存完了: ' + data.userId + ' - ' + data.chapterTitle);

  return {
    userId: data.userId,
    saved: true,
    timestamp: timestamp
  };
}

/**
 * シートを初期化（ヘッダー行を作成）
 */
function initializeSheet(sheet) {
  const headers = [
    'ユーザーID',
    'ユーザー名',
    'レッスンID',
    'チャプターID',
    'チャプタータイトル',
    '完了日時',
    '総チャプター数',
    '完了率(%)'
  ];

  sheet.appendRow(headers);

  // ヘッダー行をフォーマット
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');

  // 列幅を自動調整
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }

  Logger.log('シート初期化完了');
}

/**
 * ユーザーIDからユーザー名を取得
 * （実際の運用ではユーザーマスタシートから取得）
 */
function getUserName(userId) {
  // ユーザーマスタシートから取得する場合
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName('ユーザーマスタ');

  if (userSheet) {
    const data = userSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        return data[i][1]; // ユーザー名を返す
      }
    }
  }

  // ユーザーマスタがない場合はuserIdをそのまま返す
  return userId;
}

/**
 * 全ユーザーの進捗サマリーを取得
 * （管理者用ダッシュボードで使用）
 */
function getAllUserProgressSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    return [];
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  // ユーザーごとに集計
  const userProgress = {};

  rows.forEach(row => {
    const userId = row[0];
    if (!userId) return;

    if (!userProgress[userId]) {
      userProgress[userId] = {
        userId: userId,
        userName: row[1],
        completedChapters: [],
        totalChapters: row[6],
        completionRate: row[7]
      };
    }

    userProgress[userId].completedChapters.push({
      lessonId: row[2],
      chapterId: row[3],
      chapterTitle: row[4],
      completedAt: row[5]
    });
  });

  return Object.values(userProgress);
}

/**
 * テスト用：サンプルデータで動作確認
 */
function testUpdateProgress() {
  const testData = {
    userId: 'user001',
    lessonId: 'lesson1',
    chapterId: 'chapter1',
    chapterTitle: '生成AIとは何か',
    completedAt: new Date().toISOString(),
    completedChapters: 1,
    totalChapters: 37,
    completionRate: 3
  };

  const result = updateUserProgress(testData);
  Logger.log('テスト結果: ' + JSON.stringify(result));
}
