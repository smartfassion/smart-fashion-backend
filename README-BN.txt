SMART FASHION & GADGETS — PUBLISH-READY DEMO BACKEND

এটি একটি শেখার/ডেমো Backend। এতে নমুনা পণ্য দেখায় এবং ডেমো অর্ডার গ্রহণ করে।
এটি Business Koro-তে connect করে না, কোনো real order/payment করে না, এবং API key নেয় না।

ফাইল:
- server.js: API routes
- package.json: dependencies
- render.yaml: Render deployment configuration

Render-এ প্রকাশ:
1. ZIP Extract করে ফাইলগুলো GitHub repository-তে upload করতে হবে।
2. Render-এ New > Web Service দিয়ে সেই repository বেছে নিতে হবে।
3. Runtime Node, Build Command `npm install`, Start Command `npm start`।
4. Deploy হলে Render একটি URL দেবে।
5. পরীক্ষা:
   - https://YOUR-BACKEND-URL/
   - https://YOUR-BACKEND-URL/api/health
   - https://YOUR-BACKEND-URL/api/products

Frontend-এ পরে API URL ব্যবহার হবে:
fetch("https://YOUR-BACKEND-URL/api/products")

গুরুত্বপূর্ণ:
- এই demo endpoint-এ বাস্তব অর্ডার পাঠিও না।
- API secret কখনো index.html, GitHub public repository বা chat-এ দেবে না।
- আসল Business Koro integration-এর জন্য তাদের সম্পূর্ণ official API docs, অনুমোদিত account access, backend-side secret storage, authentication, validation, rate limits এবং error handling দরকার।
- এই ZIP একা Business Koro product sync বা real order fulfilment করে না।
