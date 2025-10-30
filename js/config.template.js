// LMS システム設定ファイル（テンプレート）
// Netlifyビルド時に環境変数から生成されます

const CONFIG = {
    // Google Sheets 設定
    SPREADSHEET_ID: '${SPREADSHEET_ID}',

    // Google Apps Script 設定（書き込み用）
    APPS_SCRIPT_URL: '${APPS_SCRIPT_URL}',

    // Google Cloud API 設定（読み取り用）
    GOOGLE_API_KEY: '${GOOGLE_API_KEY}',
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
if (typeof CONFIG.SPREADSHEET_ID === 'undefined' || CONFIG.SPREADSHEET_ID === 'YOUR_SPREADSHEET_ID_HERE' || CONFIG.SPREADSHEET_ID === '${SPREADSHEET_ID}') {
    console.error('設定エラー: SPREADSHEET_IDが設定されていません。環境変数を確認してください。');
}

if (typeof CONFIG.APPS_SCRIPT_URL === 'undefined' || CONFIG.APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE' || CONFIG.APPS_SCRIPT_URL === '${APPS_SCRIPT_URL}') {
    console.error('設定エラー: APPS_SCRIPT_URLが設定されていません。環境変数を確認してください。');
}

if (typeof CONFIG.GOOGLE_API_KEY === 'undefined' || CONFIG.GOOGLE_API_KEY === 'YOUR_API_KEY_HERE' || CONFIG.GOOGLE_API_KEY === '${GOOGLE_API_KEY}') {
    console.error('設定エラー: GOOGLE_API_KEYが設定されていません。環境変数を確認してください。');
}
