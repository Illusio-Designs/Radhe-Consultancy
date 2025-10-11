import chokidar from 'chokidar';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  // Directories to watch
  watchDirs: [
    path.resolve(__dirname, '../src/assets'),
    path.resolve(__dirname, '../public')
  ],
  // Image extensions to convert
  extensions: ['.jpg', '.jpeg', '.png'],
  // WebP quality (0-100)
  quality: 85
};

/**
 * Convert a single image to WebP format
 */
async function convertImageToWebP(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  
  // Skip if not an image we want to convert
  if (!config.extensions.includes(ext)) {
    return;
  }

  // Generate WebP filename
  const webpPath = imagePath.replace(new RegExp(`${ext}$`), '.webp');

  try {
    // Get original file size
    const originalStats = fs.statSync(imagePath);

    console.log(`\n🔄 Converting: ${path.basename(imagePath)}...`);

    // Convert to WebP
    await sharp(imagePath)
      .webp({ quality: config.quality })
      .toFile(webpPath);

    // Get new file size
    const newStats = fs.statSync(webpPath);
    const savings = ((originalStats.size - newStats.size) / originalStats.size * 100).toFixed(1);
    
    console.log(
      `✅ Created: ${path.basename(webpPath)} ` +
      `(${(originalStats.size / 1024).toFixed(1)}KB → ${(newStats.size / 1024).toFixed(1)}KB, ${savings}% smaller)`
    );
  } catch (error) {
    console.error(`❌ Failed to convert ${imagePath}:`, error.message);
  }
}

/**
 * Main function
 */
function main() {
  console.log('👀 Starting image watcher...\n');
  console.log('Watching directories:');
  config.watchDirs.forEach(dir => console.log(`  📁 ${dir}`));
  console.log(`\nQuality: ${config.quality}`);
  console.log('Extensions:', config.extensions.join(', '));
  console.log('\n✨ Watcher is ready! Add or modify images to auto-convert them to WebP.\n');
  console.log('Press Ctrl+C to stop.\n');

  // Create file watcher
  const watcher = chokidar.watch(config.watchDirs, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true // don't trigger on existing files
  });

  // Watch for new or changed images
  watcher
    .on('add', async (filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (config.extensions.includes(ext)) {
        console.log(`\n📸 New image detected: ${path.basename(filePath)}`);
        await convertImageToWebP(filePath);
      }
    })
    .on('change', async (filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (config.extensions.includes(ext)) {
        console.log(`\n🔄 Image modified: ${path.basename(filePath)}`);
        await convertImageToWebP(filePath);
      }
    })
    .on('error', (error) => {
      console.error(`❌ Watcher error: ${error}`);
    });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n👋 Stopping watcher...');
    watcher.close();
    process.exit(0);
  });
}

// Run the script
main();

