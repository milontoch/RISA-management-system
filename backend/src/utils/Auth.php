<?php
session_start();

class Auth {
    public static function login($user) {
        $_SESSION['user'] = $user;
        $_SESSION['token'] = bin2hex(random_bytes(16));
        return $_SESSION['token'];
    }
    public static function logout() {
        session_destroy();
    }
    public static function check() {
        return isset($_SESSION['user']);
    }
    public static function user() {
        return $_SESSION['user'] ?? null;
    }
    public static function token() {
        return $_SESSION['token'] ?? null;
    }
    public static function isAdmin() {
        return isset($_SESSION['user']) && $_SESSION['user']['role'] === 'admin';
    }
    public static function isTeacher() {
        return isset($_SESSION['user']) && $_SESSION['user']['role'] === 'teacher';
    }
    public static function isStudent() {
        return isset($_SESSION['user']) && $_SESSION['user']['role'] === 'student';
    }
    public static function isParent() {
        return isset($_SESSION['user']) && $_SESSION['user']['role'] === 'parent';
    }
    public static function requireRole($role) {
        if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== $role) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => ucfirst($role) . ' access required']);
            exit;
        }
    }

    public static function logAction($action, $details = null) {
        global $conn;
        $user = self::user();
        $user_id = $user ? $user['id'] : null;
        $stmt = $conn->prepare('INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)');
        $stmt->bind_param('iss', $user_id, $action, $details);
        $stmt->execute();
    }
} 