#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Notion API を使ってコンテンツを取得するスクリプト

使い方:
python fetch-notion-content.py
"""

import os
import sys
from notion_client import Client

# Windows環境で絵文字を表示するためのUTF-8出力設定
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Notion APIキー（環境変数から読み取る）
NOTION_API_KEY = os.environ.get('NOTION_API_KEY')
if not NOTION_API_KEY:
    print("❌ エラー: NOTION_API_KEY 環境変数が設定されていません")
    print("使い方: set NOTION_API_KEY=your_key (Windowsの場合)")
    sys.exit(1)

# テスト用ページID
PAGE_ID = "29c3f0bae9be816e80d4e285a3399c12"

def main():
    print("=" * 60)
    print("📚 Notion API テスト")
    print("=" * 60)

    # Notionクライアントを初期化
    notion = Client(auth=NOTION_API_KEY)

    try:
        # ページ情報を取得
        print(f"\n📄 ページ情報を取得中...")
        page = notion.pages.retrieve(page_id=PAGE_ID)

        # ページタイトルを取得
        title_property = page['properties'].get('title') or page['properties'].get('Name')
        if title_property:
            title_parts = title_property.get('title', [])
            if title_parts:
                title = ''.join([part['plain_text'] for part in title_parts])
                print(f"✅ タイトル: {title}")

        # ページのブロック（コンテンツ）を取得
        print(f"\n📝 コンテンツを取得中...")
        blocks = notion.blocks.children.list(block_id=PAGE_ID)

        print(f"✅ {len(blocks['results'])} 個のブロックを取得しました")

        # 最初の5ブロックを表示（テスト用）
        print(f"\n📋 最初の5ブロックの内容:")
        print("-" * 60)

        for i, block in enumerate(blocks['results'][:5], 1):
            block_type = block['type']
            print(f"\n{i}. ブロックタイプ: {block_type}")

            # ブロックタイプごとにテキストを取得
            if block_type == 'paragraph':
                text_parts = block['paragraph'].get('rich_text', [])
                text = ''.join([part['plain_text'] for part in text_parts])
                print(f"   テキスト: {text[:100]}...")

            elif block_type == 'heading_1':
                text_parts = block['heading_1'].get('rich_text', [])
                text = ''.join([part['plain_text'] for part in text_parts])
                print(f"   見出し1: {text}")

            elif block_type == 'heading_2':
                text_parts = block['heading_2'].get('rich_text', [])
                text = ''.join([part['plain_text'] for part in text_parts])
                print(f"   見出し2: {text}")

            elif block_type == 'heading_3':
                text_parts = block['heading_3'].get('rich_text', [])
                text = ''.join([part['plain_text'] for part in text_parts])
                print(f"   見出し3: {text}")

            elif block_type == 'image':
                image_url = block['image'].get('file', {}).get('url') or block['image'].get('external', {}).get('url')
                print(f"   画像URL: {image_url[:80]}...")

            else:
                print(f"   (その他のタイプ)")

        print("\n" + "=" * 60)
        print("✅ テスト完了！")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ エラー: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
