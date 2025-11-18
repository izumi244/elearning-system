/**
 * アプリケーション設定
 *
 * このファイルは、アプリケーション全体で使用される定数や設定値を管理します。
 * マジックナンバーやマジックストリングをここに集約することで、
 * メンテナンス性を向上させます。
 */

/**
 * チャプター関連の設定
 */
const CHAPTER_CONFIG = {
    /**
     * 課題提出ボタンを表示するチャプターのリスト
     * フォーマット: 'lessonX-chapterY'
     */
    CHAPTERS_WITH_ASSIGNMENT: [
        'lesson1-chapter6',
        'lesson1-chapter7',
        'lesson2-chapter4',
        'lesson3-chapter2',
        'lesson3-chapter4',
        'lesson4-chapter2',
        'lesson4-chapter4',
        'lesson5-chapter1',
        'lesson5-chapter2',
        'lesson5-chapter3',
        'lesson5-chapter4',
        'lesson5-chapter5',
        'lesson5-chapter6'
    ],

    /**
     * コンテンツファイルのパス
     */
    CONTENT_PATH_TEMPLATE: 'content/lesson{lesson}-chapter{chapter}.html',

    /**
     * コンテンツ読み込み時のタイムアウト（ミリ秒）
     */
    CONTENT_LOAD_TIMEOUT: 10000
};

/**
 * LocalStorageキー
 */
const STORAGE_KEYS = {
    /**
     * 現在ログイン中のユーザー情報
     */
    CURRENT_USER: 'currentUser',

    /**
     * ユーザー進捗情報のプレフィックス
     */
    USER_PROGRESS_PREFIX: 'userProgress_',

    /**
     * 全ユーザー進捗情報（同期用）
     */
    USER_PROGRESS: 'userProgress',

    /**
     * 最終同期時刻
     */
    LAST_SYNC: 'lastSync'
};

/**
 * UI関連の設定
 */
const UI_CONFIG = {
    /**
     * エラーメッセージの自動クリア時間（ミリ秒）
     */
    ERROR_AUTO_CLEAR_DELAY: 5000,

    /**
     * 成功メッセージの表示時間（ミリ秒）
     */
    SUCCESS_MESSAGE_DURATION: 3000,

    /**
     * ローディングスピナーの最小表示時間（ミリ秒）
     */
    MIN_LOADING_DURATION: 500
};

/**
 * API関連の設定
 */
const API_CONFIG = {
    /**
     * APIリクエストのタイムアウト（ミリ秒）
     */
    REQUEST_TIMEOUT: 30000,

    /**
     * リトライ回数
     */
    MAX_RETRIES: 3,

    /**
     * リトライ間隔（ミリ秒）
     */
    RETRY_DELAY: 1000
};

/**
 * 正規表現パターン
 */
const REGEX_PATTERNS = {
    /**
     * ユーザーIDのバリデーション
     */
    USER_ID: /^[a-zA-Z0-9_-]+$/,

    /**
     * チャプターキーのフォーマット (lessonX-chapterY)
     */
    CHAPTER_KEY: /^lesson(\d+)-chapter(\d+)$/
};

/**
 * メッセージテンプレート
 */
const MESSAGES = {
    /**
     * エラーメッセージ
     */
    ERRORS: {
        NETWORK: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
        CONTENT_NOT_FOUND: 'コンテンツが見つかりませんでした。',
        INVALID_USER: 'ユーザーIDまたはパスワードが正しくありません。',
        SESSION_EXPIRED: 'セッションの有効期限が切れました。再度ログインしてください。',
        SAVE_FAILED: '保存に失敗しました。もう一度お試しください。'
    },

    /**
     * 成功メッセージ
     */
    SUCCESS: {
        CHAPTER_COMPLETED: 'チャプターを完了しました！',
        PROGRESS_SAVED: '進捗を保存しました。',
        SYNC_COMPLETED: '同期が完了しました。'
    },

    /**
     * 確認メッセージ
     */
    CONFIRM: {
        LOGOUT: '本当にログアウトしますか？',
        RESET_PROGRESS: '進捗をリセットしますか？この操作は取り消せません。'
    }
};

/**
 * グローバルに公開
 */
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = {
        CHAPTER_CONFIG,
        STORAGE_KEYS,
        UI_CONFIG,
        API_CONFIG,
        REGEX_PATTERNS,
        MESSAGES
    };
}
