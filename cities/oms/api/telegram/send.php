<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Telegram Bot настройки
$botToken = '8391094388:AAGyYn4RWPMilwdfkrq3j1raso5CNcJ97H8'; // Замени на токен бота
$chatId = '-4840450399';     // Замени на ID чата

// Названия городов по поддоменам
$cities = [
    'sar' => 'Саратов',
    'eng' => 'Энгельс',
    'uly' => 'Ульяновск',
    'tol' => 'Тольятти',
    'pnz' => 'Пенза',
    'yar' => 'Ярославль',
    'oms' => 'Омск',
    'rusvodokanal' => 'Основной'
];

// Получаем данные
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'error' => 'No data']);
    exit();
}

$name = htmlspecialchars($input['name'] ?? 'Не указано');
$phone = htmlspecialchars($input['phone'] ?? 'Не указан');
$type = htmlspecialchars($input['type'] ?? 'Заявка');
$subdomain = htmlspecialchars($input['subdomain'] ?? 'rusvodokanal');

// Определяем город
$cityName = $cities[$subdomain] ?? 'Неизвестный';

// Время
date_default_timezone_set('Europe/Moscow');
$time = date('d.m.Y, H:i:s');

// Формируем сообщение
$message = "🔔 *Новая заявка с РусВодоканал* ($cityName)\n\n";
$message .= "👤 *Имя:* $name\n";
$message .= "📞 *Телефон:* $phone\n";
$message .= "📋 *Тип заявки:* $type\n\n";
$message .= "⏰ *Время:* $time";

// Отправляем в Telegram
$url = "https://api.telegram.org/bot$botToken/sendMessage";
$data = [
    'chat_id' => $chatId,
    'text' => $message,
    'parse_mode' => 'Markdown'
];

$options = [
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/x-www-form-urlencoded',
        'content' => http_build_query($data)
    ]
];

$context = stream_context_create($options);
$result = @file_get_contents($url, false, $context);

if ($result) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Telegram API error']);
}
