const http = require('http');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const cvContent = Buffer.from('SHUBHAM JAMDAR\nSenior Frontend Engineer\nEmail: shubham.jamdar@tasknera.io | Phone: +91 98765 43210 | Location: Pune, Maharashtra\n\nSUMMARY\nSenior Frontend Engineer with 5+ years experience architecting scalable React and TypeScript web applications.\n\nEXPERIENCE\nSenior Frontend Engineer — AlphaCraft Tech Solutions (2021 – Present)\n- Built UI with React and TypeScript.\n\nEDUCATION\nBachelor of Engineering in Computer Engineering (2015 – 2019)\n\nSKILLS\nReact, Next.js, TypeScript, JavaScript, Tailwind CSS, Node.js, Git');

const header = Buffer.from('--' + boundary + '\r\nContent-Disposition: form-data; name="files"; filename="Shubham_Jamdar_CV.txt"\r\nContent-Type: text/plain\r\n\r\n');
const footer = Buffer.from('\r\n--' + boundary + '--\r\n');
const payload = Buffer.concat([header, cvContent, footer]);

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/jobs/jd-1/candidates/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': payload.length
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    const json = JSON.parse(data);
    const cand = json.candidates[0];
    console.log('=== PARSED CANDIDATE RESULTS ===');
    console.log('  Name:', cand.name);
    console.log('  Email:', cand.email);
    console.log('  Phone:', cand.phone);
    console.log('  Current Title:', cand.currentTitle);
    console.log('  Current Company:', cand.currentCompany);
    console.log('  Skills:', cand.skills);
    console.log('  Status:', cand.parsingStatus);
    console.log('  Source Evidence:', cand.sourceEvidence);
    console.log('  Debug Preview:', cand.debug ? cand.debug.rawTextPreview.substring(0, 80) : 'N/A');
  });
});
req.write(payload);
req.end();
