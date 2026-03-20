const http = require('http');
const https = require('https');

const TOKEN = '8391094388:AAGyYn4RWPMilwdfkrq3j1raso5CNcJ97H8';
const CHAT_ID = '-1003752788353';
const PROXY_HOST = '181.177.85.108';
const PROXY_PORT = 9336;
const PROXY_USER = 'GKvDm1';
const PROXY_PASS = 'G2zaBr';

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
    if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        try {
            const data = JSON.parse(body);

            let text;
            if (data.message) {
                text = data.message;
            } else {
                if (!data.name || !data.phone || data.phone.length < 6) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ error: 'Invalid data' }));
                    return;
                }
                text = '\u{1F514} Новая заявка с РусВодоканал (' + (data.city || 'Саратов') + ')\n\n'
                    + '\u{1F464} Имя: ' + data.name + '\n'
                    + '\u{1F4DE} Телефон: ' + data.phone + '\n'
                    + '\u{1F4CB} Тип заявки: ' + (data.type || 'Заявка') + '\n'
                    + '\u23F0 Время: ' + new Date().toLocaleString('ru-RU');
            }

            const payload = JSON.stringify({
                chat_id: CHAT_ID,
                text: text,
                parse_mode: 'HTML'
            });

            const auth = Buffer.from(PROXY_USER + ':' + PROXY_PASS).toString('base64');

            const proxyReq = http.request({
                host: PROXY_HOST,
                port: PROXY_PORT,
                method: 'CONNECT',
                path: 'api.telegram.org:443',
                headers: { 'Proxy-Authorization': 'Basic ' + auth }
            });

            proxyReq.on('connect', (_, socket) => {
                const tgReq = https.request({
                    hostname: 'api.telegram.org',
                    path: '/bot' + TOKEN + '/sendMessage',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(payload)
                    },
                    socket: socket,
                    agent: false
                }, tgRes => {
                    let result = '';
                    tgRes.on('data', chunk => result += chunk);
                    tgRes.on('end', () => {
                        res.writeHead(tgRes.statusCode);
                        res.end(result);
                    });
                });
                tgReq.on('error', (e) => {
                    res.writeHead(502);
                    res.end(JSON.stringify({ error: e.message }));
                });
                tgReq.write(payload);
                tgReq.end();
            });

            proxyReq.on('error', (e) => {
                res.writeHead(502);
                res.end(JSON.stringify({ error: e.message }));
            });
            proxyReq.end();
        } catch (e) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: e.message }));
        }
    });
});

server.listen(3377, '127.0.0.1', () => {
    console.log('TG proxy running on http://127.0.0.1:3377');
});
