const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
    
    // Quick hack for API endpoints to return dummy success so frontend doesn't crash completely
    if (req.url.startsWith('/api/')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        
        // Mock a login response with roles
        if (req.url === '/api/login') {
            let body = '';
            req.on('data', chunk => body += chunk.toString());
            req.on('end', () => {
                const data = JSON.parse(body || '{}');
                const role = data.username === 'admin' ? 'admin' : 'member';
                res.end(JSON.stringify({ 
                    message: "Backend is offline. Mock login.", 
                    role: role,
                    name: role === 'admin' ? 'Administrator' : 'Test Member',
                    id: 1,
                    membership_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                }));
            });
            return;
        } else if (req.url === '/api/members' || req.url === '/api/checkins/today') {
            return res.end(JSON.stringify([]));
        }
        
        return res.end(JSON.stringify({ message: "Backend is temporarily offline." }));
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err, indexContent) => {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(indexContent, 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Static server running at http://localhost:${PORT}/`);
});
