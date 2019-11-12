<!--
 * @Description: 
 * @Author: chengyuming
 * @Date: 2019-09-04 14:22:50
 * @LastEditors: chengyuming
 * @LastEditTime: 2019-11-11 23:16:01
 -->
<template>
  <SWUpdatePopup>
    <div
      slot-scope="{ enabled, reload, message, buttonText }"
      class="my-sw-update-popup">
      {{ message }}<br>
      <button @click="reload">{{ buttonText }}</button>
    </div>
  </SWUpdatePopup>
</template>

<script>
import SWUpdatePopup from '@vuepress/plugin-pwa/lib/SWUpdatePopup.vue'

export default {
  components: { SWUpdatePopup }
}
</script>

<style>
.my-sw-update-popup {
  text-align: right;
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #fff;
  font-size: 20px;
  padding: 10px;
  border: 5px solid #3eaf7c;
  border-radius: 8px;
}

.my-sw-update-popup button {
  border: 1px solid #fefefe;
}
</style>