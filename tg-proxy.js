/**
 * POST / — принимает JSON от nginx (/tg-notify → 127.0.0.1:3377).
 * Уходит в api.telegram.org через прокси (HTTP CONNECT или SOCKS5).
 *
 * Установка: npm install && node tg-proxy.js
 * systemd: см. deploy/tg-proxy.service
 *
 * TG_PROXY_TYPE=http | socks5 (по умолчанию http)
 * TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TG_PROXY_HOST, TG_PROXY_PORT, TG_PROXY_USER, TG_PROXY_PASS
 */
'use strict';

const http = require('http');
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { SocksProxyAgent } = require('socks-proxy-agent');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8391094388:AAGyYn4RWPMilwdfkrq3j1raso5CNcJ97H8';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003752788353';
const PROXY_HOST = process.env.TG_PROXY_HOST || '181.177.85.108';
const PROXY_PORT = parseInt(process.env.TG_PROXY_PORT || '9336', 10);
const PROXY_USER = process.env.TG_PROXY_USER || 'GKvDm1';
const PROXY_PASS = process.env.TG_PROXY_PASS || 'G2zaBr';
const PROXY_TYPE = (process.env.TG_PROXY_TYPE || 'http').toLowerCase();

const LISTEN_HOST = process.env.TG_LISTEN_HOST || '127.0.0.1';
const LISTEN_PORT = parseInt(process.env.TG_LISTEN_PORT || '3377', 10);

function escHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function buildProxyAgent() {
    const u = encodeURIComponent(PROXY_USER);
    const p = encodeURIComponent(PROXY_PASS);
    if (PROXY_TYPE === 'socks5' || PROXY_TYPE === 'socks') {
        return new SocksProxyAgent(
            'socks5://' + u + ':' + p + '@' + PROXY_HOST + ':' + PROXY_PORT
        );
    }
    return new HttpsProxyAgent('http://' + u + ':' + p + '@' + PROXY_HOST + ':' + PROXY_PORT);
}

const agent = buildProxyAgent();

function sendTelegram(payload, res) {
    const body = Buffer.from(payload, 'utf8');
    const req = https.request(
        'https://api.telegram.org/bot' + TOKEN + '/sendMessage',
        {
            method: 'POST',
            agent,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': body.length
            },
            timeout: 60000
        },
        (tgRes) => {
            const chunks = [];
            tgRes.on('data', (c) => chunks.push(c));
            tgRes.on('end', () => {
                const out = Buffer.concat(chunks);
                res.writeHead(tgRes.statusCode || 502, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(out.length ? out : JSON.stringify({ ok: false }));
            });
        }
    );
    req.on('timeout', () => {
        req.destroy(new Error('Telegram request timeout'));
    });
    req.on('error', (e) => {
        if (res.headersSent) return;
        res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
    });
    req.write(body);
    req.end();
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    let raw = '';
    req.on('data', (chunk) => {
        raw += chunk;
        if (raw.length > 65536) {
            req.destroy();
        }
    });
    req.on('end', () => {
        try {
            const data = JSON.parse(raw || '{}');

            let text;
            if (data.message) {
                text = String(data.message);
            } else {
                if (!data.name || !data.phone || String(data.phone).length < 6) {
                    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ error: 'Invalid data' }));
                    return;
                }
                const city = escHtml(data.city || 'Саратов');
                const name = escHtml(data.name);
                const phone = escHtml(data.phone);
                const type = escHtml(data.type || 'Заявка');
                text =
                    '\u{1F514} Новая заявка с РусВодоканал (' + city + ')\n\n' +
                    '\u{1F464} Имя: ' + name + '\n' +
                    '\u{1F4DE} Телефон: ' + phone + '\n' +
                    '\u{1F4CB} Тип заявки: ' + type + '\n' +
                    '\u23F0 Время: ' + escHtml(new Date().toLocaleString('ru-RU'));
            }

            const payload = JSON.stringify({
                chat_id: CHAT_ID,
                text,
                parse_mode: 'HTML'
            });

            sendTelegram(payload, res);
        } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: e.message }));
        }
    });
});

server.listen(LISTEN_PORT, LISTEN_HOST, () => {
    console.log(
        '[tg-proxy] http://' + LISTEN_HOST + ':' + LISTEN_PORT +
            ' → Telegram via ' + PROXY_TYPE + ' ' + PROXY_HOST + ':' + PROXY_PORT
    );
});
