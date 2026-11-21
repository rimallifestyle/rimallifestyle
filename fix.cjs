const fs = require('fs');

const account = 'src/app/account/page.tsx';
let accountContent = fs.readFileSync(account, 'utf8');
accountContent = accountContent.replace(/window\.history\.pushState\(null, "", #\$\{tabId\}\);/, 'window.history.pushState(null, "", `#${tabId}`);');
fs.writeFileSync(account, accountContent);

const checkout = 'src/app/checkout/page.tsx';
let checkoutContent = fs.readFileSync(checkout, 'utf8');
checkoutContent = checkoutContent.replace(/className=\{max-w-2xl w-full bg-card\/85 border border-gold\/40 rounded-3xl p-5 sm:p-8 md:p-14 shadow-\[0_25px_80px_rgba\(0,0,0,0\.45\)\] backdrop-blur-2xl relative overflow-hidden text-center transform-gpu transition-all duration-\[900ms\] ease-out \$\{/, 'className={`max-w-2xl w-full bg-card/85 border border-gold/40 rounded-3xl p-5 sm:p-8 md:p-14 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl relative overflow-hidden text-center transform-gpu transition-all duration-[900ms] ease-out ${');
fs.writeFileSync(checkout, checkoutContent);

const product = 'src/app/product/[id]/page.tsx';
let productContent = fs.readFileSync(product, 'utf8');
productContent = productContent.replace(/className=\{relative w-20 md:w-full aspect-square rounded-xl overflow-hidden shrink-0 transition-all \$\{/, 'className={`relative w-20 md:w-full aspect-square rounded-xl overflow-hidden shrink-0 transition-all ${');
fs.writeFileSync(product, productContent);
