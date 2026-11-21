const fs = require('fs');
const path = require('path');

// 1. Fix checkout/page.tsx
const checkout = 'src/app/checkout/page.tsx';
let checkoutContent = fs.readFileSync(checkout, 'utf8');
checkoutContent = checkoutContent.replace(/<Link\s+to=/g, '<Link href=');
fs.writeFileSync(checkout, checkoutContent);

// 2. Fix GlobalModals.tsx
const globalModals = 'src/app/GlobalModals.tsx';
let globalModalsContent = fs.readFileSync(globalModals, 'utf8');
globalModalsContent = globalModalsContent.replace(/name: "", email: "",/g, 'name: "", email: "", phone: "",');
fs.writeFileSync(globalModals, globalModalsContent);

// 3. Fix AuthModal.tsx
const authModal = 'src/components/store/AuthModal.tsx';
let authModalContent = fs.readFileSync(authModal, 'utf8');
authModalContent = authModalContent.replace(/src=\{productImage\}/g, 'src={productImage.src || productImage}');
fs.writeFileSync(authModal, authModalContent);

// 4. Fix CategoryShowcase.tsx
const categoryShowcase = 'src/components/store/CategoryShowcase.tsx';
let categoryShowcaseContent = fs.readFileSync(categoryShowcase, 'utf8');
categoryShowcaseContent = categoryShowcaseContent.replace(/src=\{category\.image\}/g, 'src={category.image.src || category.image}');
fs.writeFileSync(categoryShowcase, categoryShowcaseContent);

// 5. Fix Footer.tsx
const footer = 'src/components/store/Footer.tsx';
let footerContent = fs.readFileSync(footer, 'utf8');
footerContent = footerContent.replace(/typeof isBuilderMode !== "undefined" && isBuilderMode/g, 'false');
fs.writeFileSync(footer, footerContent);

// 6. Fix Header.tsx
const header = 'src/components/store/Header.tsx';
let headerContent = fs.readFileSync(header, 'utf8');
headerContent = headerContent.replace(/<Link to=\{item\.to\} href=\{item\.to\}/g, '<Link href={item.to || ""}');
headerContent = headerContent.replace(/<Link to=\{item\.to\}/g, '<Link href={item.to || ""}');
headerContent = headerContent.replace(/href=\{item\.hash\}/g, ''); // Fix hash
fs.writeFileSync(header, headerContent);

// 7. Fix MobileNav.tsx
const mobileNav = 'src/components/store/MobileNav.tsx';
let mobileNavContent = fs.readFileSync(mobileNav, 'utf8');
mobileNavContent = mobileNavContent.replace(/import \{ useLocation, useNavigate \} from "@tanstack\/react-router";/g, 'import { usePathname, useRouter } from "next/navigation";');
mobileNavContent = mobileNavContent.replace(/const location = useLocation\(\);/g, 'const pathname = usePathname();\n  const router = useRouter();');
mobileNavContent = mobileNavContent.replace(/location\.pathname/g, 'pathname');
mobileNavContent = mobileNavContent.replace(/const navigate = useNavigate\(\);/g, '');
mobileNavContent = mobileNavContent.replace(/\.navigate\(\{ to: (.*?) \}\)/g, '.push($1)');
mobileNavContent = mobileNavContent.replace(/navigate\(\{ to: (.*?) \}\)/g, 'router.push($1)');
fs.writeFileSync(mobileNav, mobileNavContent);

// 8. Fix SearchOverlay.tsx
const searchOverlay = 'src/components/store/SearchOverlay.tsx';
let searchOverlayContent = fs.readFileSync(searchOverlay, 'utf8');
searchOverlayContent = searchOverlayContent.replace(/router\(`/g, 'router.push(`');
// Fix product argument: string -> Product
searchOverlayContent = searchOverlayContent.replace(/navigate\(\{\s*to:\s*`\/product\/\$\{product.slug \|\| product.id\}`\s*\}\)/g, 'router.push(`/product/${product.slug || product.id}`)');
// For any residual navigate calls:
searchOverlayContent = searchOverlayContent.replace(/navigate\(\{ to: (.*?) \}\)/g, 'router.push($1)');
fs.writeFileSync(searchOverlay, searchOverlayContent);

// 9. Fix products.ts
const products = 'src/components/store/products.ts';
let productsContent = fs.readFileSync(products, 'utf8');
productsContent = productsContent.replace(/export const productImage = productsImg;/g, 'export const productImage = (productsImg as any).src || productsImg;');
productsContent = productsContent.replace(/image: hatsImg,/g, 'image: (hatsImg as any).src || hatsImg,');
productsContent = productsContent.replace(/image: jacketsImg,/g, 'image: (jacketsImg as any).src || jacketsImg,');
productsContent = productsContent.replace(/image: pantsImg,/g, 'image: (pantsImg as any).src || pantsImg,');
productsContent = productsContent.replace(/image: panjabiImg,/g, 'image: (panjabiImg as any).src || panjabiImg,');
productsContent = productsContent.replace(/image: productsImg,/g, 'image: (productsImg as any).src || productsImg,');
fs.writeFileSync(products, productsContent);

console.log("TypeScript fixes applied.");
