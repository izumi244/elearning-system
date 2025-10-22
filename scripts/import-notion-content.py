#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Notion エクスポートファイルを整理するスクリプト

使い方:
1. NotionからZIPファイルをダウンロード
2. このスクリプトと同じディレクトリに配置
3. python import-notion-content.py <zipファイル名> <カリキュラムタイプ>

例:
python import-notion-content.py export.zip pc-beginner
python import-notion-content.py export.zip basic-course
"""

import os
import re
import shutil
import zipfile
import sys
from pathlib import Path

# Windows環境で絵文字を表示するためのUTF-8出力設定
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

class NotionContentImporter:
    def __init__(self, source_path, curriculum_type):
        self.source_path = Path(source_path)
        self.curriculum_type = curriculum_type  # 'pc-beginner' or 'basic-course'
        self.temp_dir = Path('temp_notion_export')
        self.content_dir = Path('../content')
        self.images_dir = Path('../images')

        # ソースがZIPかディレクトリか判定
        self.is_zip = self.source_path.suffix.lower() == '.zip'
        self.is_directory = self.source_path.is_dir()

        # カリキュラムタイプに応じた設定
        if curriculum_type == 'pc-beginner':
            self.prefix = 'pc-beginner'
            self.lesson_pattern = r'STEP\s*(\d+)'
        else:  # basic-course
            self.prefix = 'lesson'
            self.lesson_pattern = r'Lesson\s*(\d+)'

    def extract_zip(self):
        """ZIPファイルを解凍、またはディレクトリをコピー"""
        if self.is_zip:
            print(f"📦 ZIPファイルを解凍中: {self.source_path}")

            if self.temp_dir.exists():
                shutil.rmtree(self.temp_dir)

            with zipfile.ZipFile(self.source_path, 'r') as zip_ref:
                zip_ref.extractall(self.temp_dir)

            print(f"✅ 解凍完了: {self.temp_dir}")

        elif self.is_directory:
            print(f"📂 ディレクトリを処理中: {self.source_path}")

            if self.temp_dir.exists():
                shutil.rmtree(self.temp_dir)

            # ディレクトリの内容をtemp_dirにコピー
            shutil.copytree(self.source_path, self.temp_dir)
            print(f"✅ ディレクトリコピー完了: {self.temp_dir}")

        else:
            raise ValueError(f"❌ 無効なソース: {self.source_path} (ZIPファイルまたはディレクトリを指定してください)")

    def find_html_files(self):
        """HTMLファイルを検索"""
        html_files = list(self.temp_dir.rglob('*.html'))
        print(f"📄 {len(html_files)}個のHTMLファイルを発見")
        return html_files

    def parse_filename(self, filepath):
        """ファイル名からレッスン番号とチャプター番号を抽出"""
        filename = filepath.stem

        # PC初心者用カリキュラムの場合の特別処理
        if self.curriculum_type == 'pc-beginner':
            # 「学習目標 (1)」「学習目標（2）」パターンに対応
            target_match = re.search(r'学習目標\s*[（(]\s*(\d+)\s*[）)]', filename)
            if target_match:
                step_num = target_match.group(1)
                # 学習目標はそれぞれのSTEPの唯一のチャプター
                return step_num, '1'

            # 「Step.1 基礎的なIT用語を学ぼう」パターンにも対応
            step_match = re.search(r'Step\s*\.?\s*(\d+)', filename, re.IGNORECASE)
            if step_match:
                step_num = step_match.group(1)
                # STEPページ自体は学習目標と同じ扱い
                return step_num, '1'

        # 基礎マスターコースの場合の処理
        # Lesson/STEP番号を抽出
        lesson_match = re.search(self.lesson_pattern, filename, re.IGNORECASE)
        if not lesson_match:
            return None, None

        lesson_num = lesson_match.group(1)

        # Chapter番号を抽出
        chapter_match = re.search(r'Chapter\s*(\d+)', filename, re.IGNORECASE)
        if chapter_match:
            chapter_num = chapter_match.group(1)
        else:
            # Chapter番号がない場合は、ファイル名の順序から推測
            chapter_num = '1'

        return lesson_num, chapter_num

    def generate_new_filename(self, lesson_num, chapter_num):
        """新しいファイル名を生成"""
        if self.curriculum_type == 'pc-beginner':
            return f"pc-step{lesson_num}-chapter{chapter_num}.html"
        else:
            return f"lesson{lesson_num}-chapter{chapter_num}.html"

    def clean_html_content(self, content):
        """HTMLコンテンツをクリーンアップ"""
        # NotionのIDを削除
        content = re.sub(r'\s+[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}', '', content)

        # 巨大なインラインスタイルを最小化（オプション）
        # content = re.sub(r'<style>.*?</style>', '<style>/* Notion styles */</style>', content, flags=re.DOTALL)

        return content

    def process_images(self, html_path, lesson_num, chapter_num):
        """画像ファイルを処理してリネーム"""
        html_dir = html_path.parent
        images_src_dir = html_dir / 'images'

        if not images_src_dir.exists():
            print(f"  ⚠️  画像フォルダが見つかりません: {images_src_dir}")
            return {}

        # 画像の保存先ディレクトリを作成
        if self.curriculum_type == 'pc-beginner':
            images_dest_dir = self.images_dir / 'pc-beginner' / f'step{lesson_num}'
        else:
            images_dest_dir = self.images_dir / f'lesson{lesson_num}'

        images_dest_dir.mkdir(parents=True, exist_ok=True)

        # 画像ファイルをコピー＆リネーム
        image_mapping = {}
        image_files = list(images_src_dir.glob('*'))

        for idx, img_file in enumerate(image_files, 1):
            if img_file.suffix.lower() in ['.png', '.jpg', '.jpeg', '.gif', '.svg']:
                # 新しいファイル名
                new_name = f"chapter{chapter_num}-image{idx}{img_file.suffix}"
                dest_path = images_dest_dir / new_name

                # コピー
                shutil.copy2(img_file, dest_path)

                # マッピングを保存（相対パスで）
                old_path = f"images/{img_file.name}"
                if self.curriculum_type == 'pc-beginner':
                    new_path = f"../images/pc-beginner/step{lesson_num}/{new_name}"
                else:
                    new_path = f"../images/lesson{lesson_num}/{new_name}"

                image_mapping[old_path] = new_path
                print(f"  📷 {img_file.name} → {new_name}")

        return image_mapping

    def update_image_paths(self, content, image_mapping):
        """HTML内の画像パスを更新"""
        for old_path, new_path in image_mapping.items():
            # src="..." と src='...' の両方に対応
            content = content.replace(f'src="{old_path}"', f'src="{new_path}"')
            content = content.replace(f"src='{old_path}'", f"src='{new_path}'")

        return content

    def process_files(self):
        """すべてのファイルを処理"""
        html_files = self.find_html_files()

        processed_count = 0

        for html_file in html_files:
            lesson_num, chapter_num = self.parse_filename(html_file)

            if not lesson_num or not chapter_num:
                print(f"⚠️  スキップ: {html_file.name} (レッスン/チャプター番号が見つかりません)")
                continue

            print(f"\n📝 処理中: {html_file.name}")
            print(f"  → Lesson {lesson_num}, Chapter {chapter_num}")

            # HTMLコンテンツを読み込み
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # コンテンツをクリーンアップ
            content = self.clean_html_content(content)

            # 画像を処理
            image_mapping = self.process_images(html_file, lesson_num, chapter_num)

            # 画像パスを更新
            if image_mapping:
                content = self.update_image_paths(content, image_mapping)
                print(f"  ✅ {len(image_mapping)}個の画像パスを更新")

            # 新しいファイル名を生成
            new_filename = self.generate_new_filename(lesson_num, chapter_num)
            dest_path = self.content_dir / new_filename

            # ファイルを保存
            with open(dest_path, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"  ✅ 保存完了: {dest_path}")
            processed_count += 1

        return processed_count

    def cleanup(self):
        """一時ファイルを削除"""
        if self.temp_dir.exists():
            shutil.rmtree(self.temp_dir)
            print(f"\n🧹 一時ファイルを削除: {self.temp_dir}")

    def run(self):
        """メイン処理"""
        print("=" * 60)
        print("📚 Notion コンテンツインポートツール")
        print("=" * 60)

        try:
            # ZIPファイルを解凍
            self.extract_zip()

            # ファイルを処理
            count = self.process_files()

            print("\n" + "=" * 60)
            print(f"✅ 完了: {count}個のファイルを処理しました")
            print("=" * 60)

        except Exception as e:
            print(f"\n❌ エラー: {e}")
            import traceback
            traceback.print_exc()

        finally:
            # クリーンアップ
            self.cleanup()


def main():
    if len(sys.argv) < 3:
        print("使い方:")
        print("  python import-notion-content.py <ZIPファイルまたはディレクトリ> <カリキュラムタイプ>")
        print()
        print("例:")
        print("  python import-notion-content.py export.zip pc-beginner")
        print("  python import-notion-content.py ./notion-files pc-beginner")
        print("  python import-notion-content.py export.zip basic-course")
        sys.exit(1)

    source_path = sys.argv[1]
    curriculum_type = sys.argv[2]

    if curriculum_type not in ['pc-beginner', 'basic-course']:
        print("❌ カリキュラムタイプは 'pc-beginner' または 'basic-course' を指定してください")
        sys.exit(1)

    if not os.path.exists(source_path):
        print(f"❌ ファイルまたはディレクトリが見つかりません: {source_path}")
        sys.exit(1)

    importer = NotionContentImporter(source_path, curriculum_type)
    importer.run()


if __name__ == '__main__':
    main()
