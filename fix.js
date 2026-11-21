import fs from 'fs';

const files = [
  'src/app/account/page.tsx',
  'src/app/checkout/page.tsx',
  'src/app/product/[id]/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix the import line
  content = content.replace(/import Link from "next\/link";`nimport \{ useRouter \} from "next\/navigation";/g, 'import Link from "next/link";\nimport { useRouter } from "next/navigation";');
  
  // Remove createFileRoute
  content = content.replace(/export const Route = createFileRoute\([^)]+\)\(\{\n\s*component:\s*[a-zA-Z0-9_]+,\n\}\);/g, '');
  
  // For product, since it's a bit different
  content = content.replace(/export const Route = createFileRoute\([^)]+\)\(\{(.|\n)*?\}\);/g, '');

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
