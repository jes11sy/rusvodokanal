<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Telegram Bot настройки
$telegramBotToken = 'YOUR_BOT_TOKEN'; // Замени на свой токен бота
$telegramChatId = 'YOUR_CHAT_ID';     // Замени на свой chat_id

// Названия городов по поддоменам
$cityNames = [
    'sar' => 'Саратов',
    'eng' => 'Энгельс',
    'uly' => 'Ульяновск',
    'tol' => 'Тольятти',
    'pnz' => 'Пенза',
    'yar' => 'Ярославль',
    'oms' => 'Омск',
    'rusvodokanal' => 'Саратов', // основной домен
    'www' => 'Саратов',
];

// Получаем данные
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit();
}

$name = isset($data['name']) ? trim($data['name']) : '';
$phone = isset($data['phone']) ? trim($data['phone']) : '';
$service = isset($data['service']) ? trim($data['service']) : 'Не указано';
$percent = isset($data['percent']) ? $data['percent'] : 0;

// Определяем город по поддомену
$host = $_SERVER['HTTP_HOST'] ?? 'rusvodokanal.ru';
$subdomain = explode('.', $host)[0];
$cityName = isset($cityNames[$subdomain]) ? $cityNames[$subdomain] : 'Неизвестный город';

// Тип заявки
$requestType = $percent > 0 ? "Вызов мастера (скидка {$percent}%)" : "Вызов мастера";
if (!empty($service) && $service !== 'Не указано') {
    $requestType = $service;
}

// Формируем сообщение для Telegram
$date = date('d.m.Y, H:i:s');
$message = "🔔 *Новая заявка с Водоканал* ({$cityName})\n\n";
$message .= "👤 *Имя:* {$name}\n";
$message .= "📞 *Телефон:* {$phone}\n";
$message .= "📋 *Тип заявки:* {$requestType}\n\n";
$message .= "⏰ *Время:* {$date}";

// Отправляем в Telegram
$telegramUrl = "https://api.telegram.org/bot{$telegramBotToken}/sendMessage";
$telegramData = [
    'chat_id' => $telegramChatId,
    'text' => $message,
    'parse_mode' => 'Markdown',
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $telegramUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($telegramData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Telegram error', 'response' => $response]);
}
