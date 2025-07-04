<?php
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../utils/Auth.php';

class AuthController {
    public static function register($name, $email, $password, $role) {
        global $conn;
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $conn->prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
        $stmt->bind_param('ssss', $name, $email, $hashedPassword, $role);
        try {
            $stmt->execute();
            Auth::logAction('register', 'Registered user: ' . $email);
            return ['success' => true, 'message' => 'Registration successful'];
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()];
        }
    }

    public static function login($email, $password) {
        global $conn;
        $stmt = $conn->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        if ($user && password_verify($password, $user['password'])) {
            unset($user['password']);
            $token = Auth::login($user);
            Auth::logAction('login', 'Login attempt for: ' . $email);
            return ['success' => true, 'user' => $user, 'token' => $token];
        }
        return ['success' => false, 'message' => 'Invalid credentials'];
    }

    public static function requestPasswordReset($email) {
        global $conn;
        $stmt = $conn->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($user = $result->fetch_assoc()) {
            $user_id = $user['id'];
            $token = bin2hex(random_bytes(32));
            $expires_at = date('Y-m-d H:i:s', time() + 3600); // 1 hour
            $stmt2 = $conn->prepare('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)');
            $stmt2->bind_param('iss', $user_id, $token, $expires_at);
            $stmt2->execute();
            // In production, send $token to user's email
            Auth::logAction('password_reset_request', 'Requested for: ' . $email);
            return ['success' => true, 'token' => $token];
        }
        return ['success' => false, 'message' => 'Email not found'];
    }
    public static function resetPassword($token, $new_password) {
        global $conn;
        $stmt = $conn->prepare('SELECT user_id, expires_at FROM password_resets WHERE token = ?');
        $stmt->bind_param('s', $token);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            if (strtotime($row['expires_at']) < time()) {
                return ['success' => false, 'message' => 'Token expired'];
            }
            $user_id = $row['user_id'];
            $hashed = password_hash($new_password, PASSWORD_DEFAULT);
            $stmt2 = $conn->prepare('UPDATE users SET password = ? WHERE id = ?');
            $stmt2->bind_param('si', $hashed, $user_id);
            $stmt2->execute();
            $stmt3 = $conn->prepare('DELETE FROM password_resets WHERE token = ?');
            $stmt3->bind_param('s', $token);
            $stmt3->execute();
            Auth::logAction('password_reset', 'Password reset with token: ' . $token);
            return ['success' => true, 'message' => 'Password reset successful'];
        }
        return ['success' => false, 'message' => 'Invalid token'];
    }
} 