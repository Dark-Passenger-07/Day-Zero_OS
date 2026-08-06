import { Capacitor } from '@capacitor/core'

export const isNativeMobile = (): boolean => {
  return Capacitor.isNativePlatform()
}

export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android'
}

export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios'
}

export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI__' in window
}

export const isWeb = (): boolean => {
  return !isNativeMobile() && !isTauri()
}
