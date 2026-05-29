# Claude Code CLI 命令与功能大全

## 一、会话内斜杠命令

在 Claude Code 对话中直接输入：

### 对话控制
| 命令 | 作用 |
|------|------|
| `/clear` | 清空当前对话上下文，重新开始 |
| `/compact` | 压缩对话历史，释放上下文窗口（保留关键信息） |
| `/config` | 打开设置面板，修改主题/模型等配置 |
| `/context` | 查看当前上下文使用情况（用了多少 token） |
| `/cost` | 查看当前会话的 API 费用统计 |
| `/doctor` | 诊断环境问题，检查版本和配置是否正确 |
| `/help` | 显示帮助信息 |

### 模式与状态
| 命令 | 作用 |
|------|------|
| `/model` | 切换 AI 模型（如 opus/sonnet/haiku） |
| `/fast` | 切换快速模式（Opus 加速输出，不降级模型） |
| `/think` | 切换思考模式（让模型在回答前深度思考） |
| `/plan` | 进入计划模式，先设计方案再动手实现 |
| `/plan-review` | 审查当前计划 |
| `/status` | 显示当前会话状态和配置 |
| `/upgrade` | 检查并升级 Claude Code 到最新版本 |

### 自动化与循环
| 命令 | 作用 |
|------|------|
| `/loop` | 以固定间隔重复执行某个命令（如 `/loop 5m /test`） |
| `/run` | 运行项目中的脚本或启动应用 |
| `/tasks` | 查看后台运行的任务列表 |
| `/watch` | 监视文件变化并自动执行命令 |

### 代码操作
| 命令 | 作用 |
|------|------|
| `/add-dir` | 将目录加入工作区 |
| `/init` | 初始化当前项目的 CLAUDE.md 配置文件 |
| `/review` | 代码审查当前变更 |
| `/simplify` | 审查并优化代码质量和复用 |
| `/verify` | 验证代码变更是否按预期工作 |
| `/search` | 在代码库中搜索 |

### 权限与安全
| 命令 | 作用 |
|------|------|
| `/permissions` | 查看和管理工具执行权限 |
| `/login` | 登录/切换账号 |
| `/logout` | 退出登录 |

### Git 集成
| 命令 | 作用 |
|------|------|
| `/commit` | 让 Claude 帮你生成 commit 信息并提交 |
| `/pr` | 创建 Pull Request（Summary + 描述 + 测试清单） |
| `/pr-review` | 审查一个 Pull Request |

### 项目管理
| 命令 | 作用 |
|------|------|
| `/create-project` | 创建新项目 |
| `/memory` | 查看/编辑持久化记忆 |
| `/todo` | 管理当前会话的待办事项列表 |

---

## 二、记忆系统（Memory）

Claude Code 有持久化记忆机制，记住你的偏好和项目上下文。

### 存放位置
```
~/.claude/projects/<项目名>/memory/
```

### 记忆类型

| 类型 | 用途 | 示例 |
|------|------|------|
| **user** | 用户角色、偏好、知识背景 | "我是 CS 学生，有 C++ 基础" |
| **project** | 项目状态、目标、决策 | "Day 1 已完成，正在 Day 2" |
| **feedback** | 用户给的行为指导 | "先讲原理再写代码" |
| **reference** | 外部系统指针 | "仓库地址: github.com/xxx" |

### 自动写入
- Claude 会在对话中学到你的偏好并自动保存
- 查看：`/memory` 命令

---

## 三、CLAUDE.md / NoteForClaude.md

项目根目录下的 CLAUDE.md（或 NoteForClaude.md）是给 Claude 的**项目说明书**，每次对话自动加载。

可以包含：
- 项目技术栈和架构
- 编码规范和约定
- 教学/协作偏好
- 常用命令和工作流
- 当前进度和 TODO

---

## 四、IDE 集成功能

### VS Code 扩展
- 在 VS Code 侧边栏直接使用 Claude Code
- 选中代码右键 → "Ask Claude" 提问
- 代码内联聊天
- 终端集成

### 文件引用
对话中引用文件使用 markdown 链接格式：
```
[filename.ts](src/filename.ts)         → 可点击打开文件
[filename.ts:42](src/filename.ts#L42)  → 定位到第 42 行
```

---

## 五、Plan Mode（计划模式）

适合复杂任务。工作流程：

1. **进入**：`/plan` 或工具自动触发
2. **探索**：Claude 搜索代码库，理解上下文
3. **设计**：生成实施计划并写入 plan 文件
4. **审查**：用户审批计划
5. **退出**：调用 `ExitPlanMode`，开始执行

---

## 六、权限系统（Permissions）

Claude Code 区分三类操作，按需授权：

| 权限级别 | 说明 |
|----------|------|
| **自动允许** | 纯读取操作（读文件、搜索代码） |
| **每次确认** | 可能修改文件的操作（编辑、写入） |
| **需要审批** | 高风险操作（git push、rm -rf、网络请求） |

可通过 `/permissions` 管理白名单。

---

## 七、后台任务与自动化

### 后台命令
```bash
# 在后台运行长时间任务
npm run dev          → 通过 Bash 工具的 run_in_background: true
```

### 循环任务
```
/loop 5m "检查部署状态"   → 每 5 分钟执行一次
/loop 10m /test          → 每 10 分钟跑测试
```

### Cron 定时任务
支持标准 cron 表达式，可持久化到 `.claude/scheduled_tasks.json`。

---

## 八、多 Agent 并行

Claude Code 可以启动多个子 Agent 并行工作：

| Agent 类型 | 用途 |
|------------|------|
| **Explore** | 快速搜索代码库（只读） |
| **Plan** | 设计实施方案 |
| **general-purpose** | 通用任务执行 |
| **claude-code-guide** | 解答 Claude Code 本身的问题 |

---

## 九、常用快捷键（VS Code 集成）

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+I` | 打开 Claude Code 面板 |
| `Ctrl+L` | 在对话中添加选中代码 |
| `Ctrl+K` | 打开内联代码编辑 |
| `Ctrl+Enter` | 提交当前消息 |

---

## 十、最佳实践

1. **先讲原理再写代码**：让 Claude 在实现前解释设计思路
2. **使用 Plan Mode**：复杂任务先设计方案，避免返工
3. **善用记忆**：把偏好和项目上下文写入 CLAUDE.md 或让 Claude 自动记忆
4. **逐步进行**：不要一次让 Claude 生成所有文件，分阶段推进
5. **定期压缩对话**：当上下文快满时用 `/compact`，避免 token 浪费
6. **代码审查**：做完改动后用 `/review` 或 `/simplify` 检查质量
