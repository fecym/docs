<script setup lang="ts">
import { ref, onMounted } from 'vue'

const target = ref('')

onMounted(() => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    target.value = urlParams.get('target') || ''
  }
})

const go = () => {
  if (target.value) {
    window.location.href = target.value
  }
}

const back = () => {
  // 尝试关闭窗口（针对新标签页）
  window.close()
  // 如果没关闭，尝试返回上一页
  window.history.back()
}
</script>

<template>
  <div class="risk-link-container">
    <div class="risk-card">
      <div class="icon-wrapper">
        <span class="icon">⚠️</span>
      </div>
      
      <h2>即将跳转到外部链接</h2>
      
      <p class="desc">
        您即将离开 <strong>风起代码间</strong>，跳转至第三方网站。
        <br>请注意识别风险，保护个人信息及财产安全。
      </p>

      <div class="target-link">
        {{ target }}
      </div>

      <div class="actions">
        <button class="btn cancel" @click="back">取消跳转</button>
        <button class="btn confirm" @click="go">继续访问</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.risk-link-container {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.risk-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.icon-wrapper {
  font-size: 48px;
  margin-bottom: 20px;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--vp-c-text-1);
}

.desc {
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 24px;
}

.target-link {
  background: var(--vp-c-bg-alt);
  padding: 12px;
  border-radius: 6px;
  color: var(--vp-c-brand);
  font-family: monospace;
  word-break: break-all;
  margin-bottom: 30px;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn {
  padding: 10px 24px;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 14px;
}

.btn.cancel {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

.btn.cancel:hover {
  background: var(--vp-c-bg-mute);
}

.btn.confirm {
  background: var(--vp-c-brand);
  color: white;
}

.btn.confirm:hover {
  background: var(--vp-c-brand-2);
  color: white;
}
</style>
