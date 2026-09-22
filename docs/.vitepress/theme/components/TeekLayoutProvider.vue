<script setup lang="ts" name="TeekLayoutProvider">
import {defineAsyncComponent} from "vue";
import Teek from "vitepress-theme-teek";
import NotFound from "./404.vue";
import CustomRiskLinkPage from "./CustomRiskLinkPage.vue";

// 贡献图只在归档页插槽渲染，异步加载避免 echarts 被打进全局 theme chunk
const ContributeChart = defineAsyncComponent(() => import("./ContributeChart.vue"));
</script>

<template>
  <Teek.Layout>
    <template #teek-archives-top-before>
      <ContributeChart />
    </template>

    <template #not-found>
      <NotFound />
    </template>

    <template #teek-risk-link-page>
      <CustomRiskLinkPage />
    </template>
  </Teek.Layout>
</template>

<style lang="scss">
.tk-my.is-circle-bg {
  margin-bottom: 20px;

  .tk-my__avatar.circle-rotate {
    margin-top: 200px;
  }
}
</style>
