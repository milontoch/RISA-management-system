<?php
require_once __DIR__ . '/../../config/db.php';

class MessageController {
    public static function sendMessage($sender_id, $receiver_id, $message) {
        global $conn;
        $stmt = $conn->prepare('INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)');
        $stmt->bind_param('iis', $sender_id, $receiver_id, $message);
        if ($stmt->execute()) {
            return ['success' => true, 'id' => $conn->insert_id];
        }
        return ['success' => false, 'message' => 'Failed to send message'];
    }

    public static function getMessages($user_id) {
        global $conn;
        $stmt = $conn->prepare('SELECT * FROM messages WHERE receiver_id = ? OR sender_id = ? ORDER BY sent_at DESC');
        $stmt->bind_param('ii', $user_id, $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $messages = [];
        while ($row = $result->fetch_assoc()) {
            $messages[] = $row;
        }
        return ['success' => true, 'messages' => $messages];
    }

    public static function getConversation($user1_id, $user2_id) {
        global $conn;
        $stmt = $conn->prepare('SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY sent_at ASC');
        $stmt->bind_param('iiii', $user1_id, $user2_id, $user2_id, $user1_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $messages = [];
        while ($row = $result->fetch_assoc()) {
            $messages[] = $row;
        }
        return ['success' => true, 'messages' => $messages];
    }

    public static function markAsRead($message_id) {
        global $conn;
        $stmt = $conn->prepare('UPDATE messages SET is_read = 1 WHERE id = ?');
        $stmt->bind_param('i', $message_id);
        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Message marked as read'];
        }
        return ['success' => false, 'message' => 'Failed to mark as read'];
    }
} 