#!/bin/bash

# Netlifyビルドスクリプト
# 環境変数からconfig.jsを生成します

echo "🔧 環境変数からconfig.jsを生成中..."

# テンプレートファイルを読み込み、環境変数を置換
cat js/config.template.js | \
    sed "s/\${SPREADSHEET_ID}/$SPREADSHEET_ID/g" | \
    sed "s|\${APPS_SCRIPT_URL}|$APPS_SCRIPT_URL|g" | \
    sed "s/\${GOOGLE_API_KEY}/$GOOGLE_API_KEY/g" \
    > js/config.js

echo "✅ config.js を生成しました"

# 生成されたファイルを確認（機密情報は表示しない）
if [ -f "js/config.js" ]; then
    echo "✅ js/config.js が正常に作成されました"
else
    echo "❌ エラー: js/config.js の作成に失敗しました"
    exit 1
fi
