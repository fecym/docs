<script setup lang="ts" name="ContributeChart">
import * as echarts from "echarts/core";
import {HeatmapChart} from "echarts/charts";
import {CalendarComponent, TooltipComponent, VisualMapComponent} from "echarts/components";
import {CanvasRenderer} from "echarts/renderers";
import { ref, watch, nextTick, computed, useTemplateRef, onMounted, onBeforeUnmount } from "vue";
import { useData } from "vitepress";
import { formatDate, usePosts, useIntersectionObserver } from "vitepress-theme-teek";

// 按需注册：只保留贡献图（日历坐标系热力图）需要的模块，避免全量引入 echarts
echarts.use([HeatmapChart, CalendarComponent, TooltipComponent, VisualMapComponent, CanvasRenderer]);

const { isDark } = useData();
const posts = usePosts();

// 今天
const today = formatDate(new Date(), "yyyy-MM-dd");
// 获取一年前的时间
const beforeOnYear = formatDate(new Date(new Date().getTime() - 364 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");

// 贡献图数据
const contributeList = computed(() => {
  const contributeObject = ref({});

  posts.value.sortPostsByDate.forEach(item => {
    if (!item.date) return;

    const date = item.date.substring(0, 10);
    if (contributeObject.value[date]) contributeObject.value[date]++;
    else contributeObject.value[date] = 1;
  });

  const contributeDays = Object.keys(contributeObject.value);

  return contributeDays.map((item: string) => [item, contributeObject.value[item]]).reverse();
});

const chartRef = useTemplateRef("chartRef");
const contributeChart = ref<echarts.ECharts>();

// 视口过窄时隐藏贡献图：日历热力图宽度约等于 53 周 × 格子尺寸，太窄无法完整展示
const showChart = ref(true);
// 容器高度按格子尺寸动态计算，避免日历上下出现大片空白
const chartHeight = ref(180);
// 日历固定占用：53 列（一年约 53 周）× 7 行；标签区域约占 100px 宽、28px 高
const CALENDAR_COLUMNS = 53;
const CALENDAR_ROWS = 7;
const CALENDAR_LABEL_WIDTH = 100;
const CALENDAR_TOP_SPACE = 28;
const CALENDAR_BOTTOM_SPACE = 12;
const MIN_CELL_SIZE = 10;
// 最小可用容器宽度（格子 10px 时约需 630px）
const MIN_CHART_WIDTH = CALENDAR_COLUMNS * MIN_CELL_SIZE + CALENDAR_LABEL_WIDTH;
// 视口小于该宽度时直接隐藏（容器宽度 ≈ 视口宽度减去页面留白）
const MIN_VIEWPORT_WIDTH = 720;
let resizeObserver: ResizeObserver | undefined;
let lastRenderedWidth = 0;

/** 用尽量大的整数格子填满容器宽度（上限 20px），既完整显示又不浪费横向空间 */
const resolveCellSize = (width: number) =>
  Math.max(
    MIN_CELL_SIZE,
    Math.min(20, Math.floor((width - CALENDAR_LABEL_WIDTH) / CALENDAR_COLUMNS)),
  );

const { create } = useIntersectionObserver(
  chartRef,
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 使用 requestAnimationFrame 确保在下一帧执行
        requestAnimationFrame(() => {
          renderChart(contributeList.value).catch(error => console.error("初始化贡献图失败:", error));
        });
      }
    });
  },
  0.1
);

// Echarts 配置项
const option: any = {
  tooltip: {
    formatter: function (params) {
      return `${params.value[0]} <br/> ${params.value[1]} 篇文章`;
    },
  },
  visualMap: {
    show: false,
    min: 0,
    max: 5,
    inRange: {
      color: ["#ebedf0", "#c6e48b", "#7bc96f", "#239a3b", "#196127", "#196127"],
    },
  },
  calendar: {
    left: "center",
    itemStyle: {
      color: "#ebedf0",
      borderWidth: 5,
      borderColor: "#fff",
      shadowBlur: 0,
    },
    cellSize: [20, 20],
    range: [beforeOnYear, today],
    splitLine: true,
    dayLabel: {
      firstDay: 7,
      nameMap: "ZH",
      color: "#3c3c43",
    },
    monthLabel: {
      color: "#3c3c43",
    },
    yearLabel: {
      show: true,
      position: "right",
    },
    silent: {
      show: false,
    },
  },
  series: {
    type: "heatmap",
    coordinateSystem: "calendar",
    data: [],
  },
};

// 渲染贡献图
const renderChart = async (data: any) => {
  const chartEl = chartRef.value;
  if (!chartEl) return;

  const width = chartEl.clientWidth;
  // 容器不可见（display: none）或过窄时不初始化，避免图表被裁切
  if (width < MIN_CHART_WIDTH) {
    if (contributeChart.value) {
      echarts.dispose(contributeChart.value);
      contributeChart.value = undefined;
    }
    return;
  }

  const cellSize = resolveCellSize(width);
  option.calendar.cellSize = [cellSize, cellSize];
  option.calendar.top = CALENDAR_TOP_SPACE;
  option.calendar.itemStyle.borderColor = isDark.value ? "#1b1b1f" : "#fff";
  option.calendar.itemStyle.color = isDark.value ? "#787878" : "#ebedf0";

  // 容器高度贴合内容（7 行格子 + 月份标签 + 底部留白）
  const nextHeight = cellSize * CALENDAR_ROWS + CALENDAR_TOP_SPACE + CALENDAR_BOTTOM_SPACE;
  if (chartHeight.value !== nextHeight) {
    chartHeight.value = nextHeight;
    // 等容器高度生效后再初始化，保证 canvas 尺寸正确
    await nextTick();
  }

  if (contributeChart.value) echarts.dispose(contributeChart.value);
  contributeChart.value = echarts.init(chartEl);

  option.series.data = data;
  contributeChart.value.setOption(option);
  lastRenderedWidth = width;
};

/** 容器宽度变化时按新宽度重绘（桌面端缩放窗口、侧边栏折叠等） */
const observeChartSize = () => {
  if (resizeObserver || !chartRef.value) return;
  resizeObserver = new ResizeObserver(entries => {
    const width = entries[0]?.contentRect.width ?? 0;
    // 变化小于 60px 不重绘，避免与 echarts 自身的尺寸变化相互触发
    if (Math.abs(width - lastRenderedWidth) < 60) return;
    renderChart(contributeList.value);
  });
  resizeObserver.observe(chartRef.value);
};

/** 视口过窄时隐藏图表，恢复到足够宽度后重新渲染 */
const syncChartVisibility = () => {
  showChart.value = window.innerWidth >= MIN_VIEWPORT_WIDTH;
};

watch(
  contributeList,
  async newValue => {
    await nextTick();
    await renderChart(newValue);
  },
  { flush: "post" }
);

watch(isDark, async () => {
  await nextTick();
  await renderChart(contributeList.value);
});

watch(showChart, async visible => {
  await nextTick();
  if (!visible) return;
  observeChartSize();
  await renderChart(contributeList.value);
});

onMounted(() => {
  syncChartVisibility();
  window.addEventListener("resize", syncChartVisibility);

  if (!showChart.value) return;
  if (chartRef.value) create();
  observeChartSize();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", syncChartVisibility);
  resizeObserver?.disconnect();
  resizeObserver = undefined;
  if (contributeChart.value) echarts.dispose(contributeChart.value);
});
</script>

<template>
  <div v-show="showChart" class="contribute__chart" :style="{ height: `${chartHeight}px` }">
    <div class="chart__box" ref="chartRef"></div>
  </div>
</template>

<style>
/* 归档页内容区：宽屏维持 1220px，窄屏自适应，避免移动端整页横向溢出 */
.tk-article-page.tk-archives {
  width: 100%;
  max-width: 1220px;
}

.tk-archives .contribute__chart {
  width: 100%;
}

.tk-archives .contribute__chart .chart__box {
  margin: auto;
  width: 100%;
  height: 100%;
}
</style>
