import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // 新增的server配置块 ↓↓↓
  server: {
    host: "0.0.0.0", // 监听所有网络接口，允许外部IP/域名访问
    port: 5173, // 可选：指定端口（你需要的5173端口）
    strictPort: true, // 端口被占用时直接报错，避免自动切换端口
    allowedHosts: [
      "www.inspirationrental.top", // 明确允许该域名访问
      "inspirationrental.top", // 可选：同时允许不带www的主域名
      // 也可以用通配符：".inspirationrental.top" 允许所有子域名
    ],
  },
  // 新增的server配置块 ↑↑↑
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
})
