<?php
require_once '../config/database.php';

header('Content-Type: application/json');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    
    // Validate input
    if (empty($name) || empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Name and email are required']);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        exit;
    }
    
    try {
        // Check if email is taken by another user
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$email, $_SESSION['user_id']]);
        
        if ($stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Email already in use']);
            exit;
        }
        
        // Update user information
        $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
        $stmt->execute([$name, $email, $_SESSION['user_id']]);
        
        // Update session
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;
        
        echo json_encode([
            'success' => true,
            'message' => 'Account updated successfully'
        ]);
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Update failed']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
 