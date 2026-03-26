<?php
header('Content-Type: application/json');

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get form data
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$subject = isset($_POST['subject']) ? trim($_POST['subject']) : '';
$message = isset($_POST['message']) ? trim($_POST['message']) : '';

// Validate inputs
$errors = [];

if (empty($name)) {
    $errors[] = 'Name is required';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Valid email is required';
}

if (empty($subject)) {
    $errors[] = 'Subject is required';
}

if (empty($message)) {
    $errors[] = 'Message is required';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Validation failed', 'errors' => $errors]);
    exit();
}

// Prepare email
$to = '1355686@studentrocvantwente.nl'; // Change this to the actual email address
$email_subject = "New Contact Form Message: " . $subject;
$email_body = "You have received a new message from your portfolio contact form.\n\n";
$email_body .= "Name: " . $name . "\n";
$email_body .= "Email: " . $email . "\n";
$email_body .= "Subject: " . $subject . "\n";
$email_body .= "Message:\n" . $message . "\n";

// Additional headers
$headers = "From: " . $email . "\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Create log directory if it doesn't exist
$log_dir = __DIR__;
if (!is_dir($log_dir)) {
    mkdir($log_dir, 0755, true);
}

// Always log the message to a file (primary method)
$log_message = "[" . date('Y-m-d H:i:s') . "] Name: $name, Email: $email, Subject: $subject\n";
$log_message .= "Message: " . str_replace("\n", "\n  ", $message) . "\n";
$log_message .= str_repeat("-", 80) . "\n";

$log_file = $log_dir . '/messages.log';
$log_result = file_put_contents($log_file, $log_message, FILE_APPEND | LOCK_EX);

if ($log_result === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to save message. Please try again later.', 'debug' => 'Could not write to log file']);
    exit();
}

// Try to send email (optional - may not work on all servers)
$mail_sent = @mail($to, $email_subject, $email_body, $headers);

// Success response - message was saved even if email failed
http_response_code(200);
echo json_encode([
    'success' => true, 
    'message' => 'Message received! We will get back to you soon.',
    'email_sent' => $mail_sent ? true : false
]);
?>
