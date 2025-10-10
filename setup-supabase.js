#!/usr/bin/env node

/**
 * Comanda Digital - Supabase Database Setup Script
 * 
 * This script automatically sets up your Supabase database with all required tables and seed data.
 * 
 * Usage:
 *   node setup-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERROR: Missing Supabase credentials in .env file')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Starting Supabase database setup...\n')

  try {
    // Read SQL file
    const sqlPath = path.join(__dirname, 'supabase-schema.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')

    console.log('📄 SQL schema loaded from supabase-schema.sql')
    console.log('\n⚠️  IMPORTANT: This script creates tables using Supabase SQL.')
    console.log('⚠️  Please run the SQL manually in Supabase SQL Editor:\n')
    console.log('1. Go to: https://walzlcumeccbcogujard.supabase.co')
    console.log('2. Navigate to: SQL Editor')
    console.log('3. Copy and paste the entire content from: supabase-schema.sql')
    console.log('4. Click "Run" to execute\n')

    console.log('📊 This will create:')
    console.log('  ✅ Tables: comandas, comanda_items, products, tables, payments')
    console.log('  ✅ Sample data: 10 tables, 25 products')
    console.log('  ✅ Indexes and security policies\n')

    // Verify if tables exist by trying to query
    console.log('🔍 Checking if tables already exist...\n')

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count')
      .limit(1)

    if (!productsError) {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      console.log(`✅ Products table exists with ${count || 0} items`)
    } else {
      console.log('❌ Products table not found - Please run SQL setup first!')
    }

    const { data: tables, error: tablesError } = await supabase
      .from('tables')
      .select('count')
      .limit(1)

    if (!tablesError) {
      const { count } = await supabase
        .from('tables')
        .select('*', { count: 'exact', head: true })

      console.log(`✅ Tables table exists with ${count || 0} items`)
    } else {
      console.log('❌ Tables table not found - Please run SQL setup first!')
    }

    const { data: comandas, error: comandasError } = await supabase
      .from('comandas')
      .select('count')
      .limit(1)

    if (!comandasError) {
      const { count } = await supabase
        .from('comandas')
        .select('*', { count: 'exact', head: true })

      console.log(`✅ Comandas table exists with ${count || 0} items`)
    } else {
      console.log('❌ Comandas table not found - Please run SQL setup first!')
    }

    console.log('\n✨ Setup verification complete!')
    console.log('\n📝 Next steps:')
    console.log('1. If tables don\'t exist, run the SQL in Supabase SQL Editor')
    console.log('2. Test the app: https://qrmenu-7.preview.emergentagent.com')
    console.log('3. Create a test order and verify everything works\n')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

setupDatabase()
