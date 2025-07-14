<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RISA Management System - Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .stat-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            border-left: 4px solid #007AFF;
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #007AFF;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9rem;
        }
        
        .actions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 40px;
        }
        
        .action-btn {
            background: #007AFF;
            color: white;
            padding: 15px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: background 0.3s ease;
            text-decoration: none;
            display: inline-block;
            text-align: center;
        }
        
        .action-btn:hover {
            background: #0056CC;
        }
        
        .api-section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            margin-top: 30px;
        }
        
        .api-section h3 {
            color: #333;
            margin-bottom: 15px;
        }
        
        .api-endpoint {
            background: white;
            padding: 10px;
            border-radius: 5px;
            margin: 5px 0;
            font-family: monospace;
            border-left: 3px solid #28a745;
        }
        
        .credentials {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .credentials h4 {
            color: #856404;
            margin-bottom: 10px;
        }
        
        .credential-item {
            margin: 5px 0;
            font-family: monospace;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏫 RISA Management System</h1>
            <p>School Management Dashboard</p>
        </div>
        
        <div class="content">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">2</div>
                    <div class="stat-label">Total Students</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">2</div>
                    <div class="stat-label">Total Teachers</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">2</div>
                    <div class="stat-label">Active Classes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">3</div>
                    <div class="stat-label">Subjects</div>
                </div>
            </div>
            
            <div class="actions-grid">
                <a href="/api-test" class="action-btn">🔧 Test API</a>
                <a href="/api-status" class="action-btn">📊 API Status</a>
                <a href="/health" class="action-btn">💚 Health Check</a>
                <a href="/test" class="action-btn">🧪 Test Endpoint</a>
            </div>
            
            <div class="api-section">
                <h3>🔌 API Endpoints</h3>
                <div class="api-endpoint">POST /api/login - User authentication</div>
                <div class="api-endpoint">GET /api/dashboard - Dashboard data</div>
                <div class="api-endpoint">GET /api/users - User management</div>
                <div class="api-endpoint">GET /api/students - Student management</div>
                <div class="api-endpoint">GET /api/teachers - Teacher management</div>
                <div class="api-endpoint">GET /api/attendance - Attendance management</div>
            </div>
            
            <div class="credentials">
                <h4>🔑 Test Credentials</h4>
                <div class="credential-item">Admin: admin@risa.edu / admin123</div>
                <div class="credential-item">Teacher: teacher@risa.edu / teacher123</div>
                <div class="credential-item">Parent: parent@risa.edu / parent123</div>
                <div class="credential-item">Student: student1@risa.edu / student123</div>
            </div>
        </div>
    </div>
</body>
</html> 