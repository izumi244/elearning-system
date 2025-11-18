#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Notion API コンテンツ変換の共通ユーティリティ

このモジュールは、NotionブロックからHTMLへの変換処理を提供します。
notion-to-html.py と batch-convert-notion.py の共通処理を集約しています。
"""

import requests
from pathlib import Path

# Notionの色をHEXコードにマッピング
COLOR_MAP = {
    'gray': '#9B9A97',
    'brown': '#64473A',
    'orange': '#D9730D',
    'yellow': '#DFAB01',
    'green': '#0F7B6C',
    'blue': '#0B6E99',
    'purple': '#6940A5',
    'pink': '#AD1A72',
    'red': '#E03E3E'
}

BACKGROUND_COLOR_MAP = {
    'gray_background': '#F1F1EF',
    'brown_background': '#F4EEEE',
    'orange_background': '#FAEBDD',
    'yellow_background': '#FBF3DB',
    'green_background': '#EDF3EC',
    'blue_background': '#E7F3F8',
    'purple_background': '#F6F3F9',
    'pink_background': '#FAF1F5',
    'red_background': '#FDEBEC'
}


class NotionContentConverter:
    """NotionブロックをHTMLに変換するユーティリティクラス"""

    def __init__(self, images_dir='../images'):
        """
        初期化

        Args:
            images_dir: 画像保存先ディレクトリのパス
        """
        self.images_dir = Path(images_dir)
        self.image_counter = 1

    def download_image(self, image_url, lesson_num, chapter_num):
        """
        Notionの画像をダウンロード

        Args:
            image_url: ダウンロード元のURL
            lesson_num: レッスン番号
            chapter_num: チャプター番号

        Returns:
            str: ダウンロードした画像への相対パス、失敗時はNone
        """
        try:
            # 画像の保存先ディレクトリを作成
            lesson_images_dir = self.images_dir / f'lesson{lesson_num}'
            lesson_images_dir.mkdir(parents=True, exist_ok=True)

            # 画像をダウンロード
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()

            # ファイル拡張子を判定
            ext = '.png'  # デフォルト
            content_type = response.headers.get('Content-Type', '')
            if 'image/jpeg' in content_type:
                ext = '.jpg'
            elif 'image/gif' in content_type:
                ext = '.gif'

            # ファイル名を生成して保存
            filename = f"chapter{chapter_num}-image{self.image_counter}{ext}"
            filepath = lesson_images_dir / filename

            with open(filepath, 'wb') as f:
                f.write(response.content)

            self.image_counter += 1

            # 相対パスを返す
            return f"../images/lesson{lesson_num}/{filename}"

        except Exception as e:
            print(f"  ⚠️  画像のダウンロードに失敗: {e}")
            return None

    def rich_text_to_html(self, rich_text_array):
        """
        Notionのrich_textをHTMLに変換

        Args:
            rich_text_array: NotionのRichTextオブジェクトの配列

        Returns:
            str: 変換されたHTML文字列
        """
        html = ""
        for text_obj in rich_text_array:
            content = text_obj.get('plain_text', '')
            annotations = text_obj.get('annotations', {})

            # 改行を<br>に変換
            content = content.replace('\n', '<br>')

            # スタイルのリスト
            styles = []

            # 色の処理（文字色または背景色）
            color = annotations.get('color', 'default')
            if color != 'default':
                if color in COLOR_MAP:
                    styles.append(f"color: {COLOR_MAP[color]}")
                elif color in BACKGROUND_COLOR_MAP:
                    styles.append(f"background-color: {BACKGROUND_COLOR_MAP[color]}")

            # スタイルがある場合はspanで囲む
            if styles:
                style_attr = '; '.join(styles)
                content = f'<span style="{style_attr}">{content}</span>'

            # テキスト装飾を適用
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

    def block_to_html(self, block, lesson_num, chapter_num):
        """
        NotionブロックをHTMLに変換

        Args:
            block: Notionのブロックオブジェクト
            lesson_num: レッスン番号
            chapter_num: チャプター番号

        Returns:
            str: 変換されたHTML文字列
        """
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

    def process_blocks(self, blocks, lesson_num, chapter_num):
        """
        ブロックのリストを処理してHTMLボディを生成

        Args:
            blocks: Notionブロックの配列
            lesson_num: レッスン番号
            chapter_num: チャプター番号

        Returns:
            str: 変換されたHTMLボディ
        """
        body_html = ""

        # リストのグループ化処理
        i = 0
        while i < len(blocks):
            block = blocks[i]
            block_type = block.get('type')

            # bulleted_list_itemの場合、連続する項目を<ul>で囲む
            if block_type == 'bulleted_list_item':
                body_html += "<ul>\n"
                while i < len(blocks) and blocks[i].get('type') == 'bulleted_list_item':
                    block_html = self.block_to_html(blocks[i], lesson_num, chapter_num)
                    body_html += block_html
                    i += 1
                body_html += "</ul>\n"
            # numbered_list_itemの場合、連続する項目を<ol>で囲む
            elif block_type == 'numbered_list_item':
                body_html += "<ol>\n"
                while i < len(blocks) and blocks[i].get('type') == 'numbered_list_item':
                    block_html = self.block_to_html(blocks[i], lesson_num, chapter_num)
                    body_html += block_html
                    i += 1
                body_html += "</ol>\n"
            else:
                # その他のブロックは通常処理
                block_html = self.block_to_html(block, lesson_num, chapter_num)
                body_html += block_html
                i += 1

        return body_html

    def generate_html_document(self, title, body_html):
        """
        完全なHTMLドキュメントを生成

        Args:
            title: ページタイトル
            body_html: HTMLボディコンテンツ

        Returns:
            str: 完全なHTMLドキュメント
        """
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
            padding-left: 2rem;
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
