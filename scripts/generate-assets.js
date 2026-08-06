import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const logoPath = path.join(rootDir, 'src', 'logo.svg');
const assetsDir = path.join(rootDir, 'assets');
const resDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');

console.log('Generating premium assets using sharp...');

try {
  // Ensure assets directory exists
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // 1. Generate icon-background.png (solid white 1024x1024)
  console.log('- Generating icon-background.png...');
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .png()
  .toFile(path.join(assetsDir, 'icon-background.png'));

  // 2. Generate icon-foreground.png (transparent 1024x1024 with centered logo scaled to 512x512)
  console.log('- Generating icon-foreground.png...');
  const foregroundLogo = await sharp(logoPath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{ input: foregroundLogo, gravity: 'center' }])
  .png()
  .toFile(path.join(assetsDir, 'icon-foreground.png'));

  // 3. Generate icon-only.png (solid white 1024x1024 with centered logo scaled to 550x550)
  console.log('- Generating icon-only.png...');
  const iconLogo = await sharp(logoPath)
    .resize(550, 550, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{ input: iconLogo, gravity: 'center' }])
  .png()
  .toFile(path.join(assetsDir, 'icon-only.png'));

  // 4. Generate splash.png and splash-dark.png (2732x2732 with centered logo only)
  console.log('- Generating splash.png...');
  const splashLogoSize = 512;
  const splashLogo = await sharp(logoPath)
    .resize(splashLogoSize, splashLogoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([
    { input: splashLogo, gravity: 'center' }
  ])
  .png()
  .toFile(path.join(assetsDir, 'splash.png'));

  // Copy to splash-dark.png as well
  fs.copyFileSync(path.join(assetsDir, 'splash.png'), path.join(assetsDir, 'splash-dark.png'));
  console.log('- Generating splash-dark.png (copied from splash.png)...');

  console.log('Running @capacitor/assets generation command...');
  execSync('npx @capacitor/assets generate --android', { cwd: rootDir, stdio: 'inherit' });

  // 5. Generate monochrome icons and update adaptive XML icons
  if (fs.existsSync(resDir)) {
    console.log('Configuring adaptive icon assets (including Monochrome for Android 13+)...');
    
    // Copy ic_launcher_foreground.png to ic_launcher_monochrome.png in all mipmap folders
    const mipmapDirs = fs.readdirSync(resDir).filter(name => name.startsWith('mipmap-') && name !== 'mipmap-anydpi-v26');
    for (const dir of mipmapDirs) {
      const dirPath = path.join(resDir, dir);
      const fgPath = path.join(dirPath, 'ic_launcher_foreground.png');
      const monoPath = path.join(dirPath, 'ic_launcher_monochrome.png');
      if (fs.existsSync(fgPath)) {
        fs.copyFileSync(fgPath, monoPath);
        console.log(`  - Copied monochrome icon to ${dir}/ic_launcher_monochrome.png`);
      }
    }

    // Update xml adaptive configs to reference monochrome channel
    const anyDpiDir = path.join(resDir, 'mipmap-anydpi-v26');
    if (fs.existsSync(anyDpiDir)) {
      const xmlFiles = ['ic_launcher.xml', 'ic_launcher_round.xml'];
      const adaptiveXmlContent = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background>
        <inset android:drawable="@mipmap/ic_launcher_background" android:inset="16.7%" />
    </background>
    <foreground>
        <inset android:drawable="@mipmap/ic_launcher_foreground" android:inset="16.7%" />
    </foreground>
    <monochrome>
        <inset android:drawable="@mipmap/ic_launcher_monochrome" android:inset="16.7%" />
    </monochrome>
</adaptive-icon>`;

      for (const file of xmlFiles) {
        fs.writeFileSync(path.join(anyDpiDir, file), adaptiveXmlContent, 'utf8');
        console.log(`  - Updated ${file} with monochrome adaptive tags`);
      }
    }

    // Delete any template XMLs from drawable that can interfere with adaptive icon resources
    const drawableDir = path.join(resDir, 'drawable');
    const fgXml = path.join(drawableDir, 'ic_launcher_foreground.xml');
    const bgXml = path.join(drawableDir, 'ic_launcher_background.xml');
    if (fs.existsSync(fgXml)) {
      fs.unlinkSync(fgXml);
      console.log('  - Cleaned template ic_launcher_foreground.xml from drawable');
    }
    if (fs.existsSync(bgXml)) {
      fs.unlinkSync(bgXml);
      console.log('  - Cleaned template ic_launcher_background.xml from drawable');
    }
    
    const drawableV24Dir = path.join(resDir, 'drawable-v24');
    if (fs.existsSync(drawableV24Dir)) {
      const fgXmlV24 = path.join(drawableV24Dir, 'ic_launcher_foreground.xml');
      if (fs.existsSync(fgXmlV24)) {
        fs.unlinkSync(fgXmlV24);
        console.log('  - Cleaned template ic_launcher_foreground.xml from drawable-v24');
      }
    }
  }

  console.log('Successfully completed generating and configuring all branding resources!');
} catch (e) {
  console.error('Error generating assets:', e);
  process.exit(1);
}
