<?php
// Load environment variables
function loadEnv($file) {
    if (!file_exists($file)) {
        return;
    }
    
    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) continue;
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        // Remove quotes if present
        if (preg_match('/^(["\'])(.*)\1$/', $value, $matches)) {
            $value = $matches[2];
        }
        
        $_ENV[$name] = $value;
        putenv("$name=$value");
    }
}

// Load .env file if it exists
loadEnv(__DIR__ . '/../.env');

// Configuration class
class Config {
    public static function get($key, $default = null) {
        return $_ENV[$key] ?? $default;
    }
    
    public static function getDatabaseConfig() {
        return [
            'host' => self::get('DB_HOST', 'localhost'),
            'dbname' => self::get('DB_NAME', 'school_management'),
            'username' => self::get('DB_USERNAME', 'root'),
            'password' => self::get('DB_PASSWORD', '')
        ];
    }
    
    public static function getAppConfig() {
        return [
            'name' => self::get('APP_NAME', 'RISA Management System'),
            'env' => self::get('APP_ENV', 'production'),
            'debug' => self::get('APP_DEBUG', 'false') === 'true',
            'url' => self::get('APP_URL', ''),
            'frontend_url' => self::get('FRONTEND_URL', ''),
            'timezone' => self::get('TIMEZONE', 'UTC')
        ];
    }
    
    public static function getSecurityConfig() {
        return [
            'jwt_secret' => self::get('JWT_SECRET', 'default-secret-key'),
            'session_secret' => self::get('SESSION_SECRET', 'default-session-key')
        ];
    }
    
    public static function getUploadConfig() {
        return [
            'max_size' => (int) self::get('UPLOAD_MAX_SIZE', 10485760),
            'allowed_types' => explode(',', self::get('ALLOWED_FILE_TYPES', 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx'))
        ];
    }
    
    public static function getEmailConfig() {
        return [
            'host' => self::get('SMTP_HOST', ''),
            'port' => (int) self::get('SMTP_PORT', 587),
            'username' => self::get('SMTP_USERNAME', ''),
            'password' => self::get('SMTP_PASSWORD', ''),
            'encryption' => self::get('SMTP_ENCRYPTION', 'tls')
        ];
    }
} 