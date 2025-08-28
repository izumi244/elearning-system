// 認証システム
class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        // ページ読み込み時の初期化
        if (document.getElementById('loginForm')) {
            this.setupLoginForm();
        }
        
        // 既にログインしている場合はリダイレクト
        if (this.isLoggedIn() && window.location.pathname.includes('index.html')) {
            window.location.href = 'home.html';
        }
    }

    // 有効なユーザーアカウントの定義
    getValidUsers() {
        const users = {};
        
        // 一般ユーザー（user001 - user030）
        for (let i = 1; i <= 30; i++) {
            const userId = `user${i.toString().padStart(3, '0')}`;
            users[userId] = {
                password: userId,
                role: 'user',
                name: `ユーザー${i}`
            };
        }
        
        // 管理者アカウント
        users['admin'] = {
            password: 'admin',
            role: 'admin',
            name: '管理者'
        };
        
        return users;
    }

    // ログインフォームのセットアップ
    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const errorMessage = document.getElementById('errorMessage');
        
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // エンターキーでのログイン
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleLogin();
            }
        });
    }

    // ログイン処理
    handleLogin() {
        const userId = document.getElementById('userId').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorMessage = document.getElementById('errorMessage');
        
        // 入力チェック
        if (!userId || !password) {
            this.showError('ユーザーIDとパスワードを入力してください。');
            return;
        }
        
        // 認証チェック
        const validUsers = this.getValidUsers();
        const user = validUsers[userId];
        
        if (user && user.password === password) {
            // ログイン成功
            this.loginUser(userId, user);
        } else {
            // ログイン失敗
            this.showError('ユーザーIDまたはパスワードが正しくありません。');
        }
    }

    // ログイン成功時の処理
    loginUser(userId, userInfo) {
        const loginTime = new Date().toISOString();
        
        // セッション情報をLocalStorageに保存
        const sessionData = {
            userId: userId,
            name: userInfo.name,
            role: userInfo.role,
            loginTime: loginTime,
            lastActivity: loginTime
        };
        
        localStorage.setItem('currentUser', JSON.stringify(sessionData));
        
        // ログイン履歴を記録
        this.recordLoginHistory(userId, userInfo, loginTime);
        
        // ユーザーの進捗データを初期化（存在しない場合）
        this.initializeUserProgress(userId);
        
        // リダイレクト
        if (userInfo.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'home.html';
        }
    }

    // ログイン履歴の記録
    recordLoginHistory(userId, userInfo, loginTime) {
        let loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        
        const historyEntry = {
            userId: userId,
            name: userInfo.name,
            role: userInfo.role,
            loginTime: loginTime,
            logoutTime: null,
            sessionId: this.generateSessionId()
        };
        
        loginHistory.push(historyEntry);
        
        // 最新100件のみ保持
        if (loginHistory.length > 100) {
            loginHistory = loginHistory.slice(-100);
        }
        
        localStorage.setItem('loginHistory', JSON.stringify(loginHistory));
    }

    // ユーザー進捗データの初期化
    initializeUserProgress(userId) {
        const progressKey = `userProgress_${userId}`;
        
        if (!localStorage.getItem(progressKey)) {
            const initialProgress = {
                userId: userId,
                completedChapters: [],
                lastUpdated: new Date().toISOString(),
                totalChapters: 0, // カリキュラム読み込み時に設定
                completionRate: 0
            };
            
            localStorage.setItem(progressKey, JSON.stringify(initialProgress));
        }
    }

    // セッションIDの生成
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // エラーメッセージの表示
    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // 3秒後に自動で非表示
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    // ログイン状態の確認
    isLoggedIn() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return false;
        
        try {
            const userData = JSON.parse(currentUser);
            // セッションの有効性チェック（24時間）
            const loginTime = new Date(userData.loginTime);
            const now = new Date();
            const timeDiff = now - loginTime;
            const twentyFourHours = 24 * 60 * 60 * 1000;
            
            if (timeDiff > twentyFourHours) {
                this.logout();
                return false;
            }
            
            return true;
        } catch (e) {
            this.logout();
            return false;
        }
    }

    // 現在のユーザー情報を取得
    getCurrentUser() {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) return null;
        
        try {
            return JSON.parse(currentUser);
        } catch (e) {
            return null;
        }
    }

    // ログアウト処理
    logout() {
        const currentUser = this.getCurrentUser();
        
        if (currentUser) {
            // ログアウト時刻を記録
            this.recordLogoutTime(currentUser.userId);
        }
        
        // セッションデータを削除
        localStorage.removeItem('currentUser');
        
        // ログインページにリダイレクト
        window.location.href = 'index.html';
    }

    // ログアウト時刻の記録
    recordLogoutTime(userId) {
        let loginHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        
        // 最新のログイン記録を見つけてログアウト時刻を更新
        for (let i = loginHistory.length - 1; i >= 0; i--) {
            if (loginHistory[i].userId === userId && !loginHistory[i].logoutTime) {
                loginHistory[i].logoutTime = new Date().toISOString();
                break;
            }
        }
        
        localStorage.setItem('loginHistory', JSON.stringify(loginHistory));
    }

    // ページアクセス権限チェック
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    // 管理者権限チェック
    requireAdmin() {
        if (!this.requireAuth()) return false;
        
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = 'home.html';
            return false;
        }
        return true;
    }

    // 最終アクティビティ時刻を更新
    updateLastActivity() {
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            currentUser.lastActivity = new Date().toISOString();
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
    }
}

// グローバルに利用できるようにインスタンスを作成
const authSystem = new AuthSystem();

// ページが読み込まれたらアクティビティを更新
document.addEventListener('DOMContentLoaded', () => {
    if (authSystem.isLoggedIn()) {
        authSystem.updateLastActivity();
    }
});

// マウス移動やキー入力でアクティビティを更新
let activityTimer;
function updateActivity() {
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        if (authSystem.isLoggedIn()) {
            authSystem.updateLastActivity();
        }
    }, 30000); // 30秒間隔で更新
}

document.addEventListener('mousemove', updateActivity);
document.addEventListener('keydown', updateActivity);
document.addEventListener('click', updateActivity);