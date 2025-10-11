import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  // Directories to process
  inputDirs: [
    path.resolve(__dirname, '../src/assets'),
    path.resolve(__dirname, '../public')
  ],
  // Image extensions to convert
  extensions: ['.jpg', '.jpeg', '.png'],
  // WebP quality (0-100)
  quality: 85,
  // Whether to keep original files
  keepOriginals: true,
  // Skip if WebP already exists
  skipExisting: true
};

// Statistics
let stats = {
  converted: 0,
  skipped: 0,
  failed: 0,
  totalSizeBefore: 0,
  totalSizeAfter: 0
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

  // Skip if WebP already exists and skipExisting is true
  if (config.skipExisting && fs.existsSync(webpPath)) {
    console.log(`⏭️  Skipped (already exists): ${path.basename(imagePath)}`);
    stats.skipped++;
    return;
  }

  try {
    // Get original file size
    const originalStats = fs.statSync(imagePath);
    stats.totalSizeBefore += originalStats.size;

    // Convert to WebP
    await sharp(imagePath)
      .webp({ quality: config.quality })
      .toFile(webpPath);

    // Get new file size
    const newStats = fs.statSync(webpPath);
    stats.totalSizeAfter += newStats.size;

    const savings = ((originalStats.size - newStats.size) / originalStats.size * 100).toFixed(1);
    
    console.log(
      `✅ Converted: ${path.basename(imagePath)} → ${path.basename(webpPath)} ` +
      `(${(originalStats.size / 1024).toFixed(1)}KB → ${(newStats.size / 1024).toFixed(1)}KB, ${savings}% smaller)`
    );
    
    stats.converted++;
  } catch (error) {
    console.error(`❌ Failed to convert ${imagePath}:`, error.message);
    stats.failed++;
  }
}

/**
 * Recursively process all images in a directory
 */
async function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      await processDirectory(fullPath);
    } else if (stat.isFile()) {
      // Process image file
      await convertImageToWebP(fullPath);
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting WebP conversion...\n');
  console.log(`Quality: ${config.quality}`);
  console.log(`Keep originals: ${config.keepOriginals}`);
  console.log(`Skip existing: ${config.skipExisting}\n`);

  const startTime = Date.now();

  // Process each input directory
  for (const dir of config.inputDirs) {
    console.log(`\n📁 Processing directory: ${dir}`);
    await processDirectory(dir);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Conversion Summary');
  console.log('='.repeat(60));
  console.log(`✅ Converted: ${stats.converted} images`);
  console.log(`⏭️  Skipped: ${stats.skipped} images`);
  console.log(`❌ Failed: ${stats.failed} images`);
  console.log(`⏱️  Time: ${duration}s`);
  
  if (stats.converted > 0) {
    const totalSavings = ((stats.totalSizeBefore - stats.totalSizeAfter) / stats.totalSizeBefore * 100).toFixed(1);
    console.log(`💾 Total size: ${(stats.totalSizeBefore / 1024 / 1024).toFixed(2)}MB → ${(stats.totalSizeAfter / 1024 / 1024).toFixed(2)}MB`);
    console.log(`📉 Total savings: ${totalSavings}% (${((stats.totalSizeBefore - stats.totalSizeAfter) / 1024 / 1024).toFixed(2)}MB)`);
  }
  
  console.log('='.repeat(60));
  console.log('\n✨ Done!\n');

  // Optional: Delete original files if configured
  if (!config.keepOriginals && stats.converted > 0) {
    console.log('⚠️  Note: Original files were kept. To delete them, set keepOriginals to false in the config.');
  }
}

// Run the script
main().catch(console.error);

