import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Vite plugin to automatically convert images to WebP during build
 */
export function webpPlugin(options = {}) {
  const {
    quality = 85,
    extensions = ['.jpg', '.jpeg', '.png'],
    inputDirs = ['src/assets', 'public']
  } = options;

  let config;
  let convertedImages = new Set();

  return {
    name: 'vite-plugin-webp',
    
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async buildStart() {
      console.log('\n🖼️  WebP Plugin: Converting images...\n');
      
      const startTime = Date.now();
      let count = 0;

      for (const dir of inputDirs) {
        const fullPath = path.resolve(config.root, dir);
        if (fs.existsSync(fullPath)) {
          const converted = await processDirectory(fullPath, extensions, quality);
          count += converted;
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\n✨ WebP Plugin: Converted ${count} images in ${duration}s\n`);
    }
  };
}

/**
 * Recursively process all images in a directory
 */
async function processDirectory(dir, extensions, quality) {
  let count = 0;
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      count += await processDirectory(fullPath, extensions, quality);
    } else if (stat.isFile()) {
      const ext = path.extname(fullPath).toLowerCase();
      if (extensions.includes(ext)) {
        const webpPath = fullPath.replace(new RegExp(`${ext}$`), '.webp');
        
        // Only convert if WebP doesn't exist or is older
        if (!fs.existsSync(webpPath) || stat.mtime > fs.statSync(webpPath).mtime) {
          try {
            await sharp(fullPath)
              .webp({ quality })
              .toFile(webpPath);
            count++;
          } catch (error) {
            console.error(`Failed to convert ${fullPath}:`, error.message);
          }
        }
      }
    }
  }

  return count;
}

export default webpPlugin;

