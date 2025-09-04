// 進捗管理システム
class ProgressManager {
    constructor() {
        this.curriculumData = this.initializeCurriculumData();
        this.init();
    }

    init() {
        // ページ読み込み時の初期化
        document.addEventListener('DOMContentLoaded', () => {
            this.updateTotalChapters();
        });
    }

    // カリキュラムデータの初期化
    initializeCurriculumData() {
        return {
            "basic_course": {
                title: "基礎マスターコース",
                lessons: [
                    {
                        id: "lesson1",
                        title: "Lesson 1 生成AIの基礎知識",
                        estimatedTime: "2.2時間",
                        chapters: [
                            { id: "chapter1", title: "生成AIとは何か", estimatedTime: "0.25時間" },
                            { id: "chapter2", title: "生成AIが与えた影響", estimatedTime: "0.25時間" },
                            { id: "chapter3", title: "ChatGPTが向いている・向いていない作業とは", estimatedTime: "0.25時間" },
                            { id: "chapter4", title: "生成AI利用時の注意事項", estimatedTime: "0.25時間" },
                            { id: "chapter5", title: "[確認テスト①] テキスト生成AIの出力を体験してみよう", estimatedTime: "0.5時間" },
                            { id: "chapter6", title: "[確認テスト②] ChatGPTで解決してみたいことを考えてみよう", estimatedTime: "0.5時間" }
                        ]
                    },
                    {
                        id: "lesson2",
                        title: "Lesson 2 プロンプトエンジニアリング入門",
                        estimatedTime: "2.7時間",
                        chapters: [
                            { id: "chapter1", title: "プロンプトエンジニアリングの重要性", estimatedTime: "0.25時間" },
                            { id: "chapter2", title: "プロンプトエンジニアリングのテクニック", estimatedTime: "0.25時間" },
                            { id: "chapter3", title: "プロンプト作成時の注意点", estimatedTime: "1.0時間" },
                            { id: "chapter4", title: "[確認テスト] 提示されたプロンプトを注意点に沿って修正しよう", estimatedTime: "1.0時間" }
                        ]
                    },
                    {
                        id: "lesson3",
                        title: "Lesson 3 プロンプトエンジニアリング技法 基本編",
                        estimatedTime: "3.7時間",
                        chapters: [
                            { id: "chapter1", title: "プロンプトは「構造化」が鍵", estimatedTime: "1.0時間" },
                            { id: "chapter2", title: "[確認テスト①] 構造化されたプロンプトを作成しよう", estimatedTime: "1.0時間" },
                            { id: "chapter3", title: "生成AIに指定の出力フォーマットで回答させよう", estimatedTime: "0.5時間" },
                            { id: "chapter4", title: "[確認テスト②] ChatGPTに指定のフォーマットで回答させてみよう", estimatedTime: "1.0時間" }
                        ]
                    },
                    {
                        id: "lesson4",
                        title: "Lesson 4 プロンプトエンジニアリング技法 応用編",
                        estimatedTime: "7.2時間",
                        chapters: [
                            { id: "chapter1", title: "得られた結果を改善しよう", estimatedTime: "1.0時間" },
                            { id: "chapter2", title: "[確認テスト①] プロンプトを改善しよう", estimatedTime: "1.0時間" },
                            { id: "chapter3", title: "プロンプトのテクニック", estimatedTime: "1.2時間" },
                            { id: "chapter4", title: "[確認テスト②] テクニックを使ってプロンプトを作成しよう", estimatedTime: "1.0時間" },
                            { id: "chapter5", title: "様々な出力形式", estimatedTime: "1.0時間" },
                            { id: "chapter6", title: "便利な拡張機能", estimatedTime: "1.0時間" },
                            { id: "chapter7", title: "[確認テスト③] GPTsを試してみよう", estimatedTime: "1.0時間" }
                        ]
                    },
                    {
                        id: "lesson5",
                        title: "Lesson 5 プロンプトエンジニアリングの収益化",
                        estimatedTime: "1.2時間",
                        chapters: [
                            { id: "chapter1", title: "プロンプトの販売", estimatedTime: "0.18時間" },
                            { id: "chapter2", title: "OpenAIが展開するプラットフォーム「GPT Store」も収益源になる可能性", estimatedTime: "0.18時間" },
                            { id: "chapter3", title: "売れるプロンプトやGPTsをつくる方法", estimatedTime: "0.25時間" },
                            { id: "chapter4", title: "[確認テスト] 売れるプロンプトを実際に作成しよう", estimatedTime: "0.5時間" }
                        ]
                    },
                    {
                        id: "lesson6",
                        title: "Lesson 6 生成AIの実務活用演習",
                        estimatedTime: "9時間",
                        chapters: [
                            { id: "chapter1", title: "[演習課題①] 生成AIで文章の修正をしてみよう", estimatedTime: "1.0時間" },
                            { id: "chapter2", title: "[演習課題②] 生成AIで議事録を作成してみよう", estimatedTime: "1.0時間" },
                            { id: "chapter3", title: "[演習課題③] 生成AIで英語のメールのやり取りをしてみよう", estimatedTime: "1.0時間" },
                            { id: "chapter4", title: "[演習課題④] 生成AIで契約書を作成してみよう", estimatedTime: "1.0時間" },
                            { id: "chapter5", title: "[演習課題⑤] 生成AIでコールセンターの立ち上げ準備をしてみよう", estimatedTime: "1.0時間" },
                            { id: "chapter6", title: "[演習課題⑥] 生成AIでプログラミングしてみよう", estimatedTime: "1.0時間" },
                            { id: "chapter7", title: "[演習課題⑦] 生成AIでアプリを作成してみよう", estimatedTime: "1.0時間" },
                            { id: "chapter8", title: "[演習課題⑧] 生成AIでチャットボットを作成してみよう", estimatedTime: "1.0時間" },
                            { id: "chapter9", title: "[演習課題⑨] 生成AIでアイデアを出してみよう", estimatedTime: "1.0時間" }
                        ]
                    }
                ]
            }
        };
    }

    // ユーザー進捗の取得
    getUserProgress(userId) {
        const progressKey = `userProgress_${userId}`;
        const defaultProgress = {
            userId: userId,
            completedChapters: [],
            lastUpdated: new Date().toISOString(),
            totalChapters: this.getTotalChapterCount(),
            completionRate: 0
        };

        try {
            const stored = localStorage.getItem(progressKey);
            if (stored) {
                const progress = JSON.parse(stored);
                // totalChapters が更新されている場合は更新
                if (progress.totalChapters !== this.getTotalChapterCount()) {
                    progress.totalChapters = this.getTotalChapterCount();
                    this.saveUserProgress(userId, progress);
                }
                return progress;
            }
        } catch (e) {
            console.error('進捗データの読み込みエラー:', e);
        }

        return defaultProgress;
    }

    // ユーザー進捗の保存
    saveUserProgress(userId, progress) {
        const progressKey = `userProgress_${userId}`;
        progress.lastUpdated = new Date().toISOString();
        progress.completionRate = this.calculateCompletionRate(progress);
        
        try {
            localStorage.setItem(progressKey, JSON.stringify(progress));
            return true;
        } catch (e) {
            console.error('進捗データの保存エラー:', e);
            return false;
        }
    }

    // チャプター完了処理
    completeChapter(userId, lessonId, chapterId, chapterTitle) {
        const progress = this.getUserProgress(userId);
        
        // 既に完了していないかチェック
        const existingChapter = progress.completedChapters.find(
            ch => ch.lessonId === lessonId && ch.chapterId === chapterId
        );
        
        if (existingChapter) {
            console.log('既に完了済みのチャプターです');
            return false;
        }

        // 完了チャプターを追加
        const completedChapter = {
            lessonId: lessonId,
            chapterId: chapterId,
            chapterTitle: chapterTitle,
            completedAt: new Date().toISOString()
        };

        progress.completedChapters.push(completedChapter);
        
        // 保存
        const success = this.saveUserProgress(userId, progress);
        
        if (success) {
            // 完了アクティビティを記録
            this.recordActivity(userId, 'chapter_completed', {
                lessonId: lessonId,
                chapterId: chapterId,
                chapterTitle: chapterTitle
            });
        }

        return success;
    }

    // チャプター完了状態の確認
    isChapterCompleted(userId, lessonId, chapterId) {
        const progress = this.getUserProgress(userId);
        return progress.completedChapters.some(
            ch => ch.lessonId === lessonId && ch.chapterId === chapterId
        );
    }

    // レッスンの完了率を取得
    getLessonCompletionRate(userId, lessonId) {
        const lesson = this.getLessonById(lessonId);
        if (!lesson) return 0;

        const totalChapters = lesson.chapters.length;
        const completedCount = lesson.chapters.filter(chapter => 
            this.isChapterCompleted(userId, lessonId, chapter.id)
        ).length;

        return Math.round((completedCount / totalChapters) * 100);
    }

    // 全体の完了率を計算
    calculateCompletionRate(progress) {
        const totalChapters = this.getTotalChapterCount();
        const completedChapters = progress.completedChapters.length;
        
        if (totalChapters === 0) return 0;
        return Math.round((completedChapters / totalChapters) * 100);
    }

    // 総チャプター数を取得
    getTotalChapterCount() {
        let total = 0;
        const course = this.curriculumData.basic_course;
        
        course.lessons.forEach(lesson => {
            total += lesson.chapters.length;
        });
        
        return total;
    }

    // 全ユーザーの進捗データを更新（totalChapters フィールド）
    updateTotalChapters() {
        const totalChapters = this.getTotalChapterCount();
        
        // 全ユーザーの進捗データを確認・更新
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('userProgress_')) {
                try {
                    const progress = JSON.parse(localStorage.getItem(key));
                    if (progress.totalChapters !== totalChapters) {
                        progress.totalChapters = totalChapters;
                        localStorage.setItem(key, JSON.stringify(progress));
                    }
                } catch (e) {
                    console.error(`進捗データ更新エラー (${key}):`, e);
                }
            }
        }
    }

    // レッスンIDでレッスンを取得
    getLessonById(lessonId) {
        return this.curriculumData.basic_course.lessons.find(lesson => lesson.id === lessonId);
    }

    // カリキュラムデータを取得
    getCurriculumData() {
        return this.curriculumData;
    }

    // アクティビティ記録
    recordActivity(userId, activityType, data) {
        let activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
        
        const activity = {
            userId: userId,
            type: activityType,
            data: data,
            timestamp: new Date().toISOString(),
            id: this.generateActivityId()
        };
        
        activities.push(activity);
        
        // 最新200件のみ保持
        if (activities.length > 200) {
            activities = activities.slice(-200);
        }
        
        localStorage.setItem('userActivities', JSON.stringify(activities));
    }

    // ユーザーのアクティビティを取得
    getUserActivities(userId, limit = 10) {
        const activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
        return activities
            .filter(activity => activity.userId === userId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    }

    // 全ユーザーの進捗統計を取得（管理者用）
    getAllUsersProgress() {
        const allProgress = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('userProgress_')) {
                try {
                    const progress = JSON.parse(localStorage.getItem(key));
                    const userId = key.replace('userProgress_', '');
                    
                    // ユーザー名を取得
                    const validUsers = new AuthSystem().getValidUsers();
                    const userName = validUsers[userId] ? validUsers[userId].name : userId;
                    
                    allProgress.push({
                        ...progress,
                        userName: userName
                    });
                } catch (e) {
                    console.error(`進捗データ取得エラー (${key}):`, e);
                }
            }
        }
        
        return allProgress.sort((a, b) => b.completionRate - a.completionRate);
    }

    // アクティビティIDの生成
    generateActivityId() {
        return 'activity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 進捗データのエクスポート（CSV形式）
    exportProgressToCSV() {
        const allProgress = this.getAllUsersProgress();
        let csvContent = 'ユーザーID,ユーザー名,完了チャプター数,総チャプター数,完了率,最終更新日\n';
        
        allProgress.forEach(progress => {
            const completedCount = progress.completedChapters ? progress.completedChapters.length : 0;
            const row = [
                progress.userId,
                progress.userName,
                completedCount,
                progress.totalChapters,
                progress.completionRate + '%',
                new Date(progress.lastUpdated).toLocaleDateString('ja-JP')
            ].join(',');
            
            csvContent += row + '\n';
        });
        
        return csvContent;
    }

    // 進捗リセット（開発・テスト用）
    resetUserProgress(userId) {
        const progressKey = `userProgress_${userId}`;
        localStorage.removeItem(progressKey);
        
        // アクティビティも削除
        let activities = JSON.parse(localStorage.getItem('userActivities') || '[]');
        activities = activities.filter(activity => activity.userId !== userId);
        localStorage.setItem('userActivities', JSON.stringify(activities));
        
        console.log(`${userId} の進捗データをリセットしました`);
    }
}

// グローバルに利用できるようにインスタンスを作成
const progressManager = new ProgressManager();