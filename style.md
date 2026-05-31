# Kanban Dark — 暗色看板风格设计系统

> 提取自 Todo Kanban 项目的前端 CSS，可直接应用于其他类似项目。
> 风格关键词：**暗色、赛博朋克、毛玻璃、极简、渐变辉光**。

---

## 1. 色彩系统

### 1.1 基础色

| 变量 | 色值 | 用途 |
|------|------|------|
| `--bg` | `#08080a` | 页面底色（极暗） |
| `--surface` | `rgba(18, 18, 22, 0.75)` | 面板/浮层底色（半透明毛玻璃） |
| `--text` | `#c8c8cc` | 主文字色 |
| `--text-muted` | `#5a5a62` | 辅助/禁用文字色 |
| `--border` | `rgba(255, 255, 255, 0.05)` | 默认边框（极淡） |
| `--radius` | `12px` | 全局圆角 |

### 1.2 强调色（三色系统）

每列/每种状态对应一个强调色，形成"三段式"视觉分层：

| 颜色 | 变量 | 色值 | 对应列 | 情绪 |
|------|------|------|--------|------|
| 🟠 橙 | `--orange` | `#e87850` | 待办 | 活跃、待处理 |
| 🔵 青 | `--cyan` | `#4db8c8` | 进行中 | 进行、流动 |
| 🟢 青绿 | `--teal` | `#3a9e96` | 已完成 | 完成、稳定 |

每个强调色配备三档透明度变体：

| 变体 | 透明度 | 用途 |
|------|--------|------|
| `--{color}` | 100% | 纯色按钮、激活态文字 |
| `--{color}-dim` | 35% | 半透明边框、hover 色条 |
| `--{color}-glow` | 12% | 辉光阴影、box-shadow 光晕 |
| `--{color}-subtle` | 4% | 极淡背景点缀 |

### 1.3 表面色（微妙的白色叠加）

所有"表面"都用 `rgba(255,255,255, tiny)` 叠加在 `--bg` 上，形成统一的暗色调：

| 变量 | 色值 | 用途 |
|------|------|------|
| `--card-bg` | `rgba(255,255,255,0.015)` | 卡片背景 |
| `--card-hover-bg` | `rgba(255,255,255,0.035)` | 卡片 hover |
| `--input-bg` | `rgba(255,255,255,0.025)` | 输入框背景 |
| `--tag-bg` | `rgba(255,255,255,0.05)` | 标签角标背景 |

---

## 2. 排版

### 2.1 字体

```css
font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
```

使用系统原生字体栈，优先系统 UI 字体（无外部字体依赖）。

### 2.2 字号阶梯

| 层级 | 字号 | 字重 | 用途 |
|------|------|------|------|
| H1 标题 | `26px` | `700` | 页面主标题，渐变文字 |
| 副标题 | `11px` | `400` | uppercase + letter-spacing: 4px |
| 列标题 | `13px` | `600` | uppercase + letter-spacing: 1px |
| 卡片标题 | `14px` | `500` | letter-spacing: 0.3px |
| 卡片描述 | `12px` | `normal` | line-height: 1.6 |
| 角标/标签 | `11-12px` | `500` | 小圆角 tag |
| 按钮 | `13px` | `500` | letter-spacing: 0.3px |
| 计时器 | `13px` | — | `font-variant-numeric: tabular-nums` 等宽数字 |

### 2.3 标题渐变

主标题使用 `background-clip: text` 渐变效果：

```css
.app-header h1 {
  background: linear-gradient(135deg, var(--text) 30%, var(--cyan) 70%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 3. 布局

### 3.1 页面外壳

```css
.app {
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 24px;
}
```

- 居中定宽布局，最大 1100px
- 上下 36px，左右 24px 内边距

### 3.2 间距约定

| 场景 | 间距 | 用途 |
|------|------|------|
| 大块间距 | `36px` | header → toolbar 之间 |
| 列间距 | `16px` | 三列之间的 gap |
| 卡片间距 | `8px` | 列内卡片垂直 gap |
| 表单项间距 | `6-10px` | 表单内元素间距 |
| 按钮组间距 | `4-8px` | 操作按钮之间 |

---

## 4. 背景效果

### 4.1 背景图片层

```css
.bg-image {
  position: fixed; inset: 0; z-index: -1; pointer-events: none;
}
.bg-image img {
  object-fit: cover;
  filter: blur(4px) brightness(0.28) saturate(0.6);
  transform: scale(1.05);
}
```

- 固定定位，覆盖全视口
- `blur(4px)` 模糊 → `brightness(0.28)` 压暗 → `saturate(0.6)` 降饱和

### 4.2 背景渐变叠加

```css
.bg-image::after {
  background:
    radial-gradient(ellipse at 30% 20%, rgba(241,90,36,0.04) 0%, transparent 60%),
    radial-gradient(ellipse at 70% 60%, rgba(0,184,212,0.03) 0%, transparent 60%);
}
```

- 双径向渐变制造"角落发光"效果
- 左上方橙色暖光 + 右下方青色冷光

### 4.3 Canvas 粒子背景

`Background.jsx` 组件提供动态粒子网络：
- 40 个粒子，分三色（橙/青/青绿）
- 缓慢随机漂移（速度 0.3，阻尼 0.98）
- 鼠标 150px 范围内被推开
- 同色粒子间距 < 120px 画半透明连线
- `pointer-events: none` 不拦截点击

---

## 5. 卡片设计

### 5.1 基础卡片

```css
.card {
  background: var(--card-bg);           /* 几乎透明 */
  border-radius: 8px;
  padding: 14px 16px 14px 14px;
  border: 1px solid rgba(255,255,255,0.035);
  border-left: 3px solid transparent;    /* 左侧色条（按状态变色） */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 5.2 Hover 态

```css
.card:hover {
  background: rgba(255,255,255,0.03);    /* 微微亮起 */
  border-color: rgba(255,255,255,0.07);
  transform: translateY(-1px);            /* 轻微上浮 */
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
```

### 5.3 状态左侧色条

```css
.card.status-todo        { border-left-color: rgba(232,120,80,0.3); }
.card.status-in-progress { border-left-color: rgba(77,184,200,0.3); }
.card.status-done        { border-left-color: rgba(58,158,150,0.3); }

.card.status-todo:hover        { border-left-color: var(--orange); }
.card.status-in-progress:hover { border-left-color: var(--cyan); }
.card.status-done:hover        { border-left-color: var(--teal); }
```

- 默认：半透明色条（30% 透明度）
- Hover：变为纯色（100%）

### 5.4 拖拽中

```css
.card.dragging {
  background: rgba(28,28,36,0.97);
  box-shadow: 0 12px 40px rgba(0,0,0,0.5),
              0 0 0 1px rgba(77,184,200,0.1);
  z-index: 100;
}
```

- 深色背景 + 大阴影 + 青色轮廓光

### 5.5 操作按钮（hover 显示）

操作按钮默认隐藏（`opacity: 0`），hover 卡片时显示（`opacity: 1`），过渡 0.2s。删除按钮 hover 变橙色，编辑按钮 hover 变青色。

---

## 6. 按钮系统

### 6.1 主按钮 `.btn-primary`

```css
.btn-primary {
  padding: 8px 18px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-primary:hover {
  transform: scale(1.03);          /* 微放大 */
  box-shadow: 0 0 24px 辉光色;
}
```

**三列按钮分别用列对应的强调色**：
- 待办列主按钮 = 橙色 `#e87850`
- 进行中列 = 青色 `#4db8c8`
- 已完成列 = 青绿 `#3a9e96`

### 6.2 次要按钮 `.btn-secondary`

```css
.btn-secondary {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid rgba(255,255,255,0.06);
}
.btn-secondary:hover {
  border-color: rgba(255,255,255,0.15);
  color: var(--text);
}
```

### 6.3 虚线添加按钮 `.btn-add`

```css
.btn-add {
  width: 100%;
  border: 1px dashed rgba(255,255,255,0.08);
  color: #444;
}
.btn-add:hover {
  border-color: 对应列的 dim 色;
  color: 对应列色;
}
```

### 6.4 小按钮 `.btn-sm`

```css
.btn-sm {
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 5px;
}
```

---

## 7. 输入框

```css
input, textarea, select {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  color: var(--text);
  border-radius: 7px;
  padding: 8-12px;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
}
input:focus, textarea:focus {
  border-color: 对应列的 dim 色;
  box-shadow: 0 0 20px 对应列的 glow 色;
}
```

- 底色极淡（2% 白色）
- focus 时边框变色 + 辉光外阴影
- 三列各自不同的 focus 颜色

---

## 8. 列面板（Column）

```css
.column {
  flex: 1;
  background: rgba(20, 20, 26, 0.7);    /* 半透明暗底 */
  border-radius: var(--radius);           /* 12px */
  padding: 20px;
  border: 1px solid rgba(255,255,255,0.04);
  min-height: 320px;
  transition: border-color 0.3s, box-shadow 0.3s;
}
```

### 8.1 Hover 辉光

每列 hover 时，边框和阴影跟随该列的强调色：
```css
.column:nth-child(1):hover { border-color: rgba(241,90,36,0.2); box-shadow: 0 0 40px rgba(241,90,36,0.04); }
.column:nth-child(2):hover { border-color: rgba(0,184,212,0.2); box-shadow: 0 0 40px rgba(0,184,212,0.04); }
.column:nth-child(3):hover { border-color: rgba(13,148,136,0.2); box-shadow: 0 0 40px rgba(13,148,136,0.04); }
```

### 8.2 顶部辉光线

`::before` 伪元素在列顶部画一条渐变线，hover 时淡入（opacity 0 → 0.6）。

### 8.3 底部强调线

`::after` 伪元素在列标题下方画一条渐变线，hover 时宽度展开（60% → 100%）。

### 8.4 圆点指示器

每个列标题左边有一个 9px 圆形，带 glow 阴影：
```css
.column-dot {
  width: 9px; height: 9px; border-radius: 50%;
  background: 列颜色;
  box-shadow: 0 0 14px 列 glow;
}
```

### 8.5 列内计数器

```css
.column-count {
  margin-left: auto;
  background: rgba(255,255,255,0.04);
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
}
```

---

## 9. 弹窗 / 模态层

### 9.1 回收站弹窗

```css
.recycle-bin-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);          /* 半透明黑色遮罩 */
  z-index: 1000;
}
.recycle-bin {
  background: var(--surface);            /* 毛玻璃面板 */
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  max-width: 520px; width: 90%;
  max-height: 70vh; overflow-y: auto;
}
```

### 9.2 删除确认浮层

```css
.card-confirm {
  position: absolute; inset: 0;
  background: rgba(10,10,14,0.94);       /* 深度暗遮罩 */
  border-radius: 8px;
}
```

---

## 10. 动画约定

| 场景 | 持续时间 | 缓动函数 |
|------|---------|---------|
| 卡片 hover 上浮 | `0.3s` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| 按钮 hover 缩放 | `0.3s` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| 操作按钮显隐 | `0.2s` | 默认 ease |
| 列辉光显隐 | `0.3-0.4s` | 默认 ease |
| 输入框 focus | `0.3s` | 默认 ease |
| 拖拽中（dragging） | `none` | 取消过渡，跟手 |

---

## 11. 板块选择器标签

```css
.board-tab button {
  padding: 7px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.25s;
}
.board-tab.active button {
  color: #fff;
  font-weight: 600;
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.1);
  box-shadow: 0 0 0 1px rgba(77,184,200,0.15);
}
.board-tab.active::after {
  /* 底部渐变色强调线 */
  height: 2px;
  background: linear-gradient(90deg, var(--cyan), var(--teal));
}
```

---

## 12. 响应式

```css
@media (max-width: 768px) {
  .app { padding: 16px 8px; }
  .board { flex-direction: column; }     /* 三列变纵向 */
  .toolbar { flex-direction: column; }
  .board-selector { overflow-x: auto; flex-wrap: nowrap; }
}
```

- 断点：768px
- 列布局从 `flex row` 变为 `flex column`
- 工具栏纵向堆叠
- 板块标签横向滚动

---

## 13. 快速上手（复制即用）

### 13.1 CSS 变量（粘贴到 `:root`）

```css
:root {
  --bg: #08080a;
  --surface: rgba(18, 18, 22, 0.75);
  --border: rgba(255, 255, 255, 0.05);
  --text: #c8c8cc;
  --text-muted: #5a5a62;
  --orange: #e87850;
  --orange-dim: rgba(232, 120, 80, 0.35);
  --orange-glow: rgba(232, 120, 80, 0.12);
  --cyan: #4db8c8;
  --cyan-dim: rgba(77, 184, 200, 0.35);
  --cyan-glow: rgba(77, 184, 200, 0.12);
  --teal: #3a9e96;
  --teal-dim: rgba(58, 158, 150, 0.35);
  --teal-glow: rgba(58, 158, 150, 0.12);
  --radius: 12px;
  --card-bg: rgba(255, 255, 255, 0.015);
  --input-bg: rgba(255, 255, 255, 0.025);
  --tag-bg: rgba(255, 255, 255, 0.05);
}
```

### 13.2 全局重置

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}
```

### 13.3 最小卡片

```css
.card {
  background: var(--card-bg);
  border-radius: 8px;
  padding: 14px 16px;
  border: 1px solid rgba(255,255,255,0.035);
  border-left: 3px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card:hover {
  background: rgba(255,255,255,0.03);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
```

### 13.4 最小按钮

```css
.btn {
  padding: 8px 18px;
  border-radius: 7px;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-primary { background: var(--cyan); color: #000; }
.btn-primary:hover { transform: scale(1.03); box-shadow: 0 0 24px var(--cyan-glow); }
.btn-secondary { background: transparent; color: var(--text-muted); border: 1px solid rgba(255,255,255,0.06); }
.btn-secondary:hover { border-color: rgba(255,255,255,0.15); color: var(--text); }
```
