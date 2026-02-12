import Teek, {giscusContext, teekConfigContext} from "vitepress-theme-teek";
// @ts-ignore
import TeekLayoutProvider from "./components/TeekLayoutProvider.vue";

// Teek 在线主题包引用（需安装 Teek 在线版本）
import "vitepress-theme-teek/index.css";
import "vitepress-theme-teek/theme-chalk/tk-code-block-mobile.css"; // 移动端代码块样式优化
import "vitepress-theme-teek/theme-chalk/tk-sidebar.css"; // 侧边栏优化
import "vitepress-theme-teek/theme-chalk/tk-nav.css"; // 导航栏优化
import "vitepress-theme-teek/theme-chalk/tk-aside.css"; // 右侧目栏录文字悬停和激活样式
import "vitepress-theme-teek/theme-chalk/tk-doc-h1-gradient.css"; // 一级标题渐变色
import "vitepress-theme-teek/theme-chalk/tk-table.css"; // 表格样式调整，去掉单元格之间的线条
import "vitepress-theme-teek/theme-chalk/tk-mark.css"; // <mark></mark> 样式
import "vitepress-theme-teek/theme-chalk/tk-blockquote.css"; // > 引用块样式
import "vitepress-theme-teek/theme-chalk/tk-index-rainbow.css"; // 首页图片彩虹动画
import "vitepress-theme-teek/theme-chalk/tk-banner-desc-gradient.css"; // 博客风格 Banner 描述渐变样式
import "vitepress-theme-teek/theme-chalk/tk-home-card-hover.css"; // 首页卡片悬停效果
import "vitepress-theme-teek/theme-chalk/tk-fade-up-animation.css"; // 首次加载的动画效果
import "vitepress-theme-teek/theme-chalk/tk-article-appreciation.css"; // 赞赏组件样式

import "./styles/code-bg.scss";
import "./styles/iframe.scss";
import "./styles/hero-image-3d.css"; // 首页 Logo 3D 倾斜效果

import Giscus from "@giscus/vue";
import {defineComponent, h, provide} from "vue";

export default {
  extends: Teek,
  // Layout: TeekLayoutProvider,
  Layout: defineComponent({
    name: "LayoutProvider",
    setup() {

      provide(giscusContext, () => Giscus);

      // 配置赞赏组件
      provide(teekConfigContext, {
        appreciation: {
          position: "doc-after", // 自动插入到文章底部
          options: {
            icon: "weChatPay", // 赞赏图标，内置 weChatPay 和 alipay
            expandTitle: "打赏支持", // 展开标题，支持 HTML
            collapseTitle: "下次一定", // 折叠标题，支持 HTML
            content: `<div style="display: flex; flex-direction: column; align-items: center; padding: 20px;">
              <div style="
                padding: 10px; 
                background: #fff; 
                border-radius: 12px; 
                box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
              "
              onmouseover="this.style.transform='scale(1.05) rotate(2deg)'"
              onmouseout="this.style.transform='scale(1) rotate(0deg)'"
              >
                <img src="/appreciate-qrcode.jpg" width="200" height="200" alt="赞赏二维码" style="display: block; border-radius: 6px;">
              </div>
              <p style="margin-top: 16px; font-size: 14px; color: var(--vp-c-text-2); font-weight: 500; letter-spacing: 1px;">感谢老板 ☕️</p>
            </div>`,
            expand: false, // 是否默认展开，默认 false
          },
        },
      });

      return () => h(TeekLayoutProvider, null, {});
      // return () => h(Teek.Layout, null, {});
    },
  }),
};
