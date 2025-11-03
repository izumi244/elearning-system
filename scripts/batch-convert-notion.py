#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Notionデータベースから全チャプターを取得して一括HTML変換

使い方:
set NOTION_API_KEY=your_key
python batch-convert-notion.py
"""

import os
import sys
import re
import time
import requests
from pathlib import Path
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

# データベースID
DATABASE_ID = "2933f0bae9be814cbf53f19addbd408e"

class BatchNotionConverter:
    def __init__(self):
        self.notion = Client(auth=NOTION_API_KEY)
        self.content_dir = Path('../content')
        self.images_dir = Path('../images')
        self.content_dir.mkdir(parents=True, exist_ok=True)

    def get_all_chapters(self):
        """全Lessonのチャプターリスト（手動）"""
        print("📚 全レッスンのチャプター情報を取得中...")

        # 全LessonのURL一覧
        all_lessons = {
            '1': [
                "https://www.notion.so/Chapter-1-AI-29c3f0bae9be816e80d4e285a3399c12",
                "https://www.notion.so/Chapter-2-AI-29d3f0bae9be81e788d7d5b75714735f",
                "https://www.notion.so/Chapter-3-ChatGPT-29d3f0bae9be817389ebe7bc92238056",
                "https://www.notion.so/Chapter-4-AI-29d3f0bae9be81acad65d28cae85f6c3",
                "https://www.notion.so/Chapter-5-29d3f0bae9be816eaaf8d348707e21b4",
                "https://www.notion.so/Chapter-6-AI-29d3f0bae9be813d9cc2ece3c22e4060",
                "https://www.notion.so/Chapter-7-ChatGPT-29d3f0bae9be81b5a72dfbd2a54028b0"
            ],
            '2': [
                "https://www.notion.so/Chapter-1-29d3f0bae9be81038110ce8cc0e3eddc",
                "https://www.notion.so/Chapter-2-29d3f0bae9be81d0bf00d18f3b17748a",
                "https://www.notion.so/Chapter-3-29d3f0bae9be81e0b19ef44865ce915d",
                "https://www.notion.so/Chapter-4-2a03f0bae9be8145813ee6ea61513c3e"
            ],
            '3': [
                "https://www.notion.so/Chapter-1-29d3f0bae9be81c5af06cde7475fa884",
                "https://www.notion.so/Chapter-2-29d3f0bae9be81b8a859c09a4765c10b",
                "https://www.notion.so/Chapter-3-AI-29d3f0bae9be816f9c39e9a49cc4c13e",
                "https://www.notion.so/Chapter-4-ChatGPT-29d3f0bae9be818bac69da48be0226ea"
            ],
            '4': [
                "https://www.notion.so/Chapter-1-29d3f0bae9be8196b18acf33ea698277",
                "https://www.notion.so/Chapter-2-29d3f0bae9be8178a842ed959ac1c64a",
                "https://www.notion.so/Chapter-3-29d3f0bae9be817daf54ea7e7b624cec",
                "https://www.notion.so/Chapter-4-29d3f0bae9be8175929fce32cdce3f1d",
                "https://www.notion.so/Chapter-5-29d3f0bae9be81dea125e8c5d8c5b429"
            ],
            '5': [
                "https://www.notion.so/Chapter-1-AI-29d3f0bae9be816d9540ed39254e7177",
                "https://www.notion.so/Chapter-2-AI-29d3f0bae9be81d29bece108e9e41859",
                "https://www.notion.so/Chapter-3-AI-29d3f0bae9be81f89081d099343b759b",
                "https://www.notion.so/Chapter-4-AI-29d3f0bae9be81cd86f1c29ce484ab8a",
                "https://www.notion.so/Chapter-5-AI-29d3f0bae9be813eb356db23fee18338",
                "https://www.notion.so/Chapter-6-AI-29d3f0bae9be81ccb9aed8d4abf2883e"
            ]
        }

        chapters = []
        for lesson_num, urls in all_lessons.items():
            print(f"\n📖 Lesson {lesson_num} を処理中...")
            for url in urls:
                # URLからページIDを抽出（最後のハイフン以降）
                page_id = url.split('-')[-1]

                try:
                    # ページ情報を取得してタイトルを取得
                    page = self.notion.pages.retrieve(page_id=page_id)
                    title_property = page['properties'].get('チャプター一覧') or page['properties'].get('Name') or page['properties'].get('title')

                    if title_property and title_property.get('title'):
                        title = ''.join([t['plain_text'] for t in title_property['title']])
                    else:
                        # タイトルが取得できない場合はURLから推測
                        title = url.split('/')[-1].split('-')[0] + " " + url.split('/')[-1].split('-')[1]

                    # Chapter番号を抽出
                    chapter_match = re.search(r'Chapter[- ](\d+)', url, re.IGNORECASE)
                    if chapter_match:
                        chapter_num = chapter_match.group(1)
                    else:
                        continue

                    chapters.append({
                        'lesson': lesson_num,
                        'chapter': chapter_num,
                        'title': title,
                        'page_id': page_id
                    })

                    print(f"  ✅ Lesson {lesson_num} Chapter {chapter_num}: {title}")

                except Exception as e:
                    print(f"  ⚠️  ページ取得エラー ({url}): {e}")
                    continue

        # ソート
        chapters.sort(key=lambda x: (int(x['lesson']), int(x['chapter'])))

        return chapters

    def download_image(self, image_url, lesson_num, chapter_num, image_counter):
        """画像をダウンロード"""
        try:
            lesson_images_dir = self.images_dir / f'lesson{lesson_num}'
            lesson_images_dir.mkdir(parents=True, exist_ok=True)

            response = requests.get(image_url, timeout=10)
            response.raise_for_status()

            ext = '.png'
            if 'image/jpeg' in response.headers.get('Content-Type', ''):
                ext = '.jpg'
            elif 'image/gif' in response.headers.get('Content-Type', ''):
                ext = '.gif'

            filename = f"chapter{chapter_num}-image{image_counter}{ext}"
            filepath = lesson_images_dir / filename

            with open(filepath, 'wb') as f:
                f.write(response.content)

            return f"../images/lesson{lesson_num}/{filename}"
        except Exception as e:
            print(f"    ⚠️  画像のダウンロードに失敗: {e}")
            return None

    def block_to_html(self, block, lesson_num, chapter_num, image_counter_ref):
        """NotionブロックをHTMLに変換"""
        block_type = block.get('type', 'unknown')
        html = ""

        # 未サポートのブロックタイプをスキップ
        if block_type in ['unsupported', 'unknown', 'child_page', 'child_database', 'column_list', 'column', 'link_preview', 'bookmark', 'embed', 'video', 'file', 'pdf']:
            print(f"    ⚠️  未サポートのブロックタイプ: {block_type}")
            return ""

        if block_type == 'paragraph':
            text = self.rich_text_to_html(block['paragraph'].get('rich_text', []))
            if text.strip():
                html = f"<p>{text}</p>\n"

        elif block_type == 'heading_1':
            text = self.rich_text_to_html(block['heading_1'].get('rich_text', []))
            html = f"<h1>{text}</h1>\n"

        elif block_type == 'heading_2':
            text = self.rich_text_to_html(block['heading_2'].get('rich_text', []))
            html = f"<h2>{text}</h2>\n"

        elif block_type == 'heading_3':
            text = self.rich_text_to_html(block['heading_3'].get('rich_text', []))
            html = f"<h3>{text}</h3>\n"

        elif block_type == 'bulleted_list_item':
            text = self.rich_text_to_html(block['bulleted_list_item'].get('rich_text', []))
            html = f"<li>{text}</li>\n"

        elif block_type == 'numbered_list_item':
            text = self.rich_text_to_html(block['numbered_list_item'].get('rich_text', []))
            html = f"<li>{text}</li>\n"

        elif block_type == 'image':
            image_data = block['image']
            image_url = image_data.get('file', {}).get('url') or image_data.get('external', {}).get('url')

            if image_url:
                local_path = self.download_image(image_url, lesson_num, chapter_num, image_counter_ref[0])
                if local_path:
                    image_counter_ref[0] += 1
                    caption = self.rich_text_to_html(image_data.get('caption', []))
                    if caption:
                        html = f'<figure><img src="{local_path}" alt="{caption}"><figcaption>{caption}</figcaption></figure>\n'
                    else:
                        html = f'<img src="{local_path}" alt="画像">\n'

        elif block_type == 'divider':
            html = "<hr>\n"

        elif block_type == 'code':
            code = self.rich_text_to_html(block['code'].get('rich_text', []))
            language = block['code'].get('language', 'plain text')
            html = f'<pre><code class="language-{language}">{code}</code></pre>\n'

        elif block_type == 'quote':
            text = self.rich_text_to_html(block['quote'].get('rich_text', []))
            html = f"<blockquote>{text}</blockquote>\n"

        elif block_type == 'callout':
            try:
                callout_data = block.get('callout', {})
                if callout_data:
                    text = self.rich_text_to_html(callout_data.get('rich_text', []))
                    icon = callout_data.get('icon') or {}
                    emoji = icon.get('emoji', '💡') if icon and icon.get('type') == 'emoji' else '💡'
                    html = f'<div class="callout">{emoji} {text}</div>\n'
                else:
                    html = ""
            except Exception as e:
                print(f"    ⚠️  Callout処理エラー: {e}")
                html = ""

        elif block_type == 'table':
            # テーブルブロックは子ブロックとして行データを持つ
            try:
                table_data = block['table']
                table_width = table_data.get('table_width', 2)
                has_header = table_data.get('has_column_header', False)

                # 子ブロック（テーブル行）を取得
                table_rows = self.notion.blocks.children.list(block_id=block['id'])

                html = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 1rem 0;">\n'

                for idx, row_block in enumerate(table_rows['results']):
                    if row_block['type'] == 'table_row':
                        cells = row_block['table_row'].get('cells', [])

                        if idx == 0 and has_header:
                            html += '<thead><tr>'
                            for cell in cells:
                                cell_text = self.rich_text_to_html(cell)
                                html += f'<th style="padding: 8px; background: #f0f0f0;">{cell_text}</th>'
                            html += '</tr></thead>\n<tbody>\n'
                        else:
                            html += '<tr>'
                            for cell in cells:
                                cell_text = self.rich_text_to_html(cell)
                                html += f'<td style="padding: 8px;">{cell_text}</td>'
                            html += '</tr>\n'

                if has_header:
                    html += '</tbody>\n'
                html += '</table>\n'
            except Exception as e:
                print(f"    ⚠️  テーブル処理エラー: {e}")
                html = f'<p>[テーブルの変換に失敗しました]</p>\n'

        return html

    def rich_text_to_html(self, rich_text_array):
        """Notionのrich_textをHTMLに変換"""
        html = ""
        for text_obj in rich_text_array:
            content = text_obj.get('plain_text', '')
            annotations = text_obj.get('annotations', {})

            if annotations.get('bold'):
                content = f"<strong>{content}</strong>"
            if annotations.get('italic'):
                content = f"<em>{content}</em>"
            if annotations.get('strikethrough'):
                content = f"<s>{content}</s>"
            if annotations.get('underline'):
                content = f"<u>{content}</u>"
            if annotations.get('code'):
                content = f"<code>{content}</code>"

            if text_obj.get('href'):
                content = f'<a href="{text_obj["href"]}">{content}</a>'

            html += content

        return html

    def convert_chapter(self, chapter_info):
        """1つのチャプターを変換"""
        lesson_num = chapter_info['lesson']
        chapter_num = chapter_info['chapter']
        title = chapter_info['title']
        page_id = chapter_info['page_id']

        print(f"\n📝 変換中: Lesson {lesson_num} - {title}")

        try:
            # ブロックを取得
            blocks_response = self.notion.blocks.children.list(block_id=page_id)
            blocks = blocks_response['results']

            print(f"    📦 {len(blocks)} 個のブロックを取得")

            # HTMLコンテンツを生成
            body_html = ""
            image_counter = [1]  # mutableにするためリストを使用

            for block in blocks:
                if block is None:
                    print(f"    ⚠️  Noneブロックをスキップ")
                    continue
                try:
                    block_html = self.block_to_html(block, lesson_num, chapter_num, image_counter)
                    body_html += block_html
                except Exception as e:
                    print(f"    ⚠️  ブロック変換エラー (type: {block.get('type', 'unknown')}): {e}")
                    continue

            # 完全なHTMLドキュメントを作成
            html_content = self.generate_html_template(title, body_html)

            # ファイル保存
            filename = f"lesson{lesson_num}-chapter{chapter_num}.html"
            filepath = self.content_dir / filename

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(html_content)

            print(f"    ✅ 保存完了: {filepath}")

            # API制限を避けるため少し待つ
            time.sleep(0.5)

            return True

        except Exception as e:
            print(f"    ❌ エラー: {e}")
            return False

    def generate_html_template(self, title, body_html):
        """HTMLテンプレートを生成"""
        return f"""<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }}
        h1 {{ font-size: 2rem; margin-top: 2rem; }}
        h2 {{ font-size: 1.5rem; margin-top: 1.5rem; }}
        h3 {{ font-size: 1.25rem; margin-top: 1.25rem; }}
        img {{
            max-width: 100%;
            height: auto;
            display: block;
            margin: 1rem 0;
        }}
        figure {{
            margin: 1rem 0;
        }}
        figcaption {{
            font-size: 0.9rem;
            color: #666;
            text-align: center;
            margin-top: 0.5rem;
        }}
        code {{
            background: #f5f5f5;
            padding: 0.2rem 0.4rem;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }}
        pre {{
            background: #f5f5f5;
            padding: 1rem;
            border-radius: 5px;
            overflow-x: auto;
        }}
        pre code {{
            background: none;
            padding: 0;
        }}
        blockquote {{
            border-left: 3px solid #ddd;
            padding-left: 1rem;
            margin-left: 0;
            color: #666;
        }}
        .callout {{
            background: #f0f7ff;
            border-left: 3px solid #0066cc;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 3px;
        }}
        hr {{
            border: none;
            border-top: 1px solid #ddd;
            margin: 2rem 0;
        }}
    </style>
</head>
<body>
    <h1>{title}</h1>
{body_html}
</body>
</html>"""

def main():
    print("=" * 60)
    print("📚 Notion → HTML 一括変換ツール")
    print("=" * 60)

    converter = BatchNotionConverter()

    # 全チャプター情報を取得
    chapters = converter.get_all_chapters()

    if not chapters:
        print("❌ チャプターが見つかりませんでした")
        return

    print(f"\n✅ {len(chapters)} 個のチャプターを発見しました")
    print("\n" + "=" * 60)

    # 各チャプターを変換
    success_count = 0
    for chapter in chapters:
        if converter.convert_chapter(chapter):
            success_count += 1

    print("\n" + "=" * 60)
    print(f"✅ 変換完了: {success_count}/{len(chapters)} 個のチャプターを変換しました")
    print("=" * 60)

if __name__ == '__main__':
    main()
