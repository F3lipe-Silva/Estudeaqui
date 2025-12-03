// Script para verificar a implementação de práticas responsivas no projeto
const fs = require('fs');
const path = require('path');

// Diretórios a serem verificados
const directories = [
  'src/components',
  'src/app'
];

// Padrões de código responsivo a serem procurados
const responsivePatterns = [
  { name: 'Breakpoints SM', pattern: /sm:/g, found: [] },
  { name: 'Breakpoints MD', pattern: /md:/g, found: [] },
  { name: 'Breakpoints LG', pattern: /lg:/g, found: [] },
  { name: 'Breakpoints XL', pattern: /xl:/g, found: [] },
 { name: 'Breakpoints 2XL', pattern: /2xl:/g, found: [] },
  { name: 'Grid responsivo', pattern: /grid-cols-(1|2|3|4|5|6|7|8|9|10|11|12)/g, found: [] },
  { name: 'Flex responsivo', pattern: /flex-(col|row)-\w*/g, found: [] },
  { name: 'W-full', pattern: /w-full/g, found: [] },
 { name: 'H-screen', pattern: /h-screen/g, found: [] },
  { name: 'Max-width container', pattern: /max-w-/g, found: [] },
  { name: 'Padding responsivo', pattern: /p-?\w*-\w*/g, found: [] },
  { name: 'Margin responsivo', pattern: /m-?\w*-\w*/g, found: [] }
];

// Função para verificar arquivos
function checkFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      checkFiles(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      responsivePatterns.forEach(patternObj => {
        const matches = content.match(patternObj.pattern);
        if (matches) {
          patternObj.found.push({
            file: filePath,
            count: matches.length
          });
        }
      });
    }
  });
}

// Executar verificação
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    checkFiles(dir);
  }
});

// Exibir resultados
console.log('=== Verificação de Práticas Responsivas ===\n');

responsivePatterns.forEach(patternObj => {
  console.log(`${patternObj.name}:`);
  if (patternObj.found.length > 0) {
    console.log(`  ✓ Encontrado em ${patternObj.found.length} arquivos`);
    patternObj.found.forEach(item => {
      console.log(`    - ${item.file} (${item.count} ocorrências)`);
    });
  } else {
    console.log('  ⚠ Não encontrado');
  }
 console.log('');
});

// Resumo
const totalPatternsFound = responsivePatterns.filter(p => p.found.length > 0).length;
const totalFilesChecked = responsivePatterns.reduce((sum, p) => sum + p.found.length, 0);

console.log('=== Resumo ===');
console.log(`Padrões responsivos encontrados: ${totalPatternsFound}/${responsivePatterns.length}`);
console.log(`Total de arquivos com código responsivo: ${totalFilesChecked}`);
console.log(`Avaliação: ${totalPatternsFound > responsivePatterns.length * 0.7 ? 'Bom' : totalPatternsFound > responsivePatterns.length * 0.4 ? 'Adequado' : 'Precisa melhorar'}`);