<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:3001");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// إعداد توقيت السيرفر
date_default_timezone_set('Africa/Cairo');

$host = 'localhost';
$dbname = 'found_lost';
$username = 'root';
$password = '123456';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
    exit;
}

// دالة إرسال الإيميل باستخدام Resend.com
function sendResetEmail($email, $reset_code, $user_name = "") {
    $api_key = 're_Wqu9CSnJ_7p2DcdmGCv7hrjTpP4FwFdYS';
    
    $data = [
        'from' => 'FoundLost <onboarding@resend.dev>',
        'to' => [$email],
        'subject' => 'Password Reset Code - Found & Lost Platform',
        'html' => createEmailBody($reset_code, $user_name),
        'text' => "Password Reset Code: {$reset_code}\nThis code expires in 1 hour."
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.resend.com/emails');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $api_key
    ]);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    error_log("🔧 Resend API Response - Code: " . $http_code . " - Response: " . $response);
    
    if ($http_code === 200) {
        error_log("✅ Email sent via Resend to: " . $email);
        return true;
    } else {
        error_log("❌ Resend failed. HTTP Code: " . $http_code . " - Response: " . $response);
        return false;
    }
}

// دالة إنشاء محتوى الإيميل
function createEmailBody($reset_code, $user_name = "") {
    return "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                background-color: #f4f7fa; 
                margin: 0; 
                padding: 0; 
            }
            .container { 
                max-width: 600px; 
                margin: 20px auto; 
                background: white; 
                padding: 0; 
                border-radius: 15px; 
                box-shadow: 0 5px 20px rgba(0,0,0,0.1); 
                overflow: hidden;
            }
            .header { 
                background: linear-gradient(135deg, #28a745, #20c997); 
                color: white; 
                padding: 30px 20px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 28px; 
            }
            .content { 
                padding: 40px 30px; 
            }
            .code { 
                font-size: 42px; 
                font-weight: bold; 
                color: #28a745; 
                text-align: center; 
                margin: 30px 0; 
                padding: 25px; 
                background: #f8f9fa; 
                border-radius: 10px; 
                border: 2px dashed #28a745;
                letter-spacing: 8px;
            }
            .footer { 
                text-align: center; 
                margin-top: 40px; 
                color: #666; 
                font-size: 14px; 
                padding: 20px;
                background: #f8f9fa;
                border-radius: 0 0 15px 15px;
            }
            .info-box {
                background: #e7f3ff;
                border-left: 4px solid #007bff;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
            }
            .user-name {
                color: #28a745;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🔒 إعادة تعيين كلمة المرور</h1>
            </div>
            
            <div class='content'>
                <h2>مرحباً <span class='user-name'>" . ($user_name ?: 'عزيزي المستخدم') . "</span>,</h2>
                
                <p>لقد طلبت إعادة تعيين كلمة المرور لحسابك في منصة الفقدان والايجاد.</p>
                
                <p>يرجى استخدام رمز التحقق التالي لإعادة تعيين كلمة المرور:</p>
                
                <div class='code'>" . $reset_code . "</div>
                
                <div class='info-box'>
                    <strong>⏰ ملاحظة:</strong> سينتهي صلاحية هذا الرمز خلال <strong>ساعة واحدة</strong> من الآن.
                </div>
                
                <p>إذا لم تطلب إعادة التعيين، يرجى تجاهل هذا البريد الإلكتروني.</p>
            </div>
            
            <div class='footer'>
                <p>مع أطيب التحيات,<br><strong>فريق منصة الفقدان والايجاد</strong></p>
                <p style='margin-top: 10px; font-size: 12px; color: #999;'>
                    هذا بريد إلكتروني تلقائي، يرجى عدم الرد عليه.
                </p>
            </div>
        </div>
    </body>
    </html>
    ";
}

// Request password reset
if ($_SERVER['REQUEST_METHOD'] == 'POST' && $_GET['action'] == 'requestPasswordReset') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    error_log("🔑 Password reset requested for: " . $data['email']);
    
    $stmt = $pdo->prepare("SELECT id, name FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        $reset_code = rand(100000, 999999);
        $expires_at = date('Y-m-d H:i:s', strtotime('+1 hour'));
        
        error_log("🔢 Generated reset code: " . $reset_code . " for email: " . $data['email']);
        error_log("⏰ Code expires at: " . $expires_at);
        
        // احذف أي طلبات سابقة
        $stmt = $pdo->prepare("DELETE FROM password_resets WHERE email = ?");
        $stmt->execute([$data['email']]);
        
        // احفظ الرمز
        $stmt = $pdo->prepare("INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)");
        $stmt->execute([$data['email'], $reset_code, $expires_at]);
        
        error_log("💾 Reset code saved to database");
        
        // أرسل الإيميل
        $email_sent = sendResetEmail($data['email'], $reset_code, $user['name']);
        
        if ($email_sent) {
            error_log("✅ Email sent successfully");
            echo json_encode([
                "success" => true, 
                "message" => "تم إرسال رمز إعادة التعيين إلى بريدك الإلكتروني بنجاح",
                "debug_code" => $reset_code // للتست فقط
            ]);
        } else {
            error_log("⚠️ Email sending failed - returning code for testing");
            echo json_encode([
                "success" => true, 
                "message" => "تم إنشاء رمز إعادة التعيين. استخدم هذا الرمز للاختبار: " . $reset_code,
                "reset_code" => $reset_code,
                "debug" => "هناك مشكلة في خدمة البريد الإلكتروني. استخدم الرمز أعلاه للمتابعة."
            ]);
        }
    } else {
        error_log("❌ Email not found: " . $data['email']);
        echo json_encode(["success" => false, "message" => "البريد الإلكتروني غير موجود"]);
    }
    exit;
}

// Verify reset code
if ($_SERVER['REQUEST_METHOD'] == 'POST' && $_GET['action'] == 'verifyResetCode') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    error_log("🔍 Verifying reset code for: " . $data['email']);
    error_log("🔍 Code to verify: " . $data['reset_code']);
    error_log("🔍 Current PHP time: " . date('Y-m-d H:i:s'));
    
    // استخدام وقت PHP بدل NOW()
    $current_time = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("SELECT * FROM password_resets WHERE email = ? AND token = ? AND expires_at > ?");
    $stmt->execute([$data['email'], $data['reset_code'], $current_time]);
    $reset_request = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($reset_request) {
        error_log("✅ Code verification successful");
        error_log("✅ Code expires at: " . $reset_request['expires_at']);
        echo json_encode(["success" => true, "message" => "تم التحقق من الرمز بنجاح"]);
    } else {
        error_log("❌ Code verification failed");
        
        // تحقق إذا الرمز موجود لكن منتهي
        $stmt = $pdo->prepare("SELECT * FROM password_resets WHERE email = ? AND token = ?");
        $stmt->execute([$data['email'], $data['reset_code']]);
        $expired_code = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($expired_code) {
            error_log("❌ Code exists but expired. Expired at: " . $expired_code['expires_at']);
            echo json_encode(["success" => false, "message" => "الرمز منتهي الصلاحية"]);
        } else {
            error_log("❌ Code not found in database");
            echo json_encode(["success" => false, "message" => "الرمز غير صالح"]);
        }
    }
    exit;
}

// Reset password
if ($_SERVER['REQUEST_METHOD'] == 'POST' && $_GET['action'] == 'resetPassword') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    error_log("🔄 Resetting password for: " . $data['email']);
    error_log("🔍 Using code: " . $data['reset_code']);
    error_log("⏰ Current PHP time: " . date('Y-m-d H:i:s'));
    
    // استخدام وقت PHP بدل NOW()
    $current_time = date('Y-m-d H:i:s');
    
    $stmt = $pdo->prepare("SELECT * FROM password_resets WHERE email = ? AND token = ? AND expires_at > ?");
    $stmt->execute([$data['email'], $data['reset_code'], $current_time]);
    $reset_request = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($reset_request) {
        error_log("✅ Code valid, resetting password");
        
        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE email = ?");
        $stmt->execute([
            password_hash($data['new_password'], PASSWORD_DEFAULT),
            $data['email']
        ]);
        
        // احذف الرمز بعد الاستخدام
        $stmt = $pdo->prepare("DELETE FROM password_resets WHERE email = ?");
        $stmt->execute([$data['email']]);
        
        error_log("✅ Password reset successful");
        echo json_encode(["success" => true, "message" => "تم إعادة تعيين كلمة المرور بنجاح"]);
    } else {
        error_log("❌ Invalid code for password reset");
        echo json_encode(["success" => false, "message" => "الرمز غير صالح أو منتهي الصلاحية"]);
    }
    exit;
}

// Test email function
if ($_SERVER['REQUEST_METHOD'] == 'POST' && $_GET['action'] == 'testEmail') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $test_email = $data['email'] ?? 'test@example.com';
    $test_code = '123456';
    $test_name = 'Test User';
    
    error_log("🧪 Testing email to: " . $test_email);
    
    $result = sendResetEmail($test_email, $test_code, $test_name);
    
    if ($result) {
        echo json_encode(["success" => true, "message" => "تم إرسال البريد الإلكتروني التجريبي بنجاح"]);
    } else {
        echo json_encode(["success" => false, "message" => "فشل إرسال البريد الإلكتروني التجريبي"]);
    }
    exit;
}

// Get all items
if ($_SERVER['REQUEST_METHOD'] == 'GET' && $_GET['action'] == 'getItems') {
    try {
        $stmt = $pdo->query("
            SELECT items.*, users.name as user_name 
            FROM items 
            JOIN users ON items.user_id = users.id 
            ORDER BY items.created_at DESC
        ");
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("✅ Fetched " . count($items) . " items from database");
        echo json_encode($items);
    } catch (Exception $e) {
        error_log("❌ Error fetching items: " . $e->getMessage());
        echo json_encode(["error" => "Failed to fetch items: " . $e->getMessage()]);
    }
    exit;
}

// Get user items
if ($_SERVER['REQUEST_METHOD'] == 'GET' && $_GET['action'] == 'getUserItems') {
    $user_id = $_GET['user_id'] ?? 0;
    
    try {
        $stmt = $pdo->prepare("
            SELECT items.*, users.name as user_name 
            FROM items 
            JOIN users ON items.user_id = users.id 
            WHERE items.user_id = ?
            ORDER BY items.created_at DESC
        ");
        $stmt->execute([$user_id]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("✅ Fetched " . count($items) . " items for user: " . $user_id);
        echo json_encode($items);
    } catch (Exception $e) {
        error_log("❌ Error fetching user items: " . $e->getMessage());
        echo json_encode(["error" => "Failed to fetch user items"]);
    }
    exit;
}

// Get items by type
if ($_SERVER['REQUEST_METHOD'] == 'GET' && $_GET['action'] == 'getItemsByType') {
    $type = $_GET['type'] ?? 'lost';
    
    try {
        $stmt = $pdo->prepare("
            SELECT items.*, users.name as user_name 
            FROM items 
            JOIN users ON items.user_id = users.id 
            WHERE item_type = ?
            ORDER BY items.created_at DESC
        ");
        $stmt->execute([$type]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("✅ Fetched " . count($items) . " items of type: " . $type);
        echo json_encode($items);
    } catch (Exception $e) {
        error_log("❌ Error fetching items by type: " . $e->getMessage());
        echo json_encode(["error" => "Failed to fetch items by type"]);
    }
    exit;
}

// Add new item
if ($_SERVER['REQUEST_METHOD'] == 'POST' && $_GET['action'] == 'addItem') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $contact_phone = isset($data['contact_phone']) ? $data['contact_phone'] : '';
    
    try {
        $stmt = $pdo->prepare("INSERT INTO items (title, description, item_type, category, location, date_lost_found, contact_phone, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data['title'],
            $data['description'],
            $data['item_type'],
            $data['category'],
            $data['location'],
            $data['date_lost_found'],
            $contact_phone,
            $data['user_id']
        ]);
        
        $new_id = $pdo->lastInsertId();
        error_log("✅ Item added successfully with ID: " . $new_id);
        echo json_encode(["success" => true, "id" => $new_id]);
    } catch (Exception $e) {
        error_log("❌ Error adding item: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Failed to add item"]);
    }
    exit;
}

// Delete item
if ($_SERVER['REQUEST_METHOD'] == 'POST' && $_GET['action'] == 'deleteItem') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $stmt = $pdo->prepare("SELECT user_id FROM items WHERE id = ?");
        $stmt->execute([$data['item_id']]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($item && $item['user_id'] == $data['user_id']) {
            $stmt = $pdo->prepare("DELETE FROM items WHERE id = ?");
            $stmt->execute([$data['item_id']]);
            error_log("✅ Item deleted successfully: " . $data['item_id']);
            echo json_encode(["success" => true, "message" => "تم حذف العنصر بنجاح"]);
        } else {
            error_log("❌ Unauthorized delete attempt for item: " . $data['item_id']);
            echo json_encode(["success" => false, "message" => "يمكنك فقط حذف العناصر الخاصة بك"]);
        }
    } catch (Exception $e) {
        error_log("❌ Error deleting item: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Failed to delete item"]);
    }
    exit;
}

// Add claim request
if ($_SERVER['REQUEST_METHOD'] == 'POST' && $_GET['action'] == 'addClaim') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $stmt = $pdo->prepare("INSERT INTO claims (item_id, claimant_id, description, status) VALUES (?, ?, ?, 'pending')");
        $stmt->execute([
            $data['item_id'],
            $data['claimant_id'],
            $data['description']
        ]);
        
        $new_id = $pdo->lastInsertId();
        error_log("✅ Claim added successfully with ID: " . $new_id);
        echo json_encode(["success" => true, "id" => $new_id]);
    } catch (Exception $e) {
        error_log("❌ Error adding claim: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Failed to add claim"]);
    }
    exit;
}

// Register user
if ($_SERVER['REQUEST_METHOD'] == 'POST' && $_GET['action'] == 'register') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingUser) {
            echo json_encode(["success" => false, "message" => "البريد الإلكتروني موجود بالفعل"]);
            exit;
        }
        
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['name'],
            $data['email'],
            password_hash($data['password'], PASSWORD_DEFAULT),
            $data['phone']
        ]);
        
        $new_id = $pdo->lastInsertId();
        error_log("✅ User registered successfully with ID: " . $new_id);
        echo json_encode(["success" => true, "id" => $new_id, "message" => "تم التسجيل بنجاح"]);
    } catch (Exception $e) {
        error_log("❌ Error registering user: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Failed to register"]);
    }
    exit;
}

// Login user
if ($_SERVER['REQUEST_METHOD'] == 'POST' && $_GET['action'] == 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($data['password'], $user['password'])) {
            unset($user['password']);
            error_log("✅ User logged in successfully: " . $user['email']);
            echo json_encode([
                "success" => true, 
                "user" => $user,
                "message" => "تم تسجيل الدخول بنجاح"
            ]);
        } else {
            error_log("❌ Login failed for email: " . $data['email']);
            echo json_encode(["success" => false, "message" => "البريد الإلكتروني أو كلمة المرور غير صحيحة"]);
        }
    } catch (Exception $e) {
        error_log("❌ Error during login: " . $e->getMessage());
        echo json_encode(["success" => false, "message" => "Login error"]);
    }
    exit;
}

// Default response for invalid requests
echo json_encode(["error" => "Invalid request", "available_actions" => [
    "getItems", "getUserItems", "getItemsByType", "addItem", "deleteItem", 
    "addClaim", "register", "login", "requestPasswordReset", "verifyResetCode", 
    "resetPassword", "testEmail"
]]);
?>