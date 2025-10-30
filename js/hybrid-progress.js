// ハイブリッド進捗管理システム（既存スプレッドシート構造対応版）
// localStorage（高速表示） + Google Apps Script（書き込み） + Google Sheets API（読み取り・同期）

class HybridProgressManager extends ProgressManager {
    constructor() {
        super();
        this.syncInProgress = false;
        this.lastSyncTime = this.getLastSyncTime();
        this.syncTimer = null;

        // 初期化
        this.init();
    }

    init() {
        super.init();

        // 定期同期タイマーを開始（30秒ごと）
        this.startSyncTimer();

        // ページ読み込み時に即座に同期
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.syncFromGoogleSheets();
            });
        } else {
            this.syncFromGoogleSheets();
        }
    }

    // === Google Apps Script 書き込み処理 ===

    /**
     * チャプター完了処理（オーバーライド）
     * localStorage保存 + Google Apps Scriptへ送信
     */
    async completeChapter(userId, lessonId, chapterId, chapterTitle) {
        // 1. まずlocalStorageに保存（即座に画面反映）
        const localSuccess = super.completeChapter(userId, lessonId, chapterId, chapterTitle);

        if (!localSuccess) {
            return false;
        }

        // 2. Google Apps Scriptに非同期で送信
        try {
            await this.sendProgressToAppsScript(userId, lessonId, chapterId, chapterTitle);
            console.log(`✅ チャプター完了: ${lessonId}-${chapterId} をGoogle Sheetsに保存しました`);
        } catch (error) {
            console.error('Google Apps Scriptへの送信エラー:', error);
            // localStorageには保存済みなので、エラーでもtrueを返す
            // バックグラウンドで再送信を試みる
            this.retryFailedSync(userId, lessonId, chapterId, chapterTitle);
        }

        return true;
    }

    /**
     * Google Apps Scriptにデータを送信
     */
    async sendProgressToAppsScript(userId, lessonId, chapterId, chapterTitle) {
        const progress = this.getUserProgress(userId);

        const data = {
            userId: userId,
            lessonId: lessonId,
            chapterId: chapterId,
            chapterTitle: chapterTitle,
            completedAt: new Date().toISOString(),
            completedChapters: progress.completedChapters.length,
            totalChapters: progress.totalChapters,
            completionRate: progress.completionRate
        };

        const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(data)
        });

        // レスポンスを確認
        const result = await response.json();
        return result.success || true;
    }

    /**
     * 失敗した同期を再試行
     */
    async retryFailedSync(userId, lessonId, chapterId, chapterTitle, attempt = 1) {
        if (attempt > CONFIG.MAX_RETRY_ATTEMPTS) {
            console.error(`❌ 同期失敗: ${CONFIG.MAX_RETRY_ATTEMPTS}回リトライしましたが失敗しました`);
            return;
        }

        console.log(`🔄 再試行 ${attempt}/${CONFIG.MAX_RETRY_ATTEMPTS}...`);

        await this.sleep(CONFIG.RETRY_DELAY * attempt);

        try {
            await this.sendProgressToAppsScript(userId, lessonId, chapterId, chapterTitle);
            console.log(`✅ 再試行成功: ${lessonId}-${chapterId}`);
        } catch (error) {
            console.error(`再試行 ${attempt} 失敗:`, error);
            this.retryFailedSync(userId, lessonId, chapterId, chapterTitle, attempt + 1);
        }
    }

    // === Google Sheets API 読み取り処理（既存構造対応） ===

    /**
     * Google Sheetsから全ユーザーの進捗を取得
     */
    async syncFromGoogleSheets() {
        if (this.syncInProgress) {
            console.log('⏳ 同期が既に実行中です');
            return;
        }

        this.syncInProgress = true;
        console.log('🔄 Google Sheetsから進捗を同期中...');

        try {
            const sheetData = await this.fetchFromGoogleSheetsAPI();

            if (sheetData && sheetData.values) {
                this.updateLocalStorageFromSheetData(sheetData.values);
                this.setLastSyncTime();
                console.log('✅ 同期完了: Google Sheetsから最新データを取得しました');
            }
        } catch (error) {
            console.error('❌ Google Sheetsからの同期エラー:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Google Sheets APIからデータを取得
     */
    async fetchFromGoogleSheetsAPI() {
        // 既存スプレッドシート構造: A列～G列
        // userId | userName | totalChapters | completedChapters | completionRate | lastUpdated | completedChaptersList
        const url = `${CONFIG.GOOGLE_SHEETS_API_BASE_URL}/${CONFIG.SPREADSHEET_ID}/values/Progress!A:G?key=${CONFIG.GOOGLE_API_KEY}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Google Sheets API エラー: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Google SheetsのデータをlocalStorageに反映（既存構造対応）
     */
    updateLocalStorageFromSheetData(rows) {
        if (!rows || rows.length < 2) {
            console.log('ℹ️ Google Sheetsにデータがありません');
            return;
        }

        // ヘッダー行をスキップ
        const dataRows = rows.slice(1);

        dataRows.forEach(row => {
            // 既存構造: [userId, userName, totalChapters, completedChapters, completionRate, lastUpdated, completedChaptersList]
            const [userId, userName, totalChapters, completedChapters, completionRate, lastUpdated, completedChaptersList] = row;

            if (!userId) return;

            // completedChaptersListをパース
            // フォーマット: "lesson1_chapter1,lesson1_chapter2,lesson2_chapter1"
            const chapterIds = completedChaptersList ? completedChaptersList.split(',') : [];

            // 既存の進捗を取得
            let progress = this.getUserProgress(userId);

            // Google Sheetsのデータで完全に上書き
            progress.completedChapters = [];

            chapterIds.forEach(chapterId => {
                if (!chapterId.trim()) return;

                // "lesson1_chapter1" → ["lesson1", "chapter1"]
                const parts = chapterId.trim().split('_');
                if (parts.length !== 2) return;

                const [lessonId, chapterIdOnly] = parts;

                // 重複チェック
                const exists = progress.completedChapters.find(
                    ch => ch.lessonId === lessonId && ch.chapterId === chapterIdOnly
                );

                if (!exists) {
                    progress.completedChapters.push({
                        lessonId: lessonId,
                        chapterId: chapterIdOnly,
                        chapterTitle: '', // Google Sheetsには保存されていない
                        completedAt: lastUpdated || new Date().toISOString()
                    });
                }
            });

            // 総チャプター数と完了率を更新
            progress.totalChapters = parseInt(totalChapters) || this.getTotalChapterCount();
            progress.completionRate = parseInt(completionRate) || 0;
            progress.lastUpdated = lastUpdated || new Date().toISOString();

            // 保存
            this.saveUserProgress(userId, progress);
        });
    }

    /**
     * 重複チャプターを削除
     */
    removeDuplicateChapters(chapters) {
        const seen = new Set();
        return chapters.filter(chapter => {
            const key = `${chapter.lessonId}_${chapter.chapterId}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    // === 同期タイマー管理 ===

    /**
     * 定期同期タイマーを開始
     */
    startSyncTimer() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }

        this.syncTimer = setInterval(() => {
            this.syncFromGoogleSheets();
        }, CONFIG.SYNC_INTERVAL);

        console.log(`⏰ 同期タイマー開始: ${CONFIG.SYNC_INTERVAL / 1000}秒ごとに同期します`);
    }

    /**
     * 同期タイマーを停止
     */
    stopSyncTimer() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
            console.log('⏰ 同期タイマー停止');
        }
    }

    // === 最終同期時刻管理 ===

    getLastSyncTime() {
        const stored = localStorage.getItem(CONFIG.LAST_SYNC_KEY);
        return stored ? new Date(stored) : null;
    }

    setLastSyncTime() {
        const now = new Date().toISOString();
        localStorage.setItem(CONFIG.LAST_SYNC_KEY, now);
        this.lastSyncTime = new Date(now);
    }

    getLastSyncTimeFormatted() {
        if (!this.lastSyncTime) {
            return '未同期';
        }
        return this.lastSyncTime.toLocaleString('ja-JP');
    }

    // === 管理者用：全ユーザー進捗取得（オーバーライド） ===

    /**
     * 全ユーザーの進捗を取得（Google Sheets優先）
     */
    async getAllUsersProgressFromCloud() {
        try {
            const sheetData = await this.fetchFromGoogleSheetsAPI();

            if (!sheetData || !sheetData.values) {
                console.log('Google Sheetsからデータを取得できませんでした。localStorageを使用します。');
                return super.getAllUsersProgress();
            }

            return this.parseSheetDataToProgressArray(sheetData.values);
        } catch (error) {
            console.error('Google Sheetsからの取得エラー。localStorageを使用します:', error);
            return super.getAllUsersProgress();
        }
    }

    /**
     * Google Sheetsのデータを進捗配列に変換（既存構造対応）
     */
    parseSheetDataToProgressArray(rows) {
        if (!rows || rows.length < 2) {
            return [];
        }

        const progressArray = [];

        // ヘッダー行をスキップ
        const dataRows = rows.slice(1);

        dataRows.forEach(row => {
            // [userId, userName, totalChapters, completedChapters, completionRate, lastUpdated, completedChaptersList]
            const [userId, userName, totalChapters, completedChapters, completionRate, lastUpdated, completedChaptersList] = row;

            if (!userId) return;

            // completedChaptersListをパース
            const chapterIds = completedChaptersList ? completedChaptersList.split(',') : [];
            const completedChaptersArray = [];

            chapterIds.forEach(chapterId => {
                if (!chapterId.trim()) return;

                const parts = chapterId.trim().split('_');
                if (parts.length !== 2) return;

                const [lessonId, chapterIdOnly] = parts;

                completedChaptersArray.push({
                    lessonId: lessonId,
                    chapterId: chapterIdOnly,
                    chapterTitle: '',
                    completedAt: lastUpdated || new Date().toISOString()
                });
            });

            progressArray.push({
                userId: userId,
                userName: userName || userId,
                completedChapters: completedChaptersArray,
                totalChapters: parseInt(totalChapters) || this.getTotalChapterCount(),
                completionRate: parseInt(completionRate) || 0,
                lastUpdated: lastUpdated || new Date().toISOString()
            });
        });

        // 完了率順にソート
        return progressArray.sort((a, b) => b.completionRate - a.completionRate);
    }

    // === ユーティリティ ===

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 同期ステータスを取得
     */
    getSyncStatus() {
        return {
            isSync: this.syncInProgress,
            lastSyncTime: this.getLastSyncTimeFormatted(),
            syncInterval: CONFIG.SYNC_INTERVAL / 1000 + '秒'
        };
    }
}

// グローバルインスタンス（既存のprogressManagerを置き換え）
const hybridProgressManager = new HybridProgressManager();

// 後方互換性のため、既存のprogressManagerも保持
const progressManager = hybridProgressManager;
