<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Telegram Bot настройки
$botToken = '8391094388:AAGyYn4RWPMilwdfkrq3j1raso5CNcJ97H8';
$chatId = '-4840450399';

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

// Получаем данные из JSON или POST
$input = json_decode(file_get_contents('php://input'), true);

if ($input) {
    // JSON запрос
    $name = $input['name'] ?? '';
    $phone = $input['phone'] ?? '';
    $type = $input['type'] ?? $input['services'] ?? 'Заявка';
    $subdomain = $input['subdomain'] ?? '';
} else {
    // Form POST запрос
    $name = $_POST['name'] ?? $_POST['header-name'] ?? '';
    $phone = $_POST['phone'] ?? $_POST['header-phone'] ?? '';
    $type = $_POST['service'] ?? $_POST['services'] ?? 'Заявка';
    $subdomain = '';
}

// Определяем город по хосту если не передан
if (empty($subdomain)) {
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $parts = explode('.', $host);
    if (count($parts) >= 3) {
        $subdomain = $parts[0];
    } else {
        $subdomain = 'sar';
    }
}

$name = htmlspecialchars($name ?: 'Не указано');
$phone = htmlspecialchars($phone ?: 'Не указан');
$type = htmlspecialchars($type);

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

// Определяем тип запроса
$isAjax = !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
          strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
$isJson = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false;

if ($result) {
    if ($isAjax || $isJson || $input) {
        // AJAX/JSON запрос - возвращаем JSON
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => true]);
    } else {
        // Обычная форма - редирект на страницу благодарности или назад
        $referer = $_SERVER['HTTP_REFERER'] ?? '/';
        header('Location: ' . $referer . '?success=1');
    }
} else {
    if ($isAjax || $isJson || $input) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Telegram API error']);
    } else {
        $referer = $_SERVER['HTTP_REFERER'] ?? '/';
        header('Location: ' . $referer . '?error=1');
    }
}
