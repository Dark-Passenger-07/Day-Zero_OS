import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const logoPath = path.join(rootDir, 'src', 'logo.png'); // Back to official branding source
const assetsDir = path.join(rootDir, 'assets');
const resDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');

console.log('Generating premium assets from official logo.png...');

// Standard Android Adaptive and Legacy icon specifications
const adaptiveSizes = {
  ldpi: 81,
  mdpi: 108,
  hdpi: 162,
  xhdpi: 216,
  xxhdpi: 324,
  xxxhdpi: 432
};

const legacySizes = {
  ldpi: 36,
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192
};

async function buildRootAssets() {
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // 1. Generate icon-background.png (solid white 1024x1024)
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
  const foregroundLogo = await sharp(logoPath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' })
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
  const iconLogo = await sharp(logoPath)
    .resize(550, 550, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' })
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
  const splashLogo = await sharp(logoPath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' })
    .toBuffer();

  await sharp({
    create: {
      width: 2732,
      height: 2732,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{ input: splashLogo, gravity: 'center' }])
  .png()
  .toFile(path.join(assetsDir, 'splash.png'));

  fs.copyFileSync(path.join(assetsDir, 'splash.png'), path.join(assetsDir, 'splash-dark.png'));
}

async function runCustomAssetPipeline() {
  await buildRootAssets();

  console.log('Running @capacitor/assets generation to create basic framework structure...');
  execSync('npx @capacitor/assets generate --android', { cwd: rootDir, stdio: 'inherit' });

  if (!fs.existsSync(resDir)) {
    console.error('Android res folder not found, skipping custom high-res overrides.');
    return;
  }

  console.log('Overwriting generated Android resources with high-fidelity custom sharp outputs...');
  const subdirs = fs.readdirSync(resDir);

  for (const subdir of subdirs) {
    const dirPath = path.join(resDir, subdir);
    if (!fs.statSync(dirPath).isDirectory()) continue;

    // Handle Mipmaps (Icons)
    if (subdir.startsWith('mipmap-') && subdir !== 'mipmap-anydpi-v26') {
      const density = subdir.replace('mipmap-', '');
      const adaptiveSize = adaptiveSizes[density];
      const legacySize = legacySizes[density];

      if (adaptiveSize && legacySize) {
        // A. Adaptive Background (108dp solid white)
        await sharp({
          create: {
            width: adaptiveSize,
            height: adaptiveSize,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          }
        })
        .png()
        .toFile(path.join(dirPath, 'ic_launcher_background.png'));

        // B. Adaptive Foreground (108dp transparent with centered logo ~60% size)
        const fgLogoSize = Math.round(adaptiveSize * 0.60);
        const fgLogo = await sharp(logoPath)
          .resize(fgLogoSize, fgLogoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' })
          .toBuffer();

        await sharp({
          create: {
            width: adaptiveSize,
            height: adaptiveSize,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        })
        .composite([{ input: fgLogo, gravity: 'center' }])
        .png()
        .toFile(path.join(dirPath, 'ic_launcher_foreground.png'));

        // C. Monochrome Icon (Identical to foreground for Android 13 dynamic theme coloring)
        fs.copyFileSync(
          path.join(dirPath, 'ic_launcher_foreground.png'),
          path.join(dirPath, 'ic_launcher_monochrome.png')
        );

        // D. Legacy Launcher & Round Launcher (size x size with centered logo ~60% size on white background)
        const legacyLogoSize = Math.round(legacySize * 0.60);
        const legacyLogo = await sharp(logoPath)
          .resize(legacyLogoSize, legacyLogoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' })
          .toBuffer();

        await sharp({
          create: {
            width: legacySize,
            height: legacySize,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          }
        })
        .composite([{ input: legacyLogo, gravity: 'center' }])
        .png()
        .toFile(path.join(dirPath, 'ic_launcher.png'));

        // Round launcher
        fs.copyFileSync(path.join(dirPath, 'ic_launcher.png'), path.join(dirPath, 'ic_launcher_round.png'));
        
        console.log(`  - Overwrote high-res icons for ${subdir}`);
      }
    }

    // Handle Drawables (Splash Screens)
    if (subdir.startsWith('drawable') && !subdir.startsWith('drawable-v')) {
      const splashPath = path.join(dirPath, 'splash.png');
      if (fs.existsSync(splashPath)) {
        try {
          // Read metadata to get target resolution
          const meta = await sharp(splashPath).metadata();
          const width = meta.width;
          const height = meta.height;

          // optimal logo size is 35% of the minimum dimension
          const minDim = Math.min(width, height);
          const logoSize = Math.round(minDim * 0.35);

          const resizedLogo = await sharp(logoPath)
            .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' })
            .toBuffer();

          await sharp({
            create: {
              width: width,
              height: height,
              channels: 4,
              background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
          })
          .composite([{ input: resizedLogo, gravity: 'center' }])
          .png()
          .toFile(splashPath);

          console.log(`  - Overwrote high-res splash for ${subdir} (${width}x${height}px)`);
        } catch (err) {
          console.error(`  - Failed to overwrite splash for ${subdir}:`, err.message);
        }
      }
    }
  }

  // Update XML adaptive configs to include monochrome definitions
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
    }
    console.log('  - Updated XML adaptive configs with monochrome attributes');
  }

  // Purge any green mascot XML files from drawable folders
  const drawableDir = path.join(resDir, 'drawable');
  const fgXml = path.join(drawableDir, 'ic_launcher_foreground.xml');
  const bgXml = path.join(drawableDir, 'ic_launcher_background.xml');
  if (fs.existsSync(fgXml)) fs.unlinkSync(fgXml);
  if (fs.existsSync(bgXml)) fs.unlinkSync(bgXml);

  const drawableV24Dir = path.join(resDir, 'drawable-v24');
  if (fs.existsSync(drawableV24Dir)) {
    const fgXmlV24 = path.join(drawableV24Dir, 'ic_launcher_foreground.xml');
    if (fs.existsSync(fgXmlV24)) fs.unlinkSync(fgXmlV24);
  }
  
  // 6. Generate Android 12+ SplashScreen API Assets
  console.log('Generating Android 12+ SplashScreen API custom assets...');
  
  // A. Create white rounded square with centered black logo (512x512 px)
  const roundedSquareSvg = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="512" height="512" rx="120" ry="120" fill="white" />
  </svg>
  `;
  const roundedSquareBuffer = await sharp(Buffer.from(roundedSquareSvg)).png().toBuffer();
  
  const blackLogoResized = await sharp(logoPath)
    .resize(300, 300, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' })
    .toBuffer();
    
  await sharp(roundedSquareBuffer)
    .composite([{ input: blackLogoResized, gravity: 'center' }])
    .png()
    .toFile(path.join(drawableDir, 'ic_splash_logo_square.png'));
  console.log('  - Generated ic_splash_logo_square.png');

  // B. Create brand text "Day Zero OS" in white (600x120 px)
  const textSvg = `
  <svg width="600" height="120" viewBox="0 0 600 120" xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="44" fill="#FFFFFF" letter-spacing="2">Day Zero OS</text>
  </svg>
  `;
  await sharp(Buffer.from(textSvg))
    .png()
    .toFile(path.join(drawableDir, 'ic_splash_text.png'));
  console.log('  - Generated ic_splash_text.png');

  // C. Write layered icon definition XML
  const splashIconXmlContent = `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Solid black background -->
    <item>
        <color android:color="#000000" />
    </item>
    
    <!-- Centered white rounded square with black logo -->
    <item android:drawable="@drawable/ic_splash_logo_square"
          android:width="160dp"
          android:height="160dp"
          android:gravity="center" />
          
    <!-- Bottom white text "Day Zero OS" -->
    <item android:drawable="@drawable/ic_splash_text"
          android:width="200dp"
          android:height="40dp"
          android:gravity="bottom|center_horizontal"
          android:bottom="80dp" />
</layer-list>`;
  fs.writeFileSync(path.join(drawableDir, 'ic_splash_icon.xml'), splashIconXmlContent, 'utf8');
  console.log('  - Wrote ic_splash_icon.xml layered drawable');

  console.log('Successfully completed building high-fidelity brand assets!');
}

runCustomAssetPipeline().catch(e => {
  console.error('Fatal pipeline error:', e);
  process.exit(1);
});
