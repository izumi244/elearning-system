/**
 * LMS Progress API - デバッグ強化版
 *
 * スプレッドシート構造:
 * Users: userId | password | role | userName | isFirstLogin | createdAt
 * Progress: userId | userName | totalChapters | completedChapters | completionRate | lastUpdated | completedChaptersList
 */

/**
 * HTTP GET リクエスト処理 (接続テスト用)
 */
function doGet(e) {
  Logger.log('=== doGet called ===');

  const output = ContentService
    .createTextOutput(JSON.stringify({
      status: 'OK',
      message: 'LMS Progress API is running',
      timestamp: new Date().toISOString(),
      version: '3.1',
      deploymentInfo: 'CORS対応版 - デバッグ強化'
    }))
    .setMimeType(ContentService.MimeType.JSON);

  return output;
}

/**
 * HTTP POST リクエスト処理 - CORS対応 & デバッグ強化
 */
function doPost(e) {
  Logger.log('=== doPost called ===');

  try {
    let requestData;

    // POSTデータの解析
    if (e && e.postData && e.postData.contents) {
      Logger.log('POST data received: ' + e.postData.contents);
      requestData = JSON.parse(e.postData.contents);
      Logger.log('Parsed request data: ' + JSON.stringify(requestData));
    } else {
      Logger.log('❌ No POST data received');
      Logger.log('e object: ' + JSON.stringify(e));
      throw new Error('No POST data received');
    }

    let result;
    const action = requestData.action;
    Logger.log('Action: ' + action);

    if (action === 'login') {
      Logger.log('→ Handling login request');
      result = handleLogin(requestData);
    } else if (action === 'changePassword') {
      Logger.log('→ Handling changePassword request');
      result = handleChangePassword(requestData);
    } else if (action === 'updateProgress') {
      Logger.log('→ Handling updateProgress request');
      if (!requestData.userId) {
        throw new Error('Missing userId');
      }
      result = updateUserProgress(requestData);
      Logger.log(`✅ 進捗保存成功: ${requestData.userId} - ${requestData.chapterTitle}`);
    } else {
      // 後方互換性
      Logger.log('→ No action specified, treating as updateProgress');
      if (!requestData.userId) {
        throw new Error('Missing userId');
      }
      result = updateUserProgress(requestData);
      Logger.log(`✅ 進捗保存成功: ${requestData.userId} - ${requestData.chapterTitle}`);
    }

    Logger.log('Result: ' + JSON.stringify(result));

    // 成功レスポンス
    const output = ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

    return output;

  } catch (error) {
    Logger.log('❌ doPost error: ' + error.toString());
    Logger.log('Error stack: ' + error.stack);

    const errorResponse = {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString(),
      debug: {
        hasPostData: !!(e && e.postData),
        hasContents: !!(e && e.postData && e.postData.contents),
        postDataType: e && e.postData ? e.postData.type : 'none'
      }
    };

    const output = ContentService
      .createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);

    return output;
  }
}

/**
 * ログイン認証処理
 */
function handleLogin(data) {
  Logger.log('handleLogin called with userId: ' + data.userId);

  const userId = data.userId;
  const password = data.password;

  if (!userId || !password) {
    Logger.log('❌ Missing userId or password');
    return {
      success: false,
      error: 'ユーザーIDとパスワードを入力してください'
    };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName('Users');

  if (!usersSheet) {
    Logger.log('❌ Users sheet not found');
    return {
      success: false,
      error: 'Usersシートが見つかりません'
    };
  }

  const usersData = usersSheet.getDataRange().getValues();
  Logger.log('Searching through ' + (usersData.length - 1) + ' users');

  // ユーザー検索（ヘッダー行をスキップ）
  for (let i = 1; i < usersData.length; i++) {
    const row = usersData[i];
    if (row[0] === userId) {
      Logger.log('User found: ' + userId);
      if (row[1] === password) {
        // 認証成功
        Logger.log(`✅ ログイン成功: ${userId}`);

        return {
          success: true,
          userId: row[0],
          role: row[2],
          name: row[3],
          isFirstLogin: row[4]
        };
      } else {
        Logger.log('❌ Password mismatch for user: ' + userId);
      }
    }
  }

  // 認証失敗
  Logger.log(`❌ ログイン失敗: ${userId} (user not found or password incorrect)`);
  return {
    success: false,
    error: 'ユーザーIDまたはパスワードが正しくありません'
  };
}

/**
 * パスワード変更処理
 */
function handleChangePassword(data) {
  Logger.log('handleChangePassword called with userId: ' + data.userId);

  const userId = data.userId;
  const newPassword = data.newPassword;

  if (!userId || !newPassword) {
    return {
      success: false,
      error: 'ユーザーIDと新しいパスワードが必要です'
    };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName('Users');

  if (!usersSheet) {
    return {
      success: false,
      error: 'Usersシートが見つかりません'
    };
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

      return {
        success: true,
        message: 'パスワードを変更しました'
      };
    }
  }

  // ユーザーが見つからない
  return {
    success: false,
    error: 'ユーザーが見つかりません'
  };
}

/**
 * ユーザー進捗更新
 */
function updateUserProgress(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const progressSheet = ss.getSheetByName('Progress');

  if (!progressSheet) {
    throw new Error('Progressシートが見つかりません');
  }

  const dataRange = progressSheet.getDataRange();
  const values = dataRange.getValues();

  // ユーザー行を検索
  let userRowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.userId) {
      userRowIndex = i;
      break;
    }
  }

  // 既存の完了チャプターリストを取得
  let completedChaptersList = '';
  let existingChapters = [];

  if (userRowIndex !== -1 && values[userRowIndex][6]) {
    completedChaptersList = values[userRowIndex][6];
    existingChapters = completedChaptersList.split(',').filter(c => c.trim() !== '');
  }

  // 重複チェック
  const chapterKey = `${data.lessonId}_${data.chapterId}`;
  if (!existingChapters.includes(chapterKey)) {
    existingChapters.push(chapterKey);
  }

  // 進捗データ計算
  const completedChapters = existingChapters.length;
  const totalChapters = data.totalChapters || 34;
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
    progressSheet.getRange(newRowIndex, 1, 1, rowData.length).setValues([rowData]);
    Logger.log(`✅ 新規ユーザー追加: ${data.userId}`);
  } else {
    // 既存更新
    const actualRowIndex = userRowIndex + 1;
    progressSheet.getRange(actualRowIndex, 1, 1, rowData.length).setValues([rowData]);
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const usersSheet = ss.getSheetByName('Users');

  if (usersSheet) {
    const data = usersSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        return data[i][3]; // userName列（D列）
      }
    }
  }

  return userId;
}

/**
 * Usersシートに新しいユーザーが追加・編集されたときに自動実行
 */
function onUsersSheetEdit(e) {
  const sheet = e.source.getActiveSheet();

  if (sheet.getName() !== 'Users') return;

  const range = e.range;
  const startRow = range.getRow();
  const numRows = range.getNumRows();

  if (startRow === 1 && numRows === 1) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const progressSheet = ss.getSheetByName('Progress');

  if (!progressSheet) {
    Logger.log('❌ Progressシートが見つかりません');
    return;
  }

  const progressData = progressSheet.getDataRange().getValues();

  for (let i = 0; i < numRows; i++) {
    const currentRow = startRow + i;

    if (currentRow === 1) continue;

    const userId = sheet.getRange(currentRow, 1).getValue();
    const userName = sheet.getRange(currentRow, 4).getValue();

    if (!userId || !userName) continue;

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
        userId,
        userName,
        34,
        0,
        0,
        Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
        ''
      ];

      progressSheet.appendRow(newRow);
      Logger.log(`✅ ${userId} (${userName}) をProgressシートに追加しました`);
    } else {
      // 既存ユーザーのuserNameを更新
      const actualRowIndex = userRowIndex + 1;
      progressSheet.getRange(actualRowIndex, 2).setValue(userName);
      Logger.log(`✅ ${userId} のuserNameを「${userName}」に更新しました`);
    }
  }
}
