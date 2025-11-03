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

class NotionToHTML:
    def __init__(self, page_id):
        self.page_id = page_id
        self.notion = Client(auth=NOTION_API_KEY)
        self.content_dir = Path('../content')
        self.images_dir = Path('../images')
        self.image_counter = 1

    def download_image(self, image_url, lesson_num, chapter_num):
        """Notionの画像をダウンロード"""
        try:
            # 画像の保存先ディレクトリを作成
            lesson_images_dir = self.images_dir / f'lesson{lesson_num}'
            lesson_images_dir.mkdir(parents=True, exist_ok=True)

            # 画像をダウンロード
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()

            # ファイル名を生成
            ext = '.png'  # デフォルト
            if 'image/jpeg' in response.headers.get('Content-Type', ''):
                ext = '.jpg'
            elif 'image/gif' in response.headers.get('Content-Type', ''):
                ext = '.gif'

            filename = f"chapter{chapter_num}-image{self.image_counter}{ext}"
            filepath = lesson_images_dir / filename

            # ファイルに保存
            with open(filepath, 'wb') as f:
                f.write(response.content)

            self.image_counter += 1

            # 相対パスを返す
            return f"../images/lesson{lesson_num}/{filename}"

        except Exception as e:
            print(f"  ⚠️  画像のダウンロードに失敗: {e}")
            return None

    def block_to_html(self, block, lesson_num, chapter_num):
        """NotionブロックをHTMLに変換"""
        block_type = block['type']
        html = ""

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
                local_path = self.download_image(image_url, lesson_num, chapter_num)
                if local_path:
                    # キャプションがあれば取得
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
            text = self.rich_text_to_html(block['callout'].get('rich_text', []))
            icon = block['callout'].get('icon', {})
            emoji = icon.get('emoji', '💡') if icon.get('type') == 'emoji' else '💡'
            html = f'<div class="callout">{emoji} {text}</div>\n'

        return html

    def rich_text_to_html(self, rich_text_array):
        """Notionのrich_textをHTMLに変換"""
        html = ""
        for text_obj in rich_text_array:
            content = text_obj.get('plain_text', '')
            annotations = text_obj.get('annotations', {})

            # スタイルを適用
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

            # リンク
            if text_obj.get('href'):
                content = f'<a href="{text_obj["href"]}">{content}</a>'

            html += content

        return html

    def generate_html(self, lesson_num, chapter_num, title):
        """完全なHTMLファイルを生成"""
        print(f"\n📝 ページ '{title}' を処理中...")

        # ブロックを取得
        blocks_response = self.notion.blocks.children.list(block_id=self.page_id)
        blocks = blocks_response['results']

        print(f"  📦 {len(blocks)} 個のブロックを取得")

        # HTMLコンテンツを生成
        body_html = ""

        for block in blocks:
            block_html = self.block_to_html(block, lesson_num, chapter_num)
            body_html += block_html

        # 完全なHTMLドキュメントを作成
        html_template = f"""<!DOCTYPE html>
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

        return html_template

    def save_html(self, html_content, filename):
        """HTMLファイルを保存"""
        self.content_dir.mkdir(parents=True, exist_ok=True)
        filepath = self.content_dir / filename

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)

        print(f"  ✅ 保存完了: {filepath}")
        return filepath

def main():
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
    import re
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
        converter = NotionToHTML(page_id)

        # ページタイトルを取得
        page = converter.notion.pages.retrieve(page_id=page_id)
        title_property = page['properties'].get('title') or page['properties'].get('Name')
        if title_property:
            title_parts = title_property.get('title', [])
            title = ''.join([part['plain_text'] for part in title_parts])
        else:
            title = f"Lesson {lesson_num} Chapter {chapter_num}"

        # HTMLを生成
        html_content = converter.generate_html(lesson_num, chapter_num, title)

        # HTMLを保存
        converter.save_html(html_content, output_filename)

        print("\n" + "=" * 60)
        print("✅ 変換完了！")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ エラー: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
