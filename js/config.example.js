// LMS システム設定ファイル（サンプル）
// 使い方：
// 1. このファイルを config.js という名前でコピーしてください
// 2. 以下の YOUR_XXX_HERE の部分を実際の値に置き換えてください

const CONFIG = {
    // Google Sheets 設定
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',

    // Google Apps Script 設定（書き込み用）
    APPS_SCRIPT_URL: 'YOUR_APPS_SCRIPT_URL_HERE',

    // Google Cloud API 設定（読み取り用）
    GOOGLE_API_KEY: 'YOUR_API_KEY_HERE',
    GOOGLE_SHEETS_API_BASE_URL: 'https://sheets.googleapis.com/v4/spreadsheets',

    // システム設定
    SYNC_INTERVAL: 30000, // 30秒（ミリ秒）
    MAX_RETRY_ATTEMPTS: 3, // API失敗時の最大リトライ回数
    RETRY_DELAY: 1000, // リトライ間隔（ミリ秒）

    // ローカルストレージキー
    LOCAL_STORAGE_PREFIX: 'userProgress_',
    ACTIVITIES_KEY: 'userActivities',
    LAST_SYNC_KEY: 'lastSyncTime'
};

// 設定の検証
if (typeof CONFIG.SPREADSHEET_ID === 'undefined' || CONFIG.SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') {
    console.error('設定エラー: SPREADSHEET_IDが設定されていません。config.jsを確認してください。');
}

if (typeof CONFIG.APPS_SCRIPT_URL === 'undefined' || CONFIG.APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
    console.error('設定エラー: APPS_SCRIPT_URLが設定されていません。config.jsを確認してください。');
}

if (typeof CONFIG.GOOGLE_API_KEY === 'undefined' || CONFIG.GOOGLE_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('設定エラー: GOOGLE_API_KEYが設定されていません。config.jsを確認してください。');
}
