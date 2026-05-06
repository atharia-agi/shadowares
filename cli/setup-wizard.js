#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('⚡ Shadow Toolkit Setup Wizard');
console.log('==============================\n');

// Check if we're in a project directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
let hasPackageJson = false;

try {
  fs.accessSync(packageJsonPath, fs.constants.F_OK);
  hasPackageJson = true;
  console.log('✓ Found package.json in current directory');
} catch (err) {
  console.log('⚠ No package.json found in current directory');
  console.log('  Creating a new package.json for you...\n');
  
  // Create basic package.json
  const basicPackage = {
    name: path.basename(process.cwd()),
    version: '1.0.0',
    description: '',
    main: 'index.js',
    scripts: {
      dev: 'echo "Development server"',
      build: 'echo "Building for production"'
    },
    keywords: [],
    author: '',
    license: 'MIT'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(basicPackage, null, 2));
  console.log('✓ Created package.json\n');
}

// Ask user what they want to install
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('What would you like to install?\n');
console.log('1. Complete Shadow Toolkit (all features)');
console.log('2. Cursor Engine Only');
console.log('3. 2.5D Physics Engine Only');
console.log('4. Holographic Card Engine Only');
console.log('5. Pixel Disintegration Engine Only');
console.log('6. Scroll Reveal Engine Only');
console.log('0. Exit\n');

readline.question('Enter your choice (0-6): ', (choice) => {
  readline.close();
  
  let packageName = '';
  let installMessage = '';
  
  switch (choice) {
    case '1':
      packageName = '@shadow-toolkit/core';
      installMessage = 'Complete Shadow Toolkit with all engines and utilities';
      break;
    case '2':
      packageName = '@shadow-toolkit/cursor-engine';
      installMessage = 'Custom Cursor Engine with 12 themes';
      break;
    case '3':
      packageName = '@shadow-toolkit/physics-engine';
      installMessage = '2.5D Physics Engine with tilt and spring effects';
      break;
    case '4':
      packageName = '@shadow-toolkit/holo-card';
      installMessage = 'Holographic Card Engine with glassmorphism effects';
      break;
    case '5':
      packageName = '@shadow-toolkit/pixel-snap';
      installMessage = 'Pixel Disintegration Engine (Thanos Snap effect)';
      break;
    case '6':
      packageName = '@shadow-toolkit/scroll-reveal';
      installMessage = 'Scroll Reveal Engine for entrance animations';
      break;
    case '0':
      console.log('\n👋 Goodbye!');
      process.exit(0);
    default:
      console.log('\n❌ Invalid choice. Please run the wizard again.');
      process.exit(1);
  }
  
  console.log(`\n📦 Installing: ${installMessage}`);
  console.log(`   Package: ${packageName}\n`);
  
  try {
    // Install the package
    execSync(`npm install ${packageName}`, { stdio: 'inherit' });
    
    console.log('\n✅ Installation successful!');
    console.log('\n🚀 Next steps:');
    console.log('1. Import the engine in your JavaScript:');
    console.log(`   import { /* engine name */ } from '${packageName}';`);
    console.log('\n2. Check the documentation for usage examples:');
    console.log('   https://github.com/shadow-toolkit/core#usage-examples');
    console.log('\n3. Happy coding! ✨\n');
    
    // Offer to create a demo file
    const demoReadline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    demoReadline.question('\nWould you like me to create a demo file? (y/n): ', (answer) => {
      demoReadline.close();
      
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        createDemoFile(choice);
      } else {
        console.log('\n👋 Happy coding with Shadow Toolkit!');
        process.exit(0);
      }
    });
  } catch (error) {
    console.error('\n❌ Installation failed:');
    console.error(error.message);
    process.exit(1);
  }
});

function createDemoFile(choice) {
  const demoContent = getDemoContent(choice);
  const demoFileName = `shadow-toolkit-demo-${Date.now()}.html`;
  const demoFilePath = path.join(process.cwd(), demoFileName);
  
  fs.writeFileSync(demoFilePath, demoContent, 'utf8');
  
  console.log(`\n📄 Demo file created: ${demoFileName}`);
  console.log(`   Location: ${demoFilePath}`);
  console.log('\n👋 Happy coding with Shadow Toolkit!');
  process.exit(0);
}

function getDemoFileContent(choice) {
  switch (choice) {
    case '1':
      return getCompleteDemo();
    case '2':
      return getCursorDemo();
    case '3':
      return getPhysicsDemo();
    case '4':
      return getHoloDemo();
    case '5':
      return getPixelDemo();
    case '6':
      return getScrollDemo();
    default:
      return getCompleteDemo();
  }
}

function getCompleteDemo() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shadow Toolkit Complete Demo</title>
</head>
<body>
    <h1>Shadow Toolkit Complete Demo</h1>
    
    <!-- Cursor Engine -->
    <h2>Custom Cursor</h2>
    <p>Move your cursor around to see the effect!</p>
    
    <!-- 2.5D Physics -->
    <h2>2.5D Physics</h2>
    <shadow-2d-physics style="width: 200px; height: 200px; border: 1px solid #ccc; margin: 10px 0;">
        <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #8b5cf6, #22d3ee); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
            Move & Click Me
        </div>
    </shadow-2d-physics>
    
    <!-- Holographic Card -->
    <h2>Holographic Card</h2>
    <shadow-holo-card style="width: 200px; height: 260px; margin: 10px 0;">
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: white;">
            <div style="font-size: 3rem; margin-bottom: 10px;">🎮</div>
            <h4>Premium Asset</h4>
            <p>Exclusive holographic finish</p>
        </div>
    </shadow-holo-card>
    
    <!-- Pixel Disintegration -->
    <h2>Pixel Disintegration</h2>
    <shadow-pixel-snap style="width: 200px; height: 200px; margin: 10px 0; cursor: crosshair;">
        <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #ec4899, #f43f5e); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; user-select: none;">
            Click to Disintegrate
        </div>
    </shadow-pixel-snap>
    
    <!-- Scroll Reveal -->
    <h2>Scroll Reveal</h2>
    <div style="height: 100px; margin: 20px 0;">
        <shadow-reveal animation="fade-up" delay="0.2">
            <div style="text-align: center; padding: 20px; background: rgba(139,92,246,0.1); border-radius: 8px;">
                I fade up as you scroll!
            </div>
        </shadow-reveal>
    </div>
    
    <!-- Load Shadow Toolkit -->
    <script src="../shadow-cursor-engine.js"></script>
    <script src="../shadow-2.5d-engine.js"></script>
    <script src="../shadow-holo-card.js"></script>
    <script src="../shadow-pixel-snap.js"></script>
    <script src="../shadow-scroll-reveal.js"></script>
    
    <script>
        // Set initial cursor theme
        shadowCursor.setTheme('minecraft');
    </script>
</body>
</html>`;
}

function getCursorDemo() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shadow Cursor Engine Demo</title>
</head>
<body>
    <h1>Shadow Cursor Engine Demo</h1>
    <p>Move your cursor around to see different themes!</p>
    <p>Click anywhere to see the click effect!</p>
    
    <div style="margin: 20px 0;">
        <button id="changeTheme" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
            Change Theme
        </button>
        <span id="currentTheme" style="margin-left: 10px; font-weight: bold;">Current: default</span>
    </div>
    
    <!-- Load Shadow Toolkit -->
    <script src="../shadow-cursor-engine.js"></script>
    
    <script>
        // Available themes
        const themes = ['warkop', 'bengkel', 'salon', 'pasar', 'tech', 'default', 'minecraft', 'fps', 'rpg', 'retro', 'racing'];
        let currentThemeIndex = 5; // Start with default
        
        // Set initial theme
        shadowCursor.setTheme(themes[currentThemeIndex]);
        document.getElementById('currentTheme').textContent = `Current: ${themes[currentThemeIndex]}`;
        
        // Change theme on button click
        document.getElementById('changeTheme').addEventListener('click', () => {
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            shadowCursor.setTheme(themes[currentThemeIndex]);
            document.getElementById('currentTheme').textContent = `Current: ${themes[currentThemeIndex]}`;
        });
    </script>
</body>
</html>`;
}

function getPhysicsDemo() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shadow 2.5D Physics Engine Demo</title>
</head>
<body>
    <h1>Shadow 2.5D Physics Engine Demo</h1>
    <p>Move your mouse over the element to see the tilt and lighting effects!</p>
    <p>Click on the element to see the spring physics!</p>
    
    <shadow-2d-physics style="width: 300px; height: 300px; border: 2px solid #333; margin: 20px auto; display: block;">
        <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #8b5cf6, #22d3ee); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold;">
            Interactive Physics
        </div>
    </shadow-2d-physics>
    
    <!-- Load Shadow Toolkit -->
    <script src="../shadow-2.5d-engine.js"></script>
</body>
</html>`;
}

function getHoloDemo() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shadow Holographic Card Demo</title>
</head>
<body>
    <h1>Shadow Holographic Card Demo</h1>
    <p>Move your mouse over the card to see the holographic effects!</p>
    
    <shadow-holo-card style="width: 250px; height: 330px; margin: 20px auto; display: block;">
        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: white;">
            <div style="font-size: 4rem; margin-bottom: 15px;">💎</div>
            <h3>Premium Collection</h3>
            <p>Exclusive holographic finish with dynamic lighting</p>
        </div>
    </shadow-holo-card>
    
    <!-- Load Shadow Toolkit -->
    <script src="../shadow-holo-card.js"></script>
</body>
</html>`;
}

function getPixelDemo() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shadow Pixel Disintegration Demo</title>
</head>
<body>
    <h1>Shadow Pixel Disintegration Demo</th1>
    <p>Click on the element to see the "Thanos Snap" effect!</p>
    <p>Watch as it explodes into particles and reconstructs!</p>
    
    <shadow-pixel-snap style="width: 250px; height: 250px; margin: 20px auto; display: block; cursor: crosshair;">
        <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #ec4899, #f43f5e); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; user-select: none;">
            Click to Disintegrate
        </div>
    </shadow-pixel-snap>
    
    <!-- Load Shadow Toolkit -->
    <script src="../shadow-pixel-snap.js"></script>
</body>
</html>`;
}

function getScrollDemo() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shadow Scroll Reveal Demo</title>
    <style>
        body {
            height: 2000px;
            font-family: Arial, sans-serif;
            line-height: 1.6;
        }
        .content {
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="content">
        <h1>Shadow Scroll Reveal Demo</h1>
        <p>Scroll down to see the entrance animations!</p>
        
        <shadow-reveal animation="fade-up" delay="0.2">
            <div style="text-align: center; padding: 30px; background: #f0f0f0; border-radius: 8px; margin: 20px 0;">
                I fade up as you scroll!
            </div>
        </shadow-reveal>
        
        <shadow-reveal animation="zoom-in" delay="0.4">
            <div style="text-align: center; padding: 30px; background: #e0f7fa; border-radius: 8px; margin: 20px 0;">
                I zoom in as you scroll!
            </div>
        </shadow-reveal>
        
        <shadow-reveal animation="flip" delay="0.6">
            <div style="text-align: center; padding: 30px; background: #fff3e0; border-radius: 8px; margin: 20px 0;">
                I flip as you scroll!
            </div>
        </shadow-reveal>
        
        <p>Scroll back up to see the animations again!</p>
    </div>
    
    <!-- Load Shadow Toolkit -->
    <script src="../shadow-scroll-reveal.js"></script>
</body>
</html>`;
}