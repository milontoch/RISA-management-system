<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RISA API Test</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: #007AFF;
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .content {
            padding: 30px;
        }
        
        .test-section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        
        .test-section h3 {
            color: #333;
            margin-bottom: 15px;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #333;
        }
        
        input, select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }
        
        button {
            background: #007AFF;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            margin-right: 10px;
        }
        
        button:hover {
            background: #0056CC;
        }
        
        .response {
            background: #f8f9fa;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-top: 15px;
            font-family: monospace;
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .success {
            border-color: #28a745;
            background: #d4edda;
        }
        
        .error {
            border-color: #dc3545;
            background: #f8d7da;
        }
        
        .endpoint-info {
            background: #e9ecef;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 10px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 RISA API Test Interface</h1>
            <p>Test your API endpoints and authentication</p>
        </div>
        
        <div class="content">
            <!-- Login Test -->
            <div class="test-section">
                <h3>🔐 Login Test</h3>
                <div class="endpoint-info">POST /api/login</div>
                
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="loginEmail" value="admin@risa.edu" placeholder="Enter email">
                </div>
                
                <div class="form-group">
                    <label>Password:</label>
                    <input type="password" id="loginPassword" value="admin123" placeholder="Enter password">
                </div>
                
                <button onclick="testLogin()">Test Login</button>
                <button onclick="clearResponse('loginResponse')">Clear</button>
                
                <div id="loginResponse" class="response"></div>
            </div>
            
            <!-- Dashboard Test -->
            <div class="test-section">
                <h3>📊 Dashboard Test</h3>
                <div class="endpoint-info">GET /api/dashboard</div>
                
                <button onclick="testDashboard()">Test Dashboard</button>
                <button onclick="clearResponse('dashboardResponse')">Clear</button>
                
                <div id="dashboardResponse" class="response"></div>
            </div>
            
            <!-- Users Test -->
            <div class="test-section">
                <h3>👥 Users Test</h3>
                <div class="endpoint-info">GET /api/users</div>
                
                <button onclick="testUsers()">Test Users</button>
                <button onclick="clearResponse('usersResponse')">Clear</button>
                
                <div id="usersResponse" class="response"></div>
            </div>
            
            <!-- Students Test -->
            <div class="test-section">
                <h3>🎓 Students Test</h3>
                <div class="endpoint-info">GET /api/students</div>
                
                <button onclick="testStudents()">Test Students</button>
                <button onclick="clearResponse('studentsResponse')">Clear</button>
                
                <div id="studentsResponse" class="response"></div>
            </div>
            
            <!-- Health Check -->
            <div class="test-section">
                <h3>💚 Health Check</h3>
                <div class="endpoint-info">GET /health</div>
                
                <button onclick="testHealth()">Test Health</button>
                <button onclick="clearResponse('healthResponse')">Clear</button>
                
                <div id="healthResponse" class="response"></div>
            </div>
        </div>
    </div>

    <script>
        let authToken = null;
        
        async function makeRequest(url, options = {}) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...options.headers
                    },
                    ...options
                });
                
                const data = await response.json();
                return { success: response.ok, status: response.status, data };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        
        function displayResponse(elementId, result) {
            const element = document.getElementById(elementId);
            element.textContent = JSON.stringify(result, null, 2);
            element.className = 'response ' + (result.success ? 'success' : 'error');
        }
        
        function clearResponse(elementId) {
            const element = document.getElementById(elementId);
            element.textContent = '';
            element.className = 'response';
        }
        
        async function testLogin() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const result = await makeRequest('/api/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            if (result.success && result.data.token) {
                authToken = result.data.token;
                console.log('Token saved:', authToken);
            }
            
            displayResponse('loginResponse', result);
        }
        
        async function testDashboard() {
            const result = await makeRequest('/api/dashboard', {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            displayResponse('dashboardResponse', result);
        }
        
        async function testUsers() {
            const result = await makeRequest('/api/users', {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            displayResponse('usersResponse', result);
        }
        
        async function testStudents() {
            const result = await makeRequest('/api/students', {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            displayResponse('studentsResponse', result);
        }
        
        async function testHealth() {
            const result = await makeRequest('/health');
            displayResponse('healthResponse', result);
        }
        
        // Auto-test health on page load
        window.onload = function() {
            testHealth();
        };
    </script>
</body>
</html> 