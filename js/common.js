/**
 * 共通ユーティリティ関数
 *
 * このモジュールは、複数のJavaScriptファイルで共通して使用される
 * ヘルパー関数やユーティリティを提供します。
 */

/**
 * LocalStorage操作のヘルパー
 */
const StorageHelper = {
    /**
     * LocalStorageからアイテムを取得（JSONパース付き）
     * @param {string} key - キー名
     * @param {*} defaultValue - デフォルト値
     * @returns {*} 取得した値、または存在しない場合はデフォルト値
     */
    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error(`LocalStorage取得エラー (key: ${key}):`, e);
            return defaultValue;
        }
    },

    /**
     * LocalStorageにアイテムを保存（JSON文字列化付き）
     * @param {string} key - キー名
     * @param {*} value - 保存する値
     * @returns {boolean} 成功したかどうか
     */
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`LocalStorage保存エラー (key: ${key}):`, e);
            return false;
        }
    },

    /**
     * LocalStorageからアイテムを削除
     * @param {string} key - キー名
     * @returns {boolean} 成功したかどうか
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error(`LocalStorage削除エラー (key: ${key}):`, e);
            return false;
        }
    },

    /**
     * LocalStorageをクリア
     * @returns {boolean} 成功したかどうか
     */
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('LocalStorageクリアエラー:', e);
            return false;
        }
    }
};

/**
 * DOM操作のヘルパー
 */
const DOMHelper = {
    /**
     * 安全にテキストコンテンツを設定（XSS対策）
     * @param {string|HTMLElement} element - 要素またはセレクタ
     * @param {string} text - 設定するテキスト
     */
    setTextContent(element, text) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.textContent = text;
        }
    },

    /**
     * 安全にHTMLを構築して挿入（createElement使用）
     * @param {string} tag - タグ名
     * @param {Object} attributes - 属性のオブジェクト
     * @param {string|HTMLElement} content - 内容（テキストまたは子要素）
     * @returns {HTMLElement} 作成した要素
     */
    createElement(tag, attributes = {}, content = null) {
        const element = document.createElement(tag);

        // 属性を設定
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else {
                element.setAttribute(key, value);
            }
        });

        // 内容を設定
        if (content !== null) {
            if (typeof content === 'string') {
                element.textContent = content;
            } else if (content instanceof HTMLElement) {
                element.appendChild(content);
            } else if (Array.isArray(content)) {
                content.forEach(child => {
                    if (child instanceof HTMLElement) {
                        element.appendChild(child);
                    }
                });
            }
        }

        return element;
    },

    /**
     * 要素を表示/非表示
     * @param {string|HTMLElement} element - 要素またはセレクタ
     * @param {boolean} show - 表示するかどうか
     */
    toggleDisplay(element, show) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            el.style.display = show ? '' : 'none';
        }
    },

    /**
     * 要素のクラスを追加/削除
     * @param {string|HTMLElement} element - 要素またはセレクタ
     * @param {string} className - クラス名
     * @param {boolean} add - 追加するかどうか
     */
    toggleClass(element, className, add) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (el) {
            if (add) {
                el.classList.add(className);
            } else {
                el.classList.remove(className);
            }
        }
    }
};

/**
 * エラー表示のヘルパー
 */
const ErrorHelper = {
    /**
     * エラーメッセージを安全に表示
     * @param {string|HTMLElement} container - コンテナ要素またはセレクタ
     * @param {string} message - エラーメッセージ
     * @param {Object} options - オプション（className, clearAfter等）
     */
    showError(container, message, options = {}) {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) return;

        // 既存の内容をクリア
        el.textContent = '';

        // エラー要素を作成
        const errorDiv = DOMHelper.createElement('div', {
            className: options.className || 'error-message'
        }, message);

        el.appendChild(errorDiv);

        // 自動クリア
        if (options.clearAfter) {
            setTimeout(() => {
                el.textContent = '';
            }, options.clearAfter);
        }
    },

    /**
     * エラーメッセージをクリア
     * @param {string|HTMLElement} container - コンテナ要素またはセレクタ
     */
    clearError(container) {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (el) {
            el.textContent = '';
        }
    }
};

/**
 * URL操作のヘルパー
 */
const URLHelper = {
    /**
     * URLパラメータを取得
     * @param {string} name - パラメータ名
     * @returns {string|null} パラメータの値
     */
    getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    /**
     * 複数のURLパラメータを取得
     * @param {string[]} names - パラメータ名の配列
     * @returns {Object} パラメータ名と値のオブジェクト
     */
    getQueryParams(names) {
        const urlParams = new URLSearchParams(window.location.search);
        const params = {};
        names.forEach(name => {
            params[name] = urlParams.get(name);
        });
        return params;
    },

    /**
     * URLパラメータを構築
     * @param {Object} params - パラメータのオブジェクト
     * @returns {string} クエリ文字列
     */
    buildQueryString(params) {
        const urlParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                urlParams.append(key, value);
            }
        });
        return urlParams.toString();
    }
};

/**
 * 文字列操作のヘルパー
 */
const StringHelper = {
    /**
     * HTMLエスケープ（XSS対策）
     * @param {string} str - エスケープする文字列
     * @returns {string} エスケープされた文字列
     */
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * 文字列を切り詰め
     * @param {string} str - 元の文字列
     * @param {number} maxLength - 最大長
     * @param {string} suffix - 末尾に付ける文字列
     * @returns {string} 切り詰められた文字列
     */
    truncate(str, maxLength, suffix = '...') {
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - suffix.length) + suffix;
    }
};

/**
 * グローバルに公開
 */
if (typeof module !== 'undefined' && module.exports) {
    // Node.js環境
    module.exports = {
        StorageHelper,
        DOMHelper,
        ErrorHelper,
        URLHelper,
        StringHelper
    };
}
