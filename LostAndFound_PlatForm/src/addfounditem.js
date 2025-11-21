import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Button, Alert, Card, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_BASE = 'http://localhost/api.php';

function AddFoundItem() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    item_type: "found",
    category: "",
    location: "",
    date_lost_found: "",
    user_id: 1 // افتراضي
  });

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.title.trim() || !formData.category || !formData.location || !formData.date_lost_found) {
      showAlert("Please fill in all required fields", "warning");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}?action=addItem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        showAlert("Item added successfully!", "success");
        
        // Reset form
        setFormData({
          title: "",
          description: "",
          item_type: "found",
          category: "",
          location: "",
          date_lost_found: "",
          user_id: 1
        });

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/found-items");
        }, 2000);
      } else {
        showAlert("Error adding item. Please try again.", "danger");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showAlert("Network error. Please check your connection.", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <Card className="shadow">
            <Card.Header className="bg-success text-white text-center">
              <h4 className="mb-0">Add Found Item</h4>
              <small>Help reunite lost items with their owners</small>
            </Card.Header>
            
            <Card.Body className="p-4">
              {alert.show && (
                <Alert variant={alert.type} className="mb-4">
                  {alert.message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                {/* Item Title */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Item Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Black Wallet, iPhone 13, Blue Backpack"
                    className="py-2"
                    required
                  />
                  <Form.Text className="text-muted">
                    Be specific about the item's appearance
                  </Form.Text>
                </Form.Group>

                {/* Category */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Category *</Form.Label>
                  <Form.Select 
                    name="category" 
                    value={formData.category}
                    onChange={handleChange}
                    className="py-2"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">📱 Electronics</option>
                    <option value="Documents">📄 Documents</option>
                    <option value="Keys">🔑 Keys</option>
                    <option value="Wallet">👛 Wallet/Purse</option>
                    <option value="Bags">🎒 Bags/Backpacks</option>
                    <option value="Jewelry">💍 Jewelry</option>
                    <option value="Clothing">👕 Clothing</option>
                    <option value="Books">📚 Books</option>
                    <option value="Toys">🧸 Toys</option>
                    <option value="Other">❓ Other</option>
                  </Form.Select>
                </Form.Group>

                {/* Location */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Location Found *</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Cairo Mall, Nasr City Street 15, University Campus"
                    className="py-2"
                    required
                  />
                  <Form.Text className="text-muted">
                    Where did you find this item?
                  </Form.Text>
                </Form.Group>

                {/* Date Found */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Date Found *</Form.Label>
                  <Form.Control
                    type="date"
                    name="date_lost_found"
                    value={formData.date_lost_found}
                    onChange={handleChange}
                    className="py-2"
                    required
                  />
                </Form.Group>

                {/* Description */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the item in detail. Include color, brand, contents, condition, and any identifying features..."
                    className="py-2"
                  />
                  <Form.Text className="text-muted">
                    Detailed descriptions help owners identify their items
                  </Form.Text>
                </Form.Group>

                {/* Buttons */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate("/found-items")}
                    className="me-md-2"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="success" 
                    type="submit" 
                    size="lg"
                    disabled={loading}
                    className="px-4"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Adding Item...
                      </>
                    ) : (
                      "Add Found Item"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Tips Card */}
          <Card className="mt-4">
            <Card.Header className="bg-light">
              <h6 className="mb-0">💡 Tips for Adding Found Items</h6>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled mb-0">
                <li>• Be specific about the item's appearance and condition</li>
                <li>• Mention exact location where you found it</li>
                <li>• Include brand names, colors, and unique features</li>
                <li>• Don't share sensitive personal information from the item</li>
                <li>• Keep the item safe until claimed by the owner</li>
              </ul>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}

export default AddFoundItem;