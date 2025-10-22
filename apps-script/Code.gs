/**
 * LMS Progress API - 既存スプレッドシート構造対応版
 *
 * スプレッドシート構造:
 * userId | userName | totalChapters | completedChapters | completionRate | lastUpdated | completedChaptersList
 *
 * デプロイ方法：
 * 1. このコードをApps Scriptエディタに貼り付け
 * 2. デプロイ > 新しいデプロイ > ウェブアプリ
 * 3. 「アクセスできるユーザー」を「全員」に設定
 * 4. デプロイURLを config.js の APPS_SCRIPT_URL に設定
 */

/**
 * テスト用関数
 */
function testUpdateProgress() {
  console.log('=== Test Start ===');

  const testData = {
    userId: 'user001',
    lessonId: 'lesson1',
    chapterId: 'chapter1',
    chapterTitle: '生成AIとは何か',
    completedAt: new Date().toISOString(),
    completedChapters: 3,
    totalChapters: 37,
    completionRate: 8
  };

  try {
    const result = updateUserProgress(testData);
    console.log('✅ Test SUCCESS:', result);
    return result;
  } catch (error) {
    console.error('❌ Test FAILED:', error);
    return { error: error.toString() };
  }
}

/**
 * ユーザー進捗更新（既存スプレッドシート構造に対応）
 */
function updateUserProgress(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // データ取得
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  // ユーザー行を検索
  let userRowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.userId) {
      userRowIndex = i;
      break;
    }
  }

  // 新しいチャプターIDを作成
  const newChapterId = data.lessonId + ',' + data.chapterId;

  // 既存の完了チャプターリストを取得
  let completedChaptersList = '';
  let existingChapters = [];

  if (userRowIndex !== -1 && values[userRowIndex][6]) {
    completedChaptersList = values[userRowIndex][6];
    existingChapters = completedChaptersList.split(',').filter(c => c.trim() !== '');
  }

  // 重複チェック：既に完了している場合はスキップ
  const chapterKey = `${data.lessonId}_${data.chapterId}`;
  if (!existingChapters.includes(chapterKey)) {
    existingChapters.push(chapterKey);
  }

  // 進捗データ計算
  const completedChapters = existingChapters.length;
  const totalChapters = data.totalChapters || 37;
  const completionRate = Math.round((completedChapters / totalChapters) * 100);
  completedChaptersList = existingChapters.join(',');
  const lastUpdated = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
  const userName = getUserName(data.userId);

  // 更新データ
  const rowData = [
    data.userId,
    userName,
    totalChapters,
    completedChapters,
    completionRate,
    lastUpdated,
    completedChaptersList
  ];

  if (userRowIndex === -1) {
    // 新規追加
    const newRowIndex = values.length + 1;
    sheet.getRange(newRowIndex, 1, 1, rowData.length).setValues([rowData]);
    Logger.log(`✅ 新規ユーザー追加: ${data.userId}`);
  } else {
    // 既存更新
    const actualRowIndex = userRowIndex + 1;
    sheet.getRange(actualRowIndex, 1, 1, rowData.length).setValues([rowData]);
    Logger.log(`✅ 既存ユーザー更新: ${data.userId}`);
  }

  return {
    success: true,
    userId: data.userId,
    completedChapters: completedChapters,
    completionRate: completionRate,
    completedChaptersList: completedChaptersList,
    lastUpdated: lastUpdated
  };
}

/**
 * ユーザーIDからユーザー名を取得
 */
function getUserName(userId) {
  // ユーザーマスタシートから取得
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const userSheet = ss.getSheetByName('ユーザーマスタ');

  if (userSheet) {
    const data = userSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        return data[i][1];
      }
    }
  }

  // ユーザーマスタがない場合
  if (userId.startsWith('user')) {
    return `ユーザー${userId.replace('user', '')}`;
  }

  return userId;
}

/**
 * HTTP GET リクエスト処理 (接続テスト用)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'OK',
      message: 'LMS Progress API is running',
      timestamp: new Date().toISOString(),
      version: '2.0'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * HTTP POST リクエスト処理
 */
function doPost(e) {
  try {
    let requestData;

    // POSTデータの解析
    if (e && e.postData && e.postData.contents) {
      requestData = JSON.parse(e.postData.contents);
    } else {
      throw new Error('No POST data received');
    }

    // 必須フィールドの確認
    if (!requestData.userId) {
      throw new Error('Missing userId');
    }

    // 進捗更新処理
    const result = updateUserProgress(requestData);

    Logger.log(`✅ 進捗保存成功: ${requestData.userId} - ${requestData.chapterTitle}`);

    // レスポンス返却
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('❌ doPost error: ' + error.toString());

    const errorResponse = {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };

    return ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 全ユーザーの進捗を取得（管理者用）
 */
function getAllUserProgress() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  const result = [];

  // ヘッダー行をスキップ
  for (let i = 1; i < values.length; i++) {
    if (values[i][0]) {
      result.push({
        userId: values[i][0],
        userName: values[i][1],
        totalChapters: values[i][2],
        completedChapters: values[i][3],
        completionRate: values[i][4],
        lastUpdated: values[i][5],
        completedChaptersList: values[i][6]
      });
    }
  }

  return result;
}

/**
 * 特定ユーザーの進捗を取得
 */
function getUserProgress(userId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === userId) {
      return {
        userId: values[i][0],
        userName: values[i][1],
        totalChapters: values[i][2],
        completedChapters: values[i][3],
        completionRate: values[i][4],
        lastUpdated: values[i][5],
        completedChaptersList: values[i][6]
      };
    }
  }

  return null;
}

/**
 * 進捗データをリセット（テスト用）
 */
function resetUserProgress(userId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === userId) {
      sheet.deleteRow(i + 1);
      Logger.log(`✅ ${userId} の進捗をリセットしました`);
      return { success: true, message: `${userId} の進捗をリセットしました` };
    }
  }

  return { success: false, message: `${userId} が見つかりませんでした` };
}
