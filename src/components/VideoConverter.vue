<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="space-y-6">
      <div>
        <label for="m3u8-url" class="block text-sm font-medium text-gray-700">
          M3U8 網址
        </label>
        <div class="mt-1">
          <input
            type="text"
            name="m3u8-url"
            id="m3u8-url"
            v-model="m3u8Url"
            class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="請輸入 M3U8 網址"
          />
        </div>
      </div>

      <div>
        <button
          @click="startConversion"
          :disabled="isConverting"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {{ isConverting ? '轉換中...' : '開始轉換' }}
        </button>
      </div>

      <div v-if="progress > 0" class="relative pt-1">
        <div class="flex mb-2 items-center justify-between">
          <div>
            <span class="text-xs font-semibold inline-block text-indigo-600">
              轉換進度
            </span>
          </div>
          <div class="text-right">
            <span class="text-xs font-semibold inline-block text-indigo-600">
              {{ progress }}%
            </span>
          </div>
        </div>
        <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
          <div
            :style="{ width: progress + '%' }"
            class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const m3u8Url = ref('')
const isConverting = ref(false)
const progress = ref(0)

const startConversion = async () => {
  if (!m3u8Url.value) return
  
  isConverting.value = true
  progress.value = 0
  
  try {
    // TODO: 實現轉換邏輯
    
  } catch (error) {
    console.error('轉換失敗:', error)
  } finally {
    isConverting.value = false
  }
}
</script> 