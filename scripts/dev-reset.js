#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔄 Starting development reset procedure...')

// Step 1: Kill any existing Node processes
try {
  console.log('1️⃣ Killing existing Node processes...')
  if (process.platform === 'win32') {
    execSync('taskkill /F /IM node.exe 2>nul', { stdio: 'ignore' })
  } else {
    execSync('pkill -f "next dev" || true', { stdio: 'ignore' })
  }
  // Wait a moment for processes to terminate
  await new Promise(resolve => setTimeout(resolve, 1000))
} catch (error) {
  console.log('   No existing processes to kill')
}

// Step 2: Clear Next.js cache
try {
  console.log('2️⃣ Clearing Next.js cache...')
  const nextDir = path.join(__dirname, '..', '.next')
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true })
  }
} catch (error) {
  console.log('   Cache already clean')
}

// Step 3: Clear npm cache
try {
  console.log('3️⃣ Clearing npm cache...')
  const nodeModulesCache = path.join(__dirname, '..', 'node_modules', '.cache')
  if (fs.existsSync(nodeModulesCache)) {
    fs.rmSync(nodeModulesCache, { recursive: true, force: true })
  }
  execSync('npm cache clean --force', { stdio: 'ignore' })
} catch (error) {
  console.log('   npm cache clean failed, continuing...')
}

// Step 4: Find available port
console.log('4️⃣ Finding available port...')
const net = require('net')

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.listen(port, () => {
      server.once('close', () => resolve(true))
      server.close()
    })
    server.on('error', () => resolve(false))
  })
}

async function findFreePort(startPort = 3010) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortFree(port)) {
      return port
    }
  }
  return 3030 // fallback
}

// Step 5: Start development server
;(async () => {
  try {
    const port = await findFreePort()
    console.log(`5️⃣ Starting development server on port ${port}...`)
    
    process.env.PORT = port.toString()
    execSync(`npm run dev`, { 
      stdio: 'inherit',
      env: { ...process.env, PORT: port.toString() }
    })
  } catch (error) {
    console.error('❌ Failed to start development server:', error.message)
    process.exit(1)
  }
})()