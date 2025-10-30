#!/usr/bin/env node

// Netlifyビルドスクリプト（Node.js版）
// 環境変数からconfig.jsを生成します

const fs = require('fs');
const path = require('path');

console.log('🔧 環境変数からconfig.jsを生成中...');

// 環境変数を取得
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '';
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || '';
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';

// 環境変数の検証
if (!SPREADSHEET_ID || !APPS_SCRIPT_URL || !GOOGLE_API_KEY) {
    console.error('❌ エラー: 必要な環境変数が設定されていません');
    console.error('SPREADSHEET_ID:', SPREADSHEET_ID ? '設定済み' : '未設定');
    console.error('APPS_SCRIPT_URL:', APPS_SCRIPT_URL ? '設定済み' : '未設定');
    console.error('GOOGLE_API_KEY:', GOOGLE_API_KEY ? '設定済み' : '未設定');
    process.exit(1);
}

// config.jsの内容を生成
const configContent = `// LMS システム設定ファイル
// Netlifyビルド時に環境変数から生成されました

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
if (typeof CONFIG.SPREADSHEET_ID === 'undefined' || CONFIG.SPREADSHEET_ID === '') {
    console.error('設定エラー: SPREADSHEET_IDが設定されていません。環境変数を確認してください。');
}

if (typeof CONFIG.APPS_SCRIPT_URL === 'undefined' || CONFIG.APPS_SCRIPT_URL === '') {
    console.error('設定エラー: APPS_SCRIPT_URLが設定されていません。環境変数を確認してください。');
}

if (typeof CONFIG.GOOGLE_API_KEY === 'undefined' || CONFIG.GOOGLE_API_KEY === '') {
    console.error('設定エラー: GOOGLE_API_KEYが設定されていません。環境変数を確認してください。');
}
`;

// config.jsファイルを書き込み
const configPath = path.join(__dirname, 'js', 'config.js');

try {
    fs.writeFileSync(configPath, configContent, 'utf8');
    console.log('✅ config.js を生成しました');
    console.log('✅ js/config.js が正常に作成されました');

    // 確認のため、最初の3行を表示（機密情報は表示しない）
    const lines = configContent.split('\n').slice(0, 3);
    console.log('📄 生成されたファイルの先頭:');
    lines.forEach(line => console.log('  ' + line));

} catch (error) {
    console.error('❌ エラー: config.jsの作成に失敗しました');
    console.error(error.message);
    process.exit(1);
}

console.log('✅ ビルド完了');
