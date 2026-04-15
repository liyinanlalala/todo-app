# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目说明

基于 Vite React-TS 模板初始化的 todo 应用。`src/` 目前仍是脚手架默认内容(`App.tsx`、`main.tsx`),todo 功能尚未开始开发。

## 技术栈

- React 19 + TypeScript,使用 Vite 8 打包(`@vitejs/plugin-react`,基于 Oxc)。
- ESLint 9 flat config(`eslint.config.js`),启用 `typescript-eslint`、`react-hooks`、`react-refresh`。**未**启用 type-aware 规则,如需开启参考 README。
- 包管理器:**pnpm**(lockfile 为 `pnpm-lock.yaml`)。`.npmrc` 设置了 `engine-strict=true`,`.nvmrc` 锁定 Node 24,`package.json` 要求 `node >=24.0.0`——用 npm/yarn 或低版本 Node 安装会被直接拒绝。

## 常用命令

```bash
pnpm dev        # 启动 Vite 开发服务器(HMR)
pnpm build      # 先 tsc -b(project references),再 vite build
pnpm lint       # eslint .
pnpm preview    # 预览生产构建
```

目前没有配置测试框架,不要臆造 `pnpm test`。

## TypeScript 结构

使用 project references:根 `tsconfig.json` 组合了 `tsconfig.app.json`(`src/` 应用代码)和 `tsconfig.node.json`(Vite 等工具配置)。`pnpm build` 中的 `tsc -b` 会按引用关系编译——修改编译选项时要改对应的子配置文件,而不是根 `tsconfig.json`。
