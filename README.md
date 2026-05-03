# 🧮 Web Calculator

モダンでリッチな機能を持つWebベースの電卓アプリケーションです。
Vanilla HTML / CSS / JavaScript のみで構築されており、外部依存なしで動作します。

---

## 📐 設計思想・アーキテクチャ

### フレームワーク選定

| 選択肢 | 採用 | 理由 |
|---|---|---|
| Vanilla JS | ✅ | 依存ゼロ・高速・シンプル |
| React / Vue | ❌ | 電卓規模にはオーバースペック |
| jQuery | ❌ | モダンJSで不要 |

外部ライブラリを一切使わず、3ファイル構成（HTML / CSS / JS）にすることで、
**ダウンロード後にそのままブラウザで開くだけで動作**します。

### ディレクトリ構成

```
web-calculator/
├── index.html        # メインHTML・DOM構造
├── style.css         # スタイリング（CSS変数・グリッドレイアウト）
├── script.js         # 計算ロジック・イベント処理
└── README.md         # このファイル
```

### 設計パターン

- **MVC的分離**: HTML(View) / CSS(Style) / JS(Controller+Model) で責任を分離
- **状態管理**: `CalcState` オブジェクトで現在値・演算子・入力状態を一元管理
- **イベント委譲**: ボタン全体に1つのイベントリスナーを設置（パフォーマンス最適化）
- **エラーハンドリング**: ゼロ除算・オーバーフロー・無効入力を適切に処理

---

## ✨ 機能一覧

### 基本機能
- 四則演算（`+` `-` `×` `÷`）
- 小数点入力
- 連続計算（`=` 後に演算子を入力すると継続）
- パーセント計算（`%`）
- 正負切り替え（`±`）
- 全クリア（`AC`）/ 1文字消去（`⌫`）

### 拡張機能
- キーボード入力対応（`0-9`, `+`, `-`, `*`, `/`, `Enter`, `Backspace`, `Escape`）
- 計算履歴表示（直近5件）
- ダークモード / ライトモード 切り替え
- レスポンシブデザイン（スマートフォン対応）

---

## 🚀 起動方法

### 方法1: ファイルを直接ブラウザで開く（最も簡単）

```bash
# リポジトリをクローン
git clone https://github.com/KAIN18915/web-calculator.git
cd web-calculator

# index.html をブラウザで直接開く
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

### 方法2: Python の簡易HTTPサーバーで起動

```bash
git clone https://github.com/KAIN18915/web-calculator.git
cd web-calculator

# Python 3
python3 -m http.server 8080

# ブラウザで以下を開く
# http://localhost:8080
```

### 方法3: Node.js の serve パッケージで起動

```bash
# serveをグローバルインストール（初回のみ）
npm install -g serve

git clone https://github.com/KAIN18915/web-calculator.git
cd web-calculator
serve .

# ブラウザで http://localhost:3000 を開く
```

### 方法4: VS Code Live Server 拡張機能

1. VS Code に [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) をインストール
2. `index.html` を開く
3. 右下の「Go Live」ボタンをクリック
4. ブラウザが自動起動（`http://127.0.0.1:5500`）

---

## ⌨️ キーボードショートカット

| キー | 動作 |
|------|------|
| `0` - `9` | 数字入力 |
| `+` `-` `*` `/` | 演算子 |
| `.` | 小数点 |
| `Enter` / `=` | 計算実行 |
| `Backspace` | 1文字消去 |
| `Escape` | 全クリア（AC） |
| `%` | パーセント |

---

## 🎨 デザイン仕様

- **レイアウト**: CSS Grid（4列ボタン配置）
- **カラーテーマ**: CSS変数（`--bg-color`, `--btn-color` 等）でダーク/ライト切り替え
- **フォント**: システムフォント（`system-ui`）で依存なし
- **アニメーション**: ボタン押下時のスケールアニメーション（`transform: scale(0.95)`）
- **レスポンシブ**: `max-width: 400px` + `vw` 単位でスマホ対応

---

## 🧪 計算ロジックの詳細

### 状態管理オブジェクト

```javascript
const state = {
  current: '0',      // 現在表示中の数値（文字列）
  previous: null,    // 前の数値
  operator: null,    // 現在の演算子
  shouldReset: false // 次の入力で表示をリセットするか
};
```

### 演算フロー

```
[数字入力] → state.current を更新 → ディスプレイ反映
[演算子入力] → calculate() → state.previous に保存 → operator を設定
[= 入力] → calculate() → state.current に結果 → 履歴に追加
```

### エラー処理

- ゼロ除算: `"Error: ÷0"` を表示し AC で復帰
- 数値オーバーフロー（>1e15 or <-1e15）: 指数表記に自動切り替え
- 連続小数点入力: 無視（`.` は1つのみ許可）

---

## 🔧 開発・カスタマイズ

### テーマカラーの変更

`style.css` の `:root` セクションを編集するだけで色を変更できます：

```css
:root {
  --accent-color: #ff9500; /* オレンジ → 好きな色に変更 */
  --bg-dark: #1c1c1e;
  --bg-light: #f2f2f7;
}
```

### 関数電卓への拡張

`script.js` の `calculate()` 関数を拡張するか、
以下の関数を追加することで関数電卓化できます：

```javascript
// 追加例
Math.sqrt(x)   // 平方根
Math.pow(x, y) // 累乗
Math.log(x)    // 自然対数
Math.sin(x)    // sin（ラジアン）
```

---

## 📦 動作環境

| 環境 | バージョン |
|------|----------|
| Chrome | 90以上 |
| Firefox | 88以上 |
| Safari | 14以上 |
| Edge | 90以上 |
| Node.js（サーバー起動時のみ） | 14以上 |

サーバーサイドの処理は一切なく、**静的ファイルのみ**で動作します。

---

## 📄 ライセンス

MIT License — 自由に使用・改変・配布できます。
