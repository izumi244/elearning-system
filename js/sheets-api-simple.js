/**
 * Google Apps Script API連携版
 * 自動進捗書き込み対応
 */
class SheetsAPISimple {
    constructor() {
        this.gasApiUrl = 'https://script.google.com/macros/s/AKfycbzS3cN458M1EG9BaatJN2-EtqxjCKtyfQ1XbrZi1QOI4uuPXq9lbn7o3OMTdPZTqS3h-w/exec';
        this.isInitialized = false;
    }

    /**
     * Google Apps Script API初期化
     */
    async initialize() {
        try {
            // 接続テスト
            const testResponse = await fetch(this.gasApiUrl, {
                method: 'GET',
                mode: 'cors'
            });
            
            this.isInitialized = true;
            console.log('Google Apps Script API initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize Google Apps Script API:', error);
            throw error;
        }
    }

    /**
     * 進捗データをGoogle Sheetsに自動書き込み
     */
    async updateUserProgress(userId, progressData) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const requestData = {
                userId: userId,
                progressData: progressData
            };

            const response = await fetch(this.gasApiUrl, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Google Sheets updated successfully:', result);
                return result;
            } else {
                throw new Error(result.error || 'Update failed');
            }
        } catch (error) {
            console.error('Failed to update Google Sheets:', error);
            throw error;
        }
    }

    /**
     * 全ユーザー進捗データを読み取り（読み取り専用）
     */
    async getAllUserProgress() {
        try {
            // 読み取り用のAPI Key方式を併用
            const API_KEY = 'AIzaSyD7KqKKKq9tVr9ljTkufAS1tPSf0PaA2JU';
            const SPREADSHEET_ID = '1sTUclxyzGIWNcpbr7u91whFnDmJBKp9CG8-dFgt_Biw';
            const range = 'Sheet1!A:G';
            
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const rows = data.values || [];
            
            if (rows.length < 2) return [];
            
            const headers = rows[0];
            const userData = rows.slice(1).map(row => {
                const userProgress = {};
                headers.forEach((header, index) => {
                    userProgress[header] = row[index] || '';
                });
                return userProgress;
            });

            console.log('Retrieved user progress data:', userData);
            return userData;
        } catch (error) {
            console.error('Failed to get user progress:', error);
            return [];
        }
    }

    /**
     * 特定ユーザーの進捗データを取得
     */
    async getUserProgress(userId) {
        const allData = await this.getAllUserProgress();
        return allData.find(user => user.userId === userId) || null;
    }

    /**
     * LocalStorageとGoogle Sheetsの同期状態を確認
     */
    async syncCheck() {
        try {
            const sheetsData = await this.getAllUserProgress();
            const localProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
            
            console.log('Sync Check:');
            console.log('Google Sheets data:', sheetsData);
            console.log('LocalStorage data:', localProgress);
            
            return {
                sheetsCount: sheetsData.length,
                localCount: Object.keys(localProgress).length,
                lastSync: localStorage.getItem('lastSyncTime') || 'Never'
            };
        } catch (error) {
            console.error('Sync check failed:', error);
            return null;
        }
    }
}

// ハイブリッド進捗管理クラス（自動同期対応）
class HybridProgressManager {
    constructor() {
        this.sheetsAPI = new SheetsAPISimple();
        this.localProgressManager = new ProgressManager();
        this.syncEnabled = false;
    }

    /**
     * 初期化
     */
    async init() {
        console.log('Initializing Hybrid Progress Manager...');
        
        // LocalStorage進捗管理の初期化
        this.localProgressManager.init();
        
        // Google Apps Script API の初期化
        try {
            await this.sheetsAPI.initialize();
            this.syncEnabled = true;
            console.log('Google Apps Script API integration enabled');
            console.log('Hybrid mode: LocalStorage + Google Sheets (Auto-sync)');
        } catch (error) {
            console.warn('Google Apps Script API initialization failed, using LocalStorage only:', error);
        }
        
        console.log('Hybrid Progress Manager ready');
    }

    /**
     * チャプター完了処理（自動同期対応）
     */
    async completeChapter(lesson, chapter) {
        console.log(`📝 Chapter completed: ${lesson}-${chapter}`);
        
        // 1. LocalStorageに即座保存（UI反映）
        this.localProgressManager.completeChapter(lesson, chapter);
        
        // 2. Google Sheetsに自動同期
        if (this.syncEnabled) {
            try {
                const userId = this.localProgressManager.getCurrentUserId();
                const userProgress = this.localProgressManager.getUserProgress(userId);
                
                // Google Apps Script APIで自動更新
                const result = await this.sheetsAPI.updateUserProgress(userId, userProgress);
                
                // 同期時刻を記録
                localStorage.setItem('lastSyncTime', new Date().toISOString());
                
                console.log('✅ Progress automatically synced to Google Sheets');
                
                // 同期ステータス表示
                const syncStatus = await this.sheetsAPI.syncCheck();
                console.log('Current sync status:', syncStatus);
                
            } catch (error) {
                console.error('❌ Auto-sync failed:', error);
                console.log('Progress saved locally, manual sync may be required');
            }
        }
    }

    /**
     * その他のメソッドはlocalProgressManagerに委譲
     */
    loadChapter(lesson, chapter) {
        return this.localProgressManager.loadChapter(lesson, chapter);
    }

    updateProgressDisplay() {
        return this.localProgressManager.updateProgressDisplay();
    }

    getCurrentUserId() {
        return this.localProgressManager.getCurrentUserId();
    }

    getUserProgress(userId) {
        return this.localProgressManager.getUserProgress(userId);
    }

    async exportCSV() {
        if (this.syncEnabled) {
            try {
                const allData = await this.sheetsAPI.getAllUserProgress();
                
                const headers = ['userId', 'userName', 'totalChapters', 'completedChapters', 'completionRate', 'lastUpdated', 'completedChaptersList'];
                let csv = headers.join(',') + '\n';
                
                allData.forEach(user => {
                    const row = headers.map(header => {
                        const value = user[header] || '';
                        return value.toString().includes(',') ? `"${value}"` : value;
                    });
                    csv += row.join(',') + '\n';
                });
                
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `user_progress_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                console.log('CSV export completed from Google Sheets');
            } catch (error) {
                console.error('Failed to export from Google Sheets, falling back to local data');
                return this.localProgressManager.exportCSV();
            }
        } else {
            return this.localProgressManager.exportCSV();
        }
    }
}

// グローバルインスタンス
let hybridProgressManager;