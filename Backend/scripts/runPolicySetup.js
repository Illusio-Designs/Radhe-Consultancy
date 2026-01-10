#!/usr/bin/env node

// Standalone Policy Setup Script
// This script can be run independently to set up policy tables and renewal system
// Usage: node scripts/runPolicySetup.js

const { setupPolicyTables } = require('./setupPolicyTables');

console.log('\n' + '='.repeat(70));
console.log('🚀 STANDALONE POLICY SETUP SCRIPT');
console.log('='.repeat(70));
console.log('📋 This script will set up:');
console.log('   • ECP Previous Policy Tables');
console.log('   • Vehicle Previous Policy Tables');
console.log('   • Upload Directories');
console.log('   • Performance Indexes');
console.log('   • Renewal System Verification');
console.log('='.repeat(70) + '\n');

async function runPolicySetup() {
  try {
    const success = await setupPolicyTables();
    
    if (success) {
      console.log('\n' + '🎉'.repeat(20));
      console.log('✅ POLICY SETUP COMPLETED SUCCESSFULLY!');
      console.log('🎉'.repeat(20) + '\n');
      
      console.log('📋 Next Steps:');
      console.log('   1. Restart your server to apply changes');
      console.log('   2. Test policy creation and renewal functionality');
      console.log('   3. Verify upload directories are accessible');
      console.log('   4. Check database indexes for performance');
      
      process.exit(0);
    } else {
      console.error('\n❌ POLICY SETUP FAILED!');
      console.error('Please check the error messages above and try again.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ POLICY SETUP FAILED WITH ERROR:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle process interruption
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Setup interrupted by user. Exiting...');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Setup terminated. Exiting...');
  process.exit(1);
});

// Run the setup
runPolicySetup();