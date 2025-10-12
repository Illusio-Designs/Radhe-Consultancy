/**
 * Static File Serving Configuration
 * Optimized settings for serving the frontend build
 */

const compression = require('compression');
const express = require('express');
const path = require('path');

/**
 * Configure static file serving with optimal caching and compression
 */
const configureStaticServing = (app) => {
  // Enable compression for all responses
  app.use(compression({
    // Compression level (0-9, 6 is optimal balance)
    level: 6,
    // Only compress responses larger than 1KB
    threshold: 1024,
    // Compress all text-based responses
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));

  // Serve static files from frontend build
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  
  // Static files with aggressive caching
  app.use(express.static(frontendPath, {
    maxAge: '1y', // Cache static assets for 1 year
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Different caching strategies for different file types
      if (filePath.endsWith('.html')) {
        // HTML files - no cache (always check for updates)
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      } else if (filePath.match(/\.(js|css|jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot|ico)$/)) {
        // Static assets - long cache with immutable
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }

      // Security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      
      // Prefer compressed versions
      if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
        res.setHeader('Vary', 'Accept-Encoding');
      }
    }
  }));

  // Handle client-side routing - serve index.html for all routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    
    // Serve index.html for all other routes
    res.sendFile(path.join(frontendPath, 'index.html'), {
      headers: {
        'Cache-Control': 'no-cache, must-revalidate'
      }
    });
  });
};

module.exports = configureStaticServing;

