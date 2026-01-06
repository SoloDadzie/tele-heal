#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the bundle size and provides optimization recommendations
 */

const fs = require('fs');
const path = require('path');

const BUNDLE_SIZE_LIMITS = {
  total: 2500, // KB
  gzipped: 800, // KB
  individual: {
    validation: 50,
    components: 100,
    screens: 200,
    utils: 75,
  },
};

function getFileSizeInKB(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / 1024).toFixed(2);
  } catch (error) {
    return 0;
  }
}

function analyzeDirectory(dirPath, extensions = ['.ts', '.tsx', '.js']) {
  const files = {};
  
  function walkDir(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    entries.forEach((entry) => {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        walkDir(fullPath);
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        const size = getFileSizeInKB(fullPath);
        files[fullPath] = parseFloat(size);
      }
    });
  }
  
  walkDir(dirPath);
  return files;
}

function generateReport() {
  console.log('\n📊 Bundle Analysis Report\n');
  console.log('='.repeat(60));
  
  const srcPath = path.join(__dirname, '../src');
  const files = analyzeDirectory(srcPath);
  
  // Categorize files
  const categories = {
    validation: [],
    components: [],
    screens: [],
    utils: [],
    other: [],
  };
  
  Object.entries(files).forEach(([filePath, size]) => {
    if (filePath.includes('validation')) {
      categories.validation.push({ path: filePath, size });
    } else if (filePath.includes('components')) {
      categories.components.push({ path: filePath, size });
    } else if (filePath.includes('screens')) {
      categories.screens.push({ path: filePath, size });
    } else if (filePath.includes('utils')) {
      categories.utils.push({ path: filePath, size });
    } else {
      categories.other.push({ path: filePath, size });
    }
  });
  
  // Calculate totals
  const totalSize = Object.values(files).reduce((a, b) => a + b, 0);
  
  console.log(`\n📦 Total Bundle Size: ${totalSize.toFixed(2)} KB\n`);
  
  // Report by category
  Object.entries(categories).forEach(([category, items]) => {
    if (items.length === 0) return;
    
    const categorySize = items.reduce((a, b) => a + b.size, 0);
    const limit = BUNDLE_SIZE_LIMITS.individual[category];
    const status = limit && categorySize > limit ? '⚠️ ' : '✅ ';
    
    console.log(`${status}${category.toUpperCase()}: ${categorySize.toFixed(2)} KB`);
    
    if (limit) {
      const percentage = ((categorySize / limit) * 100).toFixed(0);
      console.log(`   Limit: ${limit} KB (${percentage}%)\n`);
    }
    
    // Show largest files in category
    items
      .sort((a, b) => b.size - a.size)
      .slice(0, 3)
      .forEach(({ path: filePath, size }) => {
        const relativePath = filePath.replace(srcPath, '');
        console.log(`   • ${relativePath}: ${size.toFixed(2)} KB`);
      });
    
    console.log();
  });
  
  console.log('='.repeat(60));
  
  // Recommendations
  console.log('\n💡 Optimization Recommendations:\n');
  
  if (totalSize > BUNDLE_SIZE_LIMITS.total) {
    console.log('1. ⚠️  Total bundle size exceeds limit');
    console.log('   - Implement lazy loading for screens');
    console.log('   - Consider code splitting by route');
    console.log('   - Remove unused dependencies\n');
  }
  
  if (categories.screens.reduce((a, b) => a + b.size, 0) > BUNDLE_SIZE_LIMITS.individual.screens) {
    console.log('2. ⚠️  Screen components are too large');
    console.log('   - Split large screens into smaller components');
    console.log('   - Use lazy loading for heavy screens\n');
  }
  
  if (categories.components.reduce((a, b) => a + b.size, 0) > BUNDLE_SIZE_LIMITS.individual.components) {
    console.log('3. ⚠️  Components bundle is too large');
    console.log('   - Extract reusable logic into utilities');
    console.log('   - Consider component composition\n');
  }
  
  console.log('4. ✅ General Optimization Tips:');
  console.log('   - Use React.memo() for expensive components');
  console.log('   - Implement useMemo() for computed values');
  console.log('   - Tree-shake unused exports');
  console.log('   - Compress images and fonts\n');
}

// Run analysis
generateReport();
