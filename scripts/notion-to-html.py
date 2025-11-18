#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Notion API からコンテンツを取得してHTMLに変換するスクリプト

使い方:
python notion-to-html.py <page_id> <output_filename>

例:
python notion-to-html.py 29c3f0bae9be816e80d4e285a3399c12 lesson1-chapter1.html
"""

import os
import sys
import re
from pathlib import Path
from notion_client import Client
from notion_utils import NotionContentConverter

# Windows環境で絵文字を表示するためのUTF-8出力設定
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Notion APIキー（環境変数から読み取る）
NOTION_API_KEY = os.environ.get('NOTION_API_KEY')
if not NOTION_API_KEY:
    print("❌ エラー: NOTION_API_KEY 環境変数が設定されていません")
    print("\n使い方:")
    print("  Windows: set NOTION_API_KEY=your_api_key")
    print("  Mac/Linux: export NOTION_API_KEY=your_api_key")
    print("\nまたは .env ファイルに記載してください:")
    print("  NOTION_API_KEY=your_api_key")
    sys.exit(1)

class NotionToHTML:
    """Notion APIからページを取得してHTMLに変換するクラス"""

    def __init__(self, page_id):
        """
        初期化

        Args:
            page_id: NotionページのID
        """
        self.page_id = page_id
        self.notion = Client(auth=NOTION_API_KEY)
        self.content_dir = Path('../content')
        self.converter = NotionContentConverter(images_dir='../images')

    def generate_html(self, lesson_num, chapter_num, title):
        """
        完全なHTMLファイルを生成

        Args:
            lesson_num: レッスン番号
            chapter_num: チャプター番号
            title: ページタイトル

        Returns:
            str: 完全なHTMLドキュメント
        """
        print(f"\n📝 ページ '{title}' を処理中...")

        # ブロックを取得
        blocks_response = self.notion.blocks.children.list(block_id=self.page_id)
        blocks = blocks_response['results']

        print(f"  📦 {len(blocks)} 個のブロックを取得")

        # HTMLコンテンツを生成（共通モジュールを使用）
        body_html = self.converter.process_blocks(blocks, lesson_num, chapter_num)

        # 完全なHTMLドキュメントを作成
        return self.converter.generate_html_document(title, body_html)

    def save_html(self, html_content, filename):
        """
        HTMLファイルを保存

        Args:
            html_content: 保存するHTML文字列
            filename: 保存先ファイル名

        Returns:
            Path: 保存したファイルのパス
        """
        self.content_dir.mkdir(parents=True, exist_ok=True)
        filepath = self.content_dir / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"  ✅ 保存完了: {filepath}")
        return filepath

def main():
    """
    メイン処理

    コマンドライン引数からNotionページIDとファイル名を受け取り、
    NotionページをHTMLに変換して保存します。
    """
    # コマンドライン引数のバリデーション
    if len(sys.argv) < 3:
        print("使い方:")
        print("  python notion-to-html.py <page_id> <output_filename>")
        print()
        print("例:")
        print("  python notion-to-html.py 29c3f0bae9be816e80d4e285a3399c12 lesson1-chapter1.html")
        sys.exit(1)

    page_id = sys.argv[1]
    output_filename = sys.argv[2]

    # ファイル名からlesson番号とchapter番号を抽出
    # 期待フォーマット: lessonX-chapterY.html
    match = re.search(r'lesson(\d+)-chapter(\d+)', output_filename)
    if not match:
        print("❌ ファイル名は 'lessonX-chapterY.html' の形式にしてください")
        sys.exit(1)

    lesson_num = match.group(1)
    chapter_num = match.group(2)

    print("=" * 60)
    print("📚 Notion → HTML 変換ツール")
    print("=" * 60)

    try:
        # 変換処理の実行
        converter = NotionToHTML(page_id)

        # NotionページからタイトルプロパティToを取得
        # プロパティ名は 'title' または 'Name' の可能性がある
        page = converter.notion.pages.retrieve(page_id=page_id)
        title_property = page['properties'].get('title') or page['properties'].get('Name')
        if title_property:
            title_parts = title_property.get('title', [])
            title = ''.join([part['plain_text'] for part in title_parts])
        else:
            # タイトルが取得できない場合はデフォルト値を使用
            title = f"Lesson {lesson_num} Chapter {chapter_num}"

        # HTMLコンテンツを生成
        html_content = converter.generate_html(lesson_num, chapter_num, title)

        # ファイルシステムに保存
        converter.save_html(html_content, output_filename)

        print("\n" + "=" * 60)
        print("✅ 変換完了！")
        print("=" * 60)

    except Exception as e:
        # エラーの詳細情報を表示
        print(f"\n❌ エラー: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
