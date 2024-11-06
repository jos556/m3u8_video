<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-lg font-medium text-gray-900 mb-6">轉換器設定</h2>
    
    <div class="space-y-6">
      <!-- 輸出品質設定 -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          輸出影片品質
        </label>
        <select 
          v-model="settings.quality"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="high">高品質 (原始品質)</option>
          <option value="medium">中等品質</option>
          <option value="low">低品質 (較小檔案)</option>
        </select>
      </div>

      <!-- 自動下載設定 -->
      <div class="relative flex items-start">
        <div class="flex items-center h-5">
          <input
            id="autoDownload"
            v-model="settings.autoDownload"
            type="checkbox"
            class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          >
        </div>
        <div class="ml-3 text-sm">
          <label for="autoDownload" class="font-medium text-gray-700">轉換完成後自動下載</label>
          <p class="text-gray-500">啟用後會在轉換完成時自動開始下載檔案</p>
        </div>
      </div>

      <!-- 檔案命名設定 -->
      <div>
        <label class="block text-sm font-medium text-gray-700">
          檔案命名格式
        </label>
        <input
          type="text"
          v-model="settings.fileNamePattern"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="例如: video_{timestamp}"
        >
        <p class="mt-2 text-sm text-gray-500">
          可用變數: {timestamp}, {date}, {original}
        </p>
      </div>

      <!-- 儲存按鈕 -->
      <div class="flex justify-end mt-6">
        <button
          @click="saveSettings"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          儲存設定
        </button>
      </div>
    </div>

    <!-- 儲存成功提示 -->
    <div v-if="showSaveSuccess" class="fixed bottom-4 right-4">
      <div class="bg-green-50 p-4 rounded-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800">
              設定已儲存
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useConverterStore } from '../stores/converter'

const store = useConverterStore()
const showSaveSuccess = ref(false)

const settings = ref({
  quality: 'high',
  autoDownload: true,
  fileNamePattern: 'video_{timestamp}'
})

const saveSettings = () => {
  // 儲存設定到 localStorage
  localStorage.setItem('converterSettings', JSON.stringify(settings.value))
  
  // 更新 store 中的設定
  store.updateSettings(settings.value)
  
  // 顯示儲存成功提示
  showSaveSuccess.value = true
  setTimeout(() => {
    showSaveSuccess.value = false
  }, 2000)
}

// 在組件掛載時讀取儲存的設定
const loadSettings = () => {
  const savedSettings = localStorage.getItem('converterSettings')
  if (savedSettings) {
    settings.value = JSON.parse(savedSettings)
  }
}

loadSettings()
</script> 