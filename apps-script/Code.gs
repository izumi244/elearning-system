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
  // Usersシートから取得
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName('Users');

  if (usersSheet) {
    const data = usersSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        return data[i][3]; // name列（D列）
      }
    }
  }

  return userId;
}

/**
 * Usersシートに新しいユーザーが追加・編集されたときに自動実行
 * Progressシートに初期データを作成または既存データを更新
 */
function onUsersSheetEdit(e) {
  const sheet = e.source.getActiveSheet();

  // Usersシート以外は処理しない
  if (sheet.getName() !== 'Users') return;

  const range = e.range;
  const startRow = range.getRow();
  const numRows = range.getNumRows();

  // ヘッダー行は無視
  if (startRow === 1 && numRows === 1) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const progressSheet = ss.getSheetByName('Progress');

  if (!progressSheet) {
    Logger.log('❌ Progressシートが見つかりません');
    return;
  }

  // Progressシートの既存データを取得
  const progressData = progressSheet.getDataRange().getValues();

  // 編集された範囲の各行を処理
  for (let i = 0; i < numRows; i++) {
    const currentRow = startRow + i;

    // ヘッダー行はスキップ
    if (currentRow === 1) continue;

    // 編集された行のデータを取得
    const userId = sheet.getRange(currentRow, 1).getValue();
    const userName = sheet.getRange(currentRow, 4).getValue();

    // userIdとuserNameが両方入力されている場合のみ処理
    if (!userId || !userName) continue;

    // Progressシートで該当ユーザーを検索
    let userRowIndex = -1;
    for (let j = 1; j < progressData.length; j++) {
      if (progressData[j][0] === userId) {
        userRowIndex = j;
        break;
      }
    }

    if (userRowIndex === -1) {
      // 新規追加
      const newRow = [
        userId,           // A: userId
        userName,         // B: userName
        34,               // C: totalChapters（医療・介護DX人材育成研修（生成AI活用コース）のチャプター数）
        0,                // D: completedChapters
        0,                // E: completionRate
        Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''), // F: lastUpdated
        ''                // G: completedChaptersList
      ];

      progressSheet.appendRow(newRow);
      Logger.log(`✅ ${userId} (${userName}) をProgressシートに追加しました`);
    } else {
      // 既存ユーザーのuserNameを更新
      const actualRowIndex = userRowIndex + 1; // シートの実際の行番号
      progressSheet.getRange(actualRowIndex, 2).setValue(userName); // B列（userName）を更新
      Logger.log(`✅ ${userId} のuserNameを「${userName}」に更新しました`);
    }
  }
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

    // アクションによって処理を分岐
    const action = requestData.action;

    if (action === 'login') {
      // ログイン認証
      return handleLogin(requestData);
    } else if (action === 'changePassword') {
      // パスワード変更
      return handleChangePassword(requestData);
    } else if (action === 'updateProgress') {
      // 進捗更新処理
      if (!requestData.userId) {
        throw new Error('Missing userId');
      }
      const result = updateUserProgress(requestData);
      Logger.log(`✅ 進捗保存成功: ${requestData.userId} - ${requestData.chapterTitle}`);
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      // 後方互換性のため、actionがない場合は進捗更新として扱う
      if (!requestData.userId) {
        throw new Error('Missing userId');
      }
      const result = updateUserProgress(requestData);
      Logger.log(`✅ 進捗保存成功: ${requestData.userId} - ${requestData.chapterTitle}`);
      return ContentService
        .createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }

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
 * ログイン認証処理
 */
function handleLogin(data) {
  const userId = data.userId;
  const password = data.password;

  if (!userId || !password) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'ユーザーIDとパスワードを入力してください'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName('Users');

  if (!usersSheet) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Usersシートが見つかりません'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const usersData = usersSheet.getDataRange().getValues();

  // ユーザー検索（ヘッダー行をスキップ）
  for (let i = 1; i < usersData.length; i++) {
    const row = usersData[i];
    if (row[0] === userId && row[1] === password) {
      // 認証成功
      const userInfo = {
        success: true,
        userId: row[0],
        role: row[2],
        name: row[3],
        isFirstLogin: row[4]
      };

      Logger.log(`✅ ログイン成功: ${userId}`);

      return ContentService
        .createTextOutput(JSON.stringify(userInfo))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // 認証失敗
  Logger.log(`❌ ログイン失敗: ${userId}`);
  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      error: 'ユーザーIDまたはパスワードが正しくありません'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * パスワード変更処理
 */
function handleChangePassword(data) {
  const userId = data.userId;
  const newPassword = data.newPassword;

  if (!userId || !newPassword) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'ユーザーIDと新しいパスワードが必要です'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // パスワードバリデーション: 小文字英字3文字以上 + 数字3文字以上
  const lowercaseCount = (newPassword.match(/[a-z]/g) || []).length;
  const digitCount = (newPassword.match(/[0-9]/g) || []).length;

  if (lowercaseCount < 3 || digitCount < 3) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'パスワードは小文字英字3文字以上、数字3文字以上を含めてください'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName('Users');

  if (!usersSheet) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Usersシートが見つかりません'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const usersData = usersSheet.getDataRange().getValues();

  // ユーザー検索
  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][0] === userId) {
      // パスワードを更新
      usersSheet.getRange(i + 1, 2).setValue(newPassword);
      // isFirstLoginをFALSEに更新（E列 = 5列目）
      usersSheet.getRange(i + 1, 5).setValue(false);

      Logger.log(`✅ パスワード変更成功: ${userId}`);

      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'パスワードを変更しました'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // ユーザーが見つからない
  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      error: 'ユーザーが見つかりません'
    }))
    .setMimeType(ContentService.MimeType.JSON);
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
