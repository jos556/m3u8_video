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
          <button
            @click="checkStreams"
            :disabled="isChecking || !m3u8Url"
            class="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span v-if="isChecking">檢查中...</span>
            <span v-else>檢查可用串流</span>
          </button>
        </div>
      </div>

      <!-- 可用串流列表 -->
      <div v-if="availableStreams.length > 0" class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          可用串流列表
        </label>
        <div class="bg-gray-50 p-3 rounded-md space-y-2 max-h-60 overflow-y-auto">
          <div
            v-for="(stream, index) in availableStreams"
            :key="index"
            class="flex items-center justify-between p-2 hover:bg-gray-100 rounded"
          >
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-900">
                串流 {{ index + 1 }}
                <span v-if="stream.resolution" class="ml-2 text-gray-500">
                  ({{ stream.resolution }})
                </span>
                <span v-if="stream.bandwidth" class="ml-2 text-gray-500">
                  {{ formatBandwidth(stream.bandwidth) }}
                </span>
              </div>
              <div class="text-xs text-gray-500 truncate">
                {{ stream.url }}
              </div>
            </div>
            <button
              @click="selectStream(stream.url)"
              class="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              選擇
            </button>
          </div>
        </div>
      </div>

      <!-- 原有的轉換按鈕和進度條等 -->
      <div class="flex space-x-4">
        <button
          @click="startConversion"
          :disabled="isConverting || !m3u8Url"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <span v-if="isConverting">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            轉換中...
          </span>
          <span v-else>開始轉換</span>
        </button>

        <button
          v-if="outputUrl"
          @click="downloadVideo"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          下載影片
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
            class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"
          ></div>
        </div>
      </div>

      <div v-if="error" class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              轉換失敗
            </h3>
            <div class="mt-2 text-sm text-red-700">
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useConverterStore } from '../stores/converter'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

const store = useConverterStore()
const ffmpeg = createFFmpeg({ 
  log: true,
  corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
})
const m3u8Url = ref('')
const isConverting = ref(false)
const progress = ref(0)
const error = ref(null)
const outputUrl = ref(null)
const isChecking = ref(false)
const availableStreams = ref([])

// 初始化 FFmpeg
onMounted(async () => {
  try {
    await ffmpeg.load()
  } catch (err) {
    error.value = '無法載入轉換工具，請確認瀏覽器支援 WebAssembly'
  }
})

const generateFileName = () => {
  const pattern = store.settings.fileNamePattern
  const timestamp = Date.now()
  const date = new Date().toISOString().split('T')[0]
  const original = m3u8Url.value.split('/').pop().split('.')[0]

  return pattern
    .replace('{timestamp}', timestamp)
    .replace('{date}', date)
    .replace('{original}', original)
    .concat('.mp4')
}

const parseM3U8 = (content, baseUrl) => {
  const lines = content.split('\n')
  const segments = []
  
  for (let line of lines) {
    line = line.trim()
    if (line && !line.startsWith('#')) {
      const url = line.startsWith('http') ? line : baseUrl + line
      segments.push(url)
    }
  }
  
  return segments
}

const downloadSegment = async (url) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('無法下載片段')
  return await response.arrayBuffer()
}

const startConversion = async () => {
  if (!m3u8Url.value || isConverting.value) return

  try {
    isConverting.value = true
    error.value = null
    progress.value = 0
    outputUrl.value = null

    // 下載並解析 M3U8
    const m3u8Response = await fetch(m3u8Url.value)
    if (!m3u8Response.ok) {
      throw new Error('無法下載 M3U8 文件')
    }
    const m3u8Content = await m3u8Response.text()
    console.log('M3U8 內容:', m3u8Content)
    
    // 獲取基礎URL
    const baseUrl = m3u8Url.value.substring(0, m3u8Url.value.lastIndexOf('/') + 1)
    const segments = parseM3U8(m3u8Content, baseUrl)
    
    if (segments.length === 0) {
      throw new Error('未找到視頻片段')
    }

    console.log(`找到 ${segments.length} 個片段`)

    // 下載並處理每個片段
    for (let i = 0; i < segments.length; i++) {
      try {
        console.log(`下載片段 ${i + 1}/${segments.length}`)
        const segmentData = await downloadSegment(segments[i])
        const segmentName = `segment_${i}.ts`
        ffmpeg.FS('writeFile', segmentName, new Uint8Array(segmentData))
        progress.value = Math.round((i + 1) / segments.length * 50)
      } catch (err) {
        console.error(`處理片段 ${i} 失敗:`, err)
        throw err
      }
    }

    // 創建合併腳本
    let concatContent = ''
    for (let i = 0; i < segments.length; i++) {
      concatContent += `file segment_${i}.ts\n`
    }
    ffmpeg.FS('writeFile', 'concat.txt', concatContent)
    console.log('合併腳本內容:', concatContent)

    // 合併並轉換
    console.log('開始合併和轉換...')
    progress.value = 75

    // 使用 FFmpeg 合併並轉換
    await ffmpeg.run(
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-strict', 'experimental',
      'output.mp4'
    )

    // 讀取輸出文件
    const data = ffmpeg.FS('readFile', 'output.mp4')
    console.log('輸出文件大小:', data.length)

    // 創建下載鏈接
    const blob = new Blob([data.buffer], { type: 'video/mp4' })
    outputUrl.value = URL.createObjectURL(blob)

    // 清理臨時文件
    try {
      // 清理片段文件
      for (let i = 0; i < segments.length; i++) {
        ffmpeg.FS('unlink', `segment_${i}.ts`)
      }
      ffmpeg.FS('unlink', 'concat.txt')
      ffmpeg.FS('unlink', 'output.mp4')
    } catch (e) {
      console.warn('清理文件時發生錯誤:', e)
    }

    if (store.settings.autoDownload) {
      downloadVideo()
    }

    progress.value = 100
  } catch (err) {
    console.error('轉換錯誤:', err)
    error.value = err.message || '轉換過程中發生錯誤'
  } finally {
    isConverting.value = false
  }
}

const downloadVideo = () => {
  if (!outputUrl.value) return

  const a = document.createElement('a')
  a.href = outputUrl.value
  a.download = generateFileName()  // 現在直接使用 .mp4 擴展名
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// 格式化頻寬顯示
const formatBandwidth = (bandwidth) => {
  if (!bandwidth) return ''
  const mbps = bandwidth / 1024 / 1024
  return `${mbps.toFixed(1)} Mbps`
}

// 解析 M3U8 中的串流信息
const parseStreamInfo = (content, baseUrl) => {
  const lines = content.split('\n')
  const streams = []
  let currentStream = {}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (line.startsWith('#EXT-X-STREAM-INF:')) {
      currentStream = {}
      // 解析串流信息
      const attributes = line.substring(18).split(',')
      attributes.forEach(attr => {
        const [key, value] = attr.split('=')
        if (key === 'BANDWIDTH') {
          currentStream.bandwidth = parseInt(value)
        } else if (key === 'RESOLUTION') {
          currentStream.resolution = value
        }
      })
    } else if (line && !line.startsWith('#')) {
      // 這是串流的 URL
      currentStream.url = line.startsWith('http') ? line : baseUrl + line
      streams.push({ ...currentStream })
    }
  }

  return streams
}

// 檢查可用串流
const checkStreams = async () => {
  if (!m3u8Url.value || isChecking.value) return

  try {
    isChecking.value = true
    availableStreams.value = []

    const response = await fetch(m3u8Url.value)
    if (!response.ok) {
      throw new Error('無法下載 M3U8 文件')
    }
    const content = await response.text()
    
    const baseUrl = m3u8Url.value.substring(0, m3u8Url.value.lastIndexOf('/') + 1)
    const streams = parseStreamInfo(content, baseUrl)
    
    if (streams.length > 0) {
      availableStreams.value = streams
    } else {
      // 如果沒有找到子串流，可能是直接的媒體播放列表
      availableStreams.value = [{
        url: m3u8Url.value,
        resolution: '原始品質',
        bandwidth: null
      }]
    }
  } catch (err) {
    error.value = '檢查串流失敗: ' + err.message
  } finally {
    isChecking.value = false
  }
}

// 選擇串流
const selectStream = (url) => {
  m3u8Url.value = url
  availableStreams.value = [] // 清空列表
}

// 監聽 FFmpeg 進度
ffmpeg.setProgress(({ ratio }) => {
  if (ratio < 1) {
    progress.value = 75 + Math.round(ratio * 25)
  }
})
</script> 