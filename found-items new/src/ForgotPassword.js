import React, { useState } from "react";
import { Container, Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_BASE = 'http://localhost/api.php';

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request, 2: Verify, 3: Reset
  const [formData, setFormData] = useState({
    email: "",
    reset_code: "",
    new_password: "",
    confirm_password: ""
  });
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Step 1: Request reset code
  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!formData.email) {
      showAlert("Please enter your email address", "warning");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}?action=requestPasswordReset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      });

      const result = await response.json();
      
      if (result.success) {
        showAlert("Reset code sent to your email. Please check your inbox.", "success");
        setStep(2); // انتقل لخطوة التحقق
      } else {
        showAlert(result.message || "Failed to send reset code", "danger");
      }
    } catch (error) {
      console.error('Request reset error:', error);
      showAlert("Network error. Please try again.", "danger");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify reset code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    if (!formData.reset_code) {
      showAlert("Please enter the reset code", "warning");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}?action=verifyResetCode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          reset_code: formData.reset_code
        })
      });

      const result = await response.json();
      
      if (result.success) {
        showAlert("Code verified successfully!", "success");
        setStep(3); // انتقل لخطوة إعادة تعيين الباسوورد
      } else {
        showAlert(result.message || "Invalid reset code", "danger");
      }
    } catch (error) {
      console.error('Verify code error:', error);
      showAlert("Network error. Please try again.", "danger");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      showAlert("Passwords do not match", "danger");
      return;
    }

    if (formData.new_password.length < 6) {
      showAlert("Password must be at least 6 characters", "danger");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}?action=resetPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          reset_code: formData.reset_code,
          new_password: formData.new_password
        })
      });

      const result = await response.json();
      
      if (result.success) {
        showAlert("Password reset successfully! Redirecting to login...", "success");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        showAlert(result.message || "Failed to reset password", "danger");
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showAlert("Network error. Please try again.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <div className="text-center mb-4">
        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
             style={{width: '60px', height: '60px'}}>
          <span className="fs-4">🔒</span>
        </div>
        <h3 className="text-success">Forgot Password?</h3>
        <p className="text-muted">Enter your email to receive a reset code</p>
      </div>

      <Form onSubmit={handleRequestReset}>
        <Form.Group className="mb-4">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your registered email"
            required
          />
        </Form.Group>

        <div className="d-grid gap-2">
          <Button 
            variant="success" 
            type="submit" 
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Sending Code...
              </>
            ) : (
              "Send Reset Code"
            )}
          </Button>
        </div>
      </Form>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="text-center mb-4">
        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
             style={{width: '60px', height: '60px'}}>
          <span className="fs-4">📧</span>
        </div>
        <h3 className="text-success">Check Your Email</h3>
        <p className="text-muted">Enter the 6-digit code sent to {formData.email}</p>
      </div>

      <Form onSubmit={handleVerifyCode}>
        <Form.Group className="mb-4">
          <Form.Label>Reset Code</Form.Label>
          <Form.Control
            type="text"
            name="reset_code"
            value={formData.reset_code}
            onChange={handleChange}
            placeholder="Enter 6-digit code"
            maxLength="6"
            required
          />
          <Form.Text className="text-muted">
            Check your email for the reset code
          </Form.Text>
        </Form.Group>

        <div className="d-grid gap-2">
          <Button 
            variant="success" 
            type="submit" 
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Verifying...
              </>
            ) : (
              "Verify Code"
            )}
          </Button>
        </div>
      </Form>

      <div className="text-center mt-3">
        <Button 
          variant="link" 
          className="p-0 text-muted"
          onClick={() => setStep(1)}
        >
          ← Back to email entry
        </Button>
      </div>
    </>
  );

  const renderStep3 = () => (
    <>
      <div className="text-center mb-4">
        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
             style={{width: '60px', height: '60px'}}>
          <span className="fs-4">🔄</span>
        </div>
        <h3 className="text-success">New Password</h3>
        <p className="text-muted">Create your new password</p>
      </div>

      <Form onSubmit={handleResetPassword}>
        <Form.Group className="mb-3">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            placeholder="Enter new password (min 6 characters)"
            required
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            placeholder="Confirm your new password"
            required
          />
        </Form.Group>

        <div className="d-grid gap-2">
          <Button 
            variant="success" 
            type="submit" 
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </div>
      </Form>

      <div className="text-center mt-3">
        <Button 
          variant="link" 
          className="p-0 text-muted"
          onClick={() => setStep(2)}
        >
          ← Back to code verification
        </Button>
      </div>
    </>
  );

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Row className="w-100">
        <Col md={6} lg={5} className="mx-auto">
          <Card className="shadow">
            <Card.Body className="p-4">
              {alert.show && (
                <Alert variant={alert.type} className="mb-3">
                  {alert.message}
                </Alert>
              )}

              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}

              <div className="text-center mt-4 pt-3 border-top">
                <p className="mb-0">
                  Remember your password?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 text-success"
                    onClick={() => navigate("/login")}
                  >
                    Sign in here
                  </Button>
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Help Card */}
          <Card className="mt-3">
            <Card.Body className="p-3">
              <h6 className="mb-2">💡 Need help?</h6>
              <ul className="list-unstyled small mb-0">
                <li>• Make sure you enter the email you used to register</li>
                <li>• Check your spam folder if you don't see the email</li>
                <li>• The reset code expires in 1 hour</li>
                <li>• Contact support if you continue having issues</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotPassword;
