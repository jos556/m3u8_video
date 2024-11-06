import { defineStore } from 'pinia'

export const useConverterStore = defineStore('converter', {
  state: () => ({
    isConverting: false,
    progress: 0,
    currentFile: null
  }),
  
  actions: {
    setProgress(value) {
      this.progress = value
    },
    
    setConverting(value) {
      this.isConverting = value
    },
    
    setCurrentFile(file) {
      this.currentFile = file
    }
  }
}) 