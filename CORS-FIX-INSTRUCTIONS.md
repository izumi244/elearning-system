# CORS問題の解決手順

## 問題
- GET接続は成功 ✓
- POST接続がCORSエラーで失敗 ✗

## 原因
Google Apps ScriptのCORS preflight（OPTIONSリクエスト）処理の問題

## 解決策

### 方法1: 新しいデプロイを作成（推奨）

古いデプロイが問題を起こしている可能性があります。完全に新しいデプロイを作成してください：

1. Apps Scriptエディタを開く
2. 「デプロイ」→「デプロイを管理」→既存のデプロイを**すべて削除**
3. 「デプロイ」→「新しいデプロイ」
4. 「種類の選択」→「ウェブアプリ」
5. 設定：
   - **説明**: LMS Progress API v3
   - **次のユーザーとして実行**: 自分（あなたのメールアドレス）
   - **アクセスできるユーザー**: **全員**（重要！）
6. 「デプロイ」をクリック
7. 権限の承認（初回のみ）
8. 新しいWeb App URLをコピー
9. `js/config.js` の `APPS_SCRIPT_URL` を新しいURLに更新

### 方法2: フロントエンド側でredirectを使う（代替案）

Apps ScriptのCORS問題を回避するため、フロントエンドで `redirect: 'follow'` オプションを使います。

`js/auth.js` の `handleLogin` 関数を以下のように修正：

```javascript
async handleLogin() {
  const userId = document.getElementById('userId').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!userId || !password) {
    this.showError('ユーザーIDとパスワードを入力してください。');
    return;
  }

  try {
    this.showLoading();

    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',  // ← 変更
      },
      body: new URLSearchParams({  // ← 変更
        action: 'login',
        userId: userId,
        password: password
      }),
      redirect: 'follow'  // ← 追加
    });

    const result = await response.json();

    if (result.success) {
      this.loginUser(userId, {
        role: result.role,
        name: result.name,
        isFirstLogin: result.isFirstLogin
      });
    } else {
      this.showError(result.error || 'ログインに失敗しました。');
    }
  } catch (error) {
    console.error('ログインエラー:', error);
    this.showError('ネットワークエラーが発生しました。');
  }
}
```

そして、Apps Script側でURLエンコードされたデータを処理するように修正が必要です。

### 方法3: 開発時のみCORS Chromeエクステンションを使う（一時的）

**注意：これは開発環境でのみ使用してください。本番環境では使わないでください。**

1. Chrome Web Storeで「CORS Unblock」または「Allow CORS」をインストール
2. エクステンションを有効化
3. localhostでテスト
4. テスト完了後、必ず無効化

## 推奨アプローチ

**方法1を試してください**。既存のデプロイを削除して、完全に新しいデプロイを作成すると、CORS問題が解決することが多いです。

それでも解決しない場合は、方法2でContent-Typeを変更してください。
