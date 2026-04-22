#!/usr/bin/env node

/**
 * Script de validación para Construcciones Salas
 * Verifica problemas críticos antes del deploy
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 VALIDACIÓN DE BUILD - Construcciones Salas');
console.log('=============================================\n');

// Configuración
const PROJECT_ROOT = path.join(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

let hasErrors = false;
let warnings = [];

// 1. Verificar variables de entorno
console.log('1. 📋 Variables de entorno:');
const envExample = path.join(PROJECT_ROOT, '.env.example');
const envFile = path.join(PROJECT_ROOT, '.env');

if (fs.existsSync(envExample)) {
  console.log('   ✅ .env.example existe');
  
  const exampleContent = fs.readFileSync(envExample, 'utf8');
  const requiredVars = [];
  
  // Extraer variables requeridas
  exampleContent.split('\n').forEach(line => {
    if (line.includes('PUBLIC_SITE_URL') && !line.startsWith('#')) {
      requiredVars.push('PUBLIC_SITE_URL');
    }
    if (line.includes('PUBLIC_WP_BASE_URL') && !line.startsWith('#')) {
      requiredVars.push('PUBLIC_WP_BASE_URL');
    }
  });
  
  console.log(`   📝 Variables requeridas: ${requiredVars.join(', ')}`);
  
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    const missingVars = requiredVars.filter(varName => 
      !envContent.includes(`${varName}=`)
    );
    
    if (missingVars.length > 0) {
      console.log(`   ⚠️  Variables faltantes en .env: ${missingVars.join(', ')}`);
      warnings.push(`Faltan variables en .env: ${missingVars.join(', ')}`);
    } else {
      console.log('   ✅ Todas las variables requeridas están en .env');
    }
  } else {
    console.log('   ⚠️  Archivo .env no encontrado (crear desde .env.example)');
    warnings.push('Archivo .env no encontrado');
  }
} else {
  console.log('   ❌ .env.example no encontrado');
  hasErrors = true;
}

// 2. Verificar estructura HTML
console.log('\n2. 🏗️  Estructura HTML:');

// Buscar <head> dentro de <body> en componentes Astro
function checkAstroFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      checkAstroFiles(fullPath);
    } else if (file.name.endsWith('.astro')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Buscar patrones problemáticos
      const lines = content.split('\n');
      let inFrontmatter = false;
      let hasInvalidHead = false;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.trim() === '---') {
          inFrontmatter = !inFrontmatter;
          continue;
        }
        
        if (!inFrontmatter) {
          // Buscar <head> fuera del slot
          if (line.includes('<head>') && !line.includes('slot name="head"')) {
            console.log(`   ❌ <head> inválido encontrado en: ${path.relative(PROJECT_ROOT, fullPath)}:${i+1}`);
            console.log(`      ${line.trim()}`);
            hasErrors = true;
            hasInvalidHead = true;
          }
        }
      }
      
      if (!hasInvalidHead) {
        console.log(`   ✅ ${path.relative(PROJECT_ROOT, fullPath)} - Estructura correcta`);
      }
    }
  }
}

checkAstroFiles(SRC_DIR);

// 3. Verificar build existente
console.log('\n3. 📦 Build existente:');

if (fs.existsSync(DIST_DIR)) {
  const distFiles = fs.readdirSync(DIST_DIR);
  
  // Verificar archivos críticos
  const criticalFiles = ['index.html', 'robots.txt', 'sitemap-index.xml'];
  const missingFiles = criticalFiles.filter(file => !distFiles.includes(file));
  
  if (missingFiles.length > 0) {
    console.log(`   ⚠️  Archivos faltantes en dist/: ${missingFiles.join(', ')}`);
    warnings.push(`Archivos faltantes en build: ${missingFiles.join(', ')}`);
  } else {
    console.log('   ✅ Archivos críticos presentes');
  }
  
  // Verificar URLs example.com
  const indexHtml = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexHtml)) {
    const htmlContent = fs.readFileSync(indexHtml, 'utf8');
    
    if (htmlContent.includes('example.com')) {
      console.log('   ⚠️  HTML contiene "example.com" (PUBLIC_SITE_URL no configurada)');
      warnings.push('HTML contiene example.com - configurar PUBLIC_SITE_URL');
    } else {
      console.log('   ✅ HTML no contiene example.com');
    }
  }
} else {
  console.log('   ℹ️  Directorio dist/ no encontrado (ejecutar npm run build primero)');
}

// 4. Verificar dependencias
console.log('\n4. 📦 Dependencias:');

const packageJson = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
const devDeps = packageJson.devDependencies || {};

const requiredDevDeps = ['@astrojs/check', 'typescript'];
const missingDevDeps = requiredDevDeps.filter(dep => !devDeps[dep]);

if (missingDevDeps.length > 0) {
  console.log(`   ❌ Dependencias de desarrollo faltantes: ${missingDevDeps.join(', ')}`);
  console.log(`      Ejecutar: npm install -D ${missingDevDeps.join(' ')}`);
  hasErrors = true;
} else {
  console.log('   ✅ Dependencias de desarrollo instaladas');
}

// 5. Verificar scripts de package.json
console.log('\n5. 🛠️  Scripts disponibles:');

const scripts = packageJson.scripts || {};
const requiredScripts = ['dev', 'build', 'preview'];

requiredScripts.forEach(script => {
  if (scripts[script]) {
    console.log(`   ✅ ${script}: ${scripts[script]}`);
  } else {
    console.log(`   ⚠️  Script "${script}" no encontrado`);
    warnings.push(`Script "${script}" no encontrado en package.json`);
  }
});

// Resumen
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN DE VALIDACIÓN');
console.log('='.repeat(50));

if (hasErrors) {
  console.log('❌ ERRORES CRÍTICOS ENCONTRADOS:');
  console.log('   El proyecto no está listo para producción.');
  console.log('   Corrige los errores antes de continuar.');
  process.exit(1);
} else {
  console.log('✅ SIN ERRORES CRÍTICOS');
  
  if (warnings.length > 0) {
    console.log('\n⚠️  ADVERTENCIAS:');
    warnings.forEach(warning => {
      console.log(`   • ${warning}`);
    });
    console.log('\n💡 Recomendación: Revisar estas advertencias antes del deploy.');
  } else {
    console.log('🎉 ¡Proyecto validado correctamente!');
    console.log('   Listo para build y deploy.');
  }
  
  console.log('\n🚀 PRÓXIMOS PASOS:');
  console.log('   1. Configurar variables de entorno reales');
  console.log('   2. Ejecutar: npm run build');
  console.log('   3. Validar output en dist/');
  console.log('   4. Configurar deploy automático');
}

process.exit(0);