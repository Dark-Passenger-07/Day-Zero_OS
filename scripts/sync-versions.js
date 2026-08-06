import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// 1. Read package.json version
const packageJsonPath = path.join(rootDir, 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
const version = packageJson.version

console.log(`Syncing version ${version}...`)

// 2. Sync to tauri.conf.json
const tauriConfPath = path.join(rootDir, 'src-tauri', 'tauri.conf.json')
if (fs.existsSync(tauriConfPath)) {
  const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'))
  tauriConf.version = version
  fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2), 'utf8')
  console.log(`Synced version ${version} to tauri.conf.json`)
}

// 3. Sync to android/app/build.gradle (if exists)
const buildGradlePath = path.join(rootDir, 'android', 'app', 'build.gradle')
if (fs.existsSync(buildGradlePath)) {
  let gradleContent = fs.readFileSync(buildGradlePath, 'utf8')
  
  // Parse semver parts
  const [major, minor, patch] = version.split('.').map(Number)
  const computedVersionCode = (major || 0) * 10000 + (minor || 0) * 100 + (patch || 0)
  
  // Replace versionCode
  gradleContent = gradleContent.replace(/versionCode\s+\d+/, `versionCode ${computedVersionCode}`)
  // Replace versionName
  gradleContent = gradleContent.replace(/versionName\s+"[^"]+"/, `versionName "${version}"`)
  
  fs.writeFileSync(buildGradlePath, gradleContent, 'utf8')
  console.log(`Synced version ${version} (code: ${computedVersionCode}) to android/app/build.gradle`)
}
