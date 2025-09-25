<?php
// Simple guestbook endpoint (GET/POST/DELETE) storing data in data/guestbook.json
// Lives alongside the static site. No external services required.

// Basic headers
header('Content-Type: application/json; charset=utf-8');
// Allow CORS if needed (safe for same-origin too)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

$file = __DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'guestbook.json';
$dir = dirname($file);
if (!is_dir($dir)) {
  @mkdir($dir, 0777, true);
}

function read_notes($file) {
  if (!file_exists($file)) return [];
  $raw = @file_get_contents($file);
  if ($raw === false || $raw === '') return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function write_notes($file, $notes) {
  $fp = @fopen($file, 'c+');
  if (!$fp) return false;
  // exclusive lock
  if (!flock($fp, LOCK_EX)) { fclose($fp); return false; }
  // truncate and write
  ftruncate($fp, 0);
  rewind($fp);
  $ok = fwrite($fp, json_encode($notes, JSON_UNESCAPED_UNICODE)) !== false;
  fflush($fp);
  flock($fp, LOCK_UN);
  fclose($fp);
  return $ok;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

switch ($method) {
  case 'GET':
    $notes = read_notes($file);
    echo json_encode($notes, JSON_UNESCAPED_UNICODE);
    break;

  case 'POST':
    $input = json_decode(file_get_contents('php://input'), true);
    $msg = isset($input['m']) ? trim((string)$input['m']) : '';
    $t = isset($input['t']) ? intval($input['t']) : (int) round(microtime(true) * 1000);
    if ($msg === '') { http_response_code(400); echo json_encode(['error' => 'bad_request']); break; }
    $notes = read_notes($file);
    $notes[] = [ 'm' => $msg, 't' => $t ];
    if (!write_notes($file, $notes)) { http_response_code(500); echo json_encode(['error' => 'write_failed']); break; }
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    break;

  case 'DELETE':
    $input = json_decode(file_get_contents('php://input'), true);
    $t = isset($input['t']) ? intval($input['t']) : 0;
    if (!$t) { http_response_code(400); echo json_encode(['error' => 'bad_request']); break; }
    $notes = read_notes($file);
    $notes = array_values(array_filter($notes, function($n) use ($t){ return intval($n['t'] ?? 0) !== $t; }));
    if (!write_notes($file, $notes)) { http_response_code(500); echo json_encode(['error' => 'write_failed']); break; }
    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
    break;

  default:
    http_response_code(405);
    echo json_encode(['error' => 'method_not_allowed']);
}


