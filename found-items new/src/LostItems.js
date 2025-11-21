import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form, Card, Alert, Navbar, Nav, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_BASE = 'http://localhost/api.php';

function LostItems({ user, onLogout }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [contactItem, setContactItem] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    item_type: "lost",
    category: "",
    location: "",
    date_lost_found: "",
    contact_phone: user?.phone || "",
    user_id: user?.id || 1
  });

  // Update formData when user changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      contact_phone: user?.phone || "",
      user_id: user?.id || 1
    }));
  }, [user]);

  useEffect(() => {
    if (user) {
      loadItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}?action=getItemsByType&type=lost`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Error loading items:', error);
      showAlert("Error loading items", "danger");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

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
    
    if (!user) {
      showAlert("Please login to add items", "warning");
      return;
    }
    
    try {
      const submitData = {
        ...formData,
        user_id: user.id
      };

      const response = await fetch(`${API_BASE}?action=addItem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      const result = await response.json();
      
      if (result.success) {
        showAlert("Lost item reported successfully!", "success");
        setFormData({
          title: "",
          description: "",
          item_type: "lost",
          category: "",
          location: "",
          date_lost_found: "",
          contact_phone: user?.phone || "",
          user_id: user?.id || 1
        });
        setShowAddItemModal(false);
        loadItems();
      } else {
        showAlert("Error reporting lost item", "danger");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showAlert("Error reporting lost item", "danger");
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const handleHide = () => {
    setShowDetails(false);
    setSelectedItem(null);
  };

  const handleContact = (item) => {
    setContactItem(item);
    setShowContactModal(true);
  };

  const handleCall = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = (phoneNumber, itemTitle) => {
    const message = `Hello! I think I found your lost item "${itemTitle}". Can we talk about it?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`${API_BASE}?action=deleteItem`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item_id: item.id,
            user_id: user?.id || 1
          })
        });

        const result = await response.json();
        
        if (result.success) {
          showAlert("Item deleted successfully!", "success");
          loadItems();
        } else {
          showAlert(result.message || "Error deleting item", "danger");
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        showAlert("Error deleting item", "danger");
      }
    }
  };

  // Function علشان تشوف إذا اليوزر الحالي هو اللي أنشأ الـ item
  const isCurrentUserOwner = (item) => {
    return item.user_id === (user?.id || 1);
  };

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(items.map(item => item.category))];

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading lost items...</p>
      </div>
    );
  }

  // إذا اليوزر مش عامل login
  if (!user) {
    return (
      <div>
        {/* Navigation Bar */}
        <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand className="fw-bold">
              🎯 Found & Lost Platform
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link onClick={() => navigate("/")} className="text-light">
                  🏠 Home
                </Nav.Link>
                <Nav.Link onClick={() => navigate("/found-items")} className="text-light">
                  📍 Found Items
                </Nav.Link>
                <Nav.Link className="fw-bold text-white">
                  🔍 Lost Items
                </Nav.Link>
              </Nav>
              <Nav>
                <Button 
                  variant="outline-light" 
                  size="sm" 
                  onClick={() => navigate("/login")}
                  className="me-2"
                >
                  🔑 Login
                </Button>
                <Button 
                  variant="light" 
                  size="sm" 
                  onClick={() => navigate("/register")}
                >
                  📝 Register
                </Button>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container>
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 text-center">
              <div className="py-5">
                <div className="mb-4" style={{fontSize: '4rem'}}>🔒</div>
                <h2 className="text-primary mb-3">Login Required</h2>
                <p className="text-muted mb-4">
                  Please login to view lost items and help reunite people with their belongings.
                </p>
                <div className="d-grid gap-3 d-md-flex justify-content-md-center">
                  <Button 
                    variant="primary" 
                    onClick={() => navigate("/login")}
                    size="lg"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none'
                    }}
                  >
                    🔑 Login Now
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => navigate("/register")}
                    size="lg"
                  >
                    📝 Create Account
                  </Button>
                </div>
                
                <div className="mt-5 p-4 bg-light rounded border-0">
                  <h5 className="text-dark mb-3">💡 Why Login?</h5>
                  <div className="row text-start">
                    <div className="col-md-6">
                      <p className="mb-2">✅ View all lost items</p>
                      <p className="mb-2">✅ Contact item owners</p>
                      <p className="mb-2">✅ Report your lost items</p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-2">✅ Manage your posts</p>
                      <p className="mb-2">✅ Get notifications</p>
                      <p className="mb-2">✅ Help your community</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation Bar */}
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand className="fw-bold">
            🎯 Found & Lost Platform
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => navigate("/")} className="text-light">
                🏠 Home
              </Nav.Link>
              <Nav.Link onClick={() => navigate("/found-items")} className="text-light">
                📍 Found Items
              </Nav.Link>
              <Nav.Link className="fw-bold text-white">
                🔍 Lost Items
              </Nav.Link>
            </Nav>
            <Nav>
              <Navbar.Text className="me-3">
                👋 Welcome, <strong>{user.name}</strong>
              </Navbar.Text>
              <Button 
                variant="outline-light" 
                size="sm" 
                onClick={onLogout}
                className="me-2"
              >
                🚪 Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-primary mb-1">Lost Items</h2>
            <p className="text-muted">Report your lost items and find them faster</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setShowAddItemModal(true)}
            size="lg"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            ➕ Report Lost Item
          </Button>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body className="bg-light">
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Label className="fw-bold text-dark">Search Items</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 shadow-sm"
                />
              </div>
              <div className="col-md-4">
                <Form.Label className="fw-bold text-dark">Filter by Category</Form.Label>
                <Form.Select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border-0 shadow-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => {
                    setSearchTerm("");
                    setFilterCategory("");
                  }}
                  className="border-0"
                >
                  Clear
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Alert */}
        {alert.show && (
          <Alert variant={alert.type} className="mb-4 border-0 shadow-sm">
            {alert.message}
          </Alert>
        )}

        {/* User Stats */}
        <div className="row mb-4">
          <div className="col-md-4">
            <Card className="text-center border-0 shadow-sm" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <Card.Body>
                <h4 className="mb-0">{items.filter(item => item.user_id === user.id).length}</h4>
                <p className="mb-0 small opacity-75">Your Lost Items</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4">
            <Card className="text-center border-0 shadow-sm" style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white'
            }}>
              <Card.Body>
                <h4 className="mb-0">{filteredItems.length}</h4>
                <p className="mb-0 small opacity-75">Filtered Items</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4">
            <Card className="text-center border-0 shadow-sm bg-light">
              <Card.Body>
                <Button 
                  variant="outline-primary" 
                  onClick={loadItems}
                  className="w-100 border-0"
                >
                  🔄 Refresh
                </Button>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Items Grid View */}
        <div className="row">
          {filteredItems.length === 0 ? (
            <div className="col-12 text-center py-5">
              <div className="text-muted">
                <div className="mb-3" style={{fontSize: '3rem'}}>🔍</div>
                <h5 className="text-dark">No lost items found</h5>
                <p className="text-muted">Try adjusting your search or report a new lost item</p>
                <Button 
                  variant="primary" 
                  onClick={() => setShowAddItemModal(true)}
                  className="mt-2"
                >
                  Report Your First Item
                </Button>
              </div>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="col-md-6 col-lg-4 mb-4">
                <Card 
                  className="h-100 shadow-sm border-0" 
                  style={{
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className={`badge ${
                        item.category === 'Electronics' ? 'bg-primary' :
                        item.category === 'Documents' ? 'bg-info' :
                        item.category === 'Keys' ? 'bg-warning text-dark' :
                        item.category === 'Wallet' ? 'bg-success' :
                        'bg-secondary'
                      } border-0`}>
                        {item.category}
                      </span>
                      <div>
                        <span className={`badge ${
                          item.status === 'open' ? 'bg-primary' : 
                          item.status === 'resolved' ? 'bg-success' : 'bg-secondary'
                        } me-1 border-0`}>
                          {item.status}
                        </span>
                        {isCurrentUserOwner(item) && (
                          <span className="badge bg-light text-dark border">Your Item</span>
                        )}
                      </div>
                    </div>
                    
                    <Card.Title className="text-dark mb-2">{item.title}</Card.Title>
                    
                    {item.description && (
                      <Card.Text className="text-muted small flex-grow-1">
                        {item.description.length > 100 
                          ? `${item.description.substring(0, 100)}...` 
                          : item.description
                        }
                      </Card.Text>
                    )}
                    
                    <div className="mt-auto">
                      <div className="mb-3">
                        <p className="mb-1 small text-dark">
                          <strong>📍 Location Lost:</strong> {item.location}
                        </p>
                        <p className="mb-1 small text-dark">
                          <strong>📅 Date Lost:</strong> {item.date_lost_found}
                        </p>
                        <p className="mb-3 small text-dark">
                          <strong>👤 Reported by:</strong> 
                          {isCurrentUserOwner(item) ? " You" : ` ${item.user_name}`}
                        </p>
                      </div>

                      <div className="d-grid gap-2">
                        <Button
                          variant="outline-primary"
                          onClick={() => handleView(item)}
                          className="border-0"
                        >
                          👁 View Details
                        </Button>
                        <Button 
                          variant="primary"
                          onClick={() => handleContact(item)}
                          disabled={isCurrentUserOwner(item)}
                          className="border-0"
                        >
                          {isCurrentUserOwner(item) ? "📞 Your Item" : "📞 Contact Owner"}
                        </Button>
                        
                        {/* زر الحذف - بيظهر بس لليوزر اللي أنشأ الـ item */}
                        {isCurrentUserOwner(item) && (
                          <Button 
                            variant="outline-danger"
                            onClick={() => handleDelete(item)}
                            className="mt-2 border-0"
                          >
                            🗑 Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))
          )}
        </div>

        {/* باقي الـ Modals بنفس الطريقة */}
        {/* Add Item Modal */}
        <Modal show={showAddItemModal} onHide={() => setShowAddItemModal(false)} centered size="lg">
          <Modal.Header closeButton className="border-0 bg-light">
            <Modal.Title className="text-dark">Report Lost Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="text-dark">Item Title *</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Black Wallet, iPhone 13, etc."
                  required
                  className="border-0 shadow-sm bg-light"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-dark">Category *</Form.Label>
                <Form.Select 
                  name="category" 
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="border-0 shadow-sm bg-light"
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Documents">Documents</option>
                  <option value="Keys">Keys</option>
                  <option value="Wallet">Wallet</option>
                  <option value="Bags">Bags</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-dark">Location Lost *</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Cairo Mall, Nasr City, etc."
                  required
                  className="border-0 shadow-sm bg-light"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-dark">Date Lost *</Form.Label>
                <Form.Control
                  type="date"
                  name="date_lost_found"
                  value={formData.date_lost_found}
                  onChange={handleChange}
                  required
                  className="border-0 shadow-sm bg-light"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-dark">Contact Phone *</Form.Label>
                <Form.Control
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="e.g., 01012345678"
                  required
                  className="border-0 shadow-sm bg-light"
                />
                <Form.Text className="text-muted">
                  This number will be shown to people who found your item
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-dark">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the item in detail, including any identifying features..."
                  className="border-0 shadow-sm bg-light"
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button variant="primary" type="submit" size="lg" className="border-0">
                  Report Lost Item
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* باقي الـ Modals */}
      </Container>
    </div>
  );
}

export default LostItems;