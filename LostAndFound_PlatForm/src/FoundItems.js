import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Form, Card, Alert, Navbar, Nav, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const API_BASE = 'http://localhost/api.php';

function FoundItems({ user, onLogout }) {
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
    item_type: "found",
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
      const response = await fetch(`${API_BASE}?action=getItemsByType&type=found`);
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
        showAlert("Item added successfully!", "success");
        setFormData({
          title: "",
          description: "",
          item_type: "found",
          category: "",
          location: "",
          date_lost_found: "",
          contact_phone: user?.phone || "",
          user_id: user?.id || 1
        });
        setShowAddItemModal(false);
        loadItems();
      } else {
        showAlert("Error adding item", "danger");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showAlert("Error adding item", "danger");
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
    const message = `Hello! I saw your found item "${itemTitle}" and I think it might be mine. Can we talk about it?`;
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
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading found items...</p>
      </div>
    );
  }

  // إذا اليوزر مش عامل login
  if (!user) {
    return (
      <div>
        {/* Navigation Bar */}
        <Navbar bg="success" variant="dark" expand="lg" className="mb-4">
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
                <Nav.Link className="fw-bold text-white">
                  📍 Found Items
                </Nav.Link>
                <Nav.Link onClick={() => navigate("/lost-items")} className="text-light">
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
                <h2 className="text-success mb-3">Login Required</h2>
                <p className="text-muted mb-4">
                  Please login to view found items and help reunite people with their belongings.
                </p>
                <div className="d-grid gap-3 d-md-flex justify-content-md-center">
                  <Button 
                    variant="success" 
                    onClick={() => navigate("/login")}
                    size="lg"
                  >
                    🔑 Login Now
                  </Button>
                  <Button 
                    variant="outline-success" 
                    onClick={() => navigate("/register")}
                    size="lg"
                  >
                    📝 Create Account
                  </Button>
                </div>
                
                <div className="mt-5 p-4 bg-light rounded">
                  <h5 className="text-dark mb-3">💡 Why Login?</h5>
                  <div className="row text-start">
                    <div className="col-md-6">
                      <p className="mb-2">✅ View all found items</p>
                      <p className="mb-2">✅ Contact item finders</p>
                      <p className="mb-2">✅ Report your found items</p>
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
      <Navbar bg="success" variant="dark" expand="lg" className="mb-4">
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
              <Nav.Link className="fw-bold text-white">
                📍 Found Items
              </Nav.Link>
              <Nav.Link onClick={() => navigate("/lost-items")} className="text-light">
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
            <h2 className="fw-bold text-success mb-1">Found Items</h2>
            <p className="text-muted">Help reunite lost items with their owners</p>
          </div>
          <Button 
            variant="success" 
            onClick={() => setShowAddItemModal(true)}
            size="lg"
          >
            ➕ Add Found Item
          </Button>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-4">
          <Card.Body>
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Label className="fw-bold">Search Items</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <Form.Label className="fw-bold">Filter by Category</Form.Label>
                <Form.Select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
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
                >
                  Clear
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Alert */}
        {alert.show && (
          <Alert variant={alert.type} className="mb-4">
            {alert.message}
          </Alert>
        )}

        {/* User Stats */}
        <div className="row mb-4">
          <div className="col-md-4">
            <Card className="text-center border-0 bg-light">
              <Card.Body>
                <h4 className="text-success">{items.filter(item => item.user_id === user.id).length}</h4>
                <p className="mb-0 small">Your Posted Items</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4">
            <Card className="text-center border-0 bg-light">
              <Card.Body>
                <h4 className="text-primary">{filteredItems.length}</h4>
                <p className="mb-0 small">Filtered Items</p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4">
            <Card className="text-center border-0 bg-light">
              <Card.Body>
                <Button 
                  variant="outline-success" 
                  onClick={loadItems}
                  className="w-100"
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
                <h5>No found items found</h5>
                <p>Try adjusting your search or add a new found item</p>
                <Button 
                  variant="success" 
                  onClick={() => setShowAddItemModal(true)}
                >
                  Add Your First Item
                </Button>
              </div>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="col-md-6 col-lg-4 mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className={`badge ${
                        item.category === 'Electronics' ? 'bg-primary' :
                        item.category === 'Documents' ? 'bg-info' :
                        item.category === 'Keys' ? 'bg-warning' :
                        item.category === 'Wallet' ? 'bg-success' :
                        'bg-secondary'
                      }`}>
                        {item.category}
                      </span>
                      <div>
                        <span className={`badge ${
                          item.status === 'open' ? 'bg-success' : 
                          item.status === 'resolved' ? 'bg-primary' : 'bg-secondary'
                        } me-1`}>
                          {item.status}
                        </span>
                        {isCurrentUserOwner(item) && (
                          <span className="badge bg-warning">Your Item</span>
                        )}
                      </div>
                    </div>
                    
                    <Card.Title className="text-primary">{item.title}</Card.Title>
                    
                    {item.description && (
                      <Card.Text className="text-muted small">
                        {item.description.length > 100 
                          ? `${item.description.substring(0, 100)}...` 
                          : item.description
                        }
                      </Card.Text>
                    )}
                    
                    <div className="mt-3">
                      <p className="mb-1"><strong>📍 Location:</strong> {item.location}</p>
                      <p className="mb-1"><strong>📅 Date Found:</strong> {item.date_lost_found}</p>
                      <p className="mb-3">
                        <strong>👤 Posted by:</strong> 
                        {isCurrentUserOwner(item) ? " You" : ` ${item.user_name}`}
                      </p>
                    </div>

                    <div className="d-grid gap-2">
                      <Button
                        variant="outline-primary"
                        onClick={() => handleView(item)}
                      >
                        👁 View Details
                      </Button>
                      <Button 
                        variant="success"
                        onClick={() => handleContact(item)}
                        disabled={isCurrentUserOwner(item)}
                      >
                        {isCurrentUserOwner(item) ? "📞 Your Item" : "📞 Contact Finder"}
                      </Button>
                      
                      {/* زر الحذف - بيظهر بس لليوزر اللي أنشأ الـ item */}
                      {isCurrentUserOwner(item) && (
                        <Button 
                          variant="danger"
                          onClick={() => handleDelete(item)}
                          className="mt-2"
                        >
                          🗑 Delete
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))
          )}
        </div>

        {/* Add Item Modal */}
        <Modal show={showAddItemModal} onHide={() => setShowAddItemModal(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Add Found Item</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Item Title *</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Black Wallet, iPhone 13, etc."
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Category *</Form.Label>
                <Form.Select 
                  name="category" 
                  value={formData.category}
                  onChange={handleChange}
                  required
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
                <Form.Label>Location Found *</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Cairo Mall, Nasr City, etc."
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Date Found *</Form.Label>
                <Form.Control
                  type="date"
                  name="date_lost_found"
                  value={formData.date_lost_found}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contact Phone *</Form.Label>
                <Form.Control
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="e.g., 01012345678"
                  required
                />
                <Form.Text className="text-muted">
                  This number will be shown to people who want to claim the item
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the item in detail..."
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button variant="success" type="submit" size="lg">
                  Save Found Item
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Item Details Modal */}
        <Modal show={showDetails} onHide={handleHide} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Item Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedItem && (
              <div className="row">
                <div className="col-12">
                  <h4 className="text-success mb-3">{selectedItem.title}</h4>
                  
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p><strong>Category:</strong> {selectedItem.category}</p>
                      <p><strong>Location:</strong> {selectedItem.location}</p>
                      <p><strong>Date Found:</strong> {selectedItem.date_lost_found}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Posted by:</strong> {isCurrentUserOwner(selectedItem) ? "You" : selectedItem.user_name}</p>
                      <p><strong>Status:</strong> 
                        <span className={`badge ${
                          selectedItem.status === 'open' ? 'bg-success' : 
                          selectedItem.status === 'resolved' ? 'bg-primary' : 'bg-secondary'
                        } ms-2`}>
                          {selectedItem.status}
                        </span>
                      </p>
                      <p><strong>Posted on:</strong> {selectedItem.created_at}</p>
                    </div>
                  </div>

                  {selectedItem.description && (
                    <div className="mb-4">
                      <strong>Description:</strong>
                      <div className="mt-2 p-3 bg-light rounded">
                        {selectedItem.description}
                      </div>
                    </div>
                  )}
                  
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <Button variant="secondary" onClick={handleHide}>
                      Close
                    </Button>
                    {!isCurrentUserOwner(selectedItem) && (
                      <Button variant="success" onClick={() => handleContact(selectedItem)}>
                        📞 Contact Finder
                      </Button>
                    )}
                    
                    {/* زر الحذف في الـ Details Modal */}
                    {isCurrentUserOwner(selectedItem) && (
                      <Button variant="danger" onClick={() => handleDelete(selectedItem)}>
                        🗑 Delete Item
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>

        {/* Contact Modal */}
        <Modal show={showContactModal} onHide={() => setShowContactModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Contact Finder</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {contactItem && (
              <>
                <div className="text-center mb-4">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{width: '80px', height: '80px'}}>
                    <span className="fs-1">📞</span>
                  </div>
                  <h5 className="text-success">{contactItem.title}</h5>
                  <p className="text-muted">Contact the person who found this item</p>
                </div>

                <div className="text-center mb-4">
                  <h4 className="text-primary mb-2">
                    {contactItem.contact_phone || contactItem.phone || '01000000000'}
                  </h4>
                  <p className="text-muted small">Phone Number</p>
                </div>

                <div className="d-grid gap-2">
                  <Button 
                    variant="success" 
                    size="lg"
                    onClick={() => handleCall(contactItem.contact_phone || contactItem.phone || '01000000000')}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <span className="me-2">📞</span>
                    Call Now
                  </Button>
                  
                  <Button 
                    variant="outline-success" 
                    size="lg"
                    onClick={() => handleWhatsApp(
                      contactItem.contact_phone || contactItem.phone || '01000000000', 
                      contactItem.title
                    )}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <span className="me-2">💬</span>
                    WhatsApp Message
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-light rounded">
                  <h6>💡 Tips for Contacting:</h6>
                  <ul className="small mb-0">
                    <li>Be polite and describe the item clearly</li>
                    <li>Mention when and where you lost it</li>
                    <li>Ask about identifying features</li>
                    <li>Arrange a safe meeting place</li>
                  </ul>
                </div>
              </>
            )}
          </Modal.Body>
        </Modal>
      </Container>
    </div>
  );
}

export default FoundItems;