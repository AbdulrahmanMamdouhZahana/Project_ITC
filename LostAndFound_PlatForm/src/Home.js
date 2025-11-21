
import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function Home({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav className="navbar navbar-dark">
        <Container>
          <span className="navbar-brand mb-0 h1">🎯 Found & Lost Platform</span>
          <div>
            {user ? (
              <div className="d-flex align-items-center">
                <span className="text-light me-3">Welcome, {user.name}</span>
                <Button variant="outline-light" size="sm" onClick={onLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div>
                <Button variant="outline-light" size="sm" className="me-2" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button variant="light" size="sm" onClick={() => navigate("/register")}>
                  Register
                </Button>
              </div>
            )}
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <Container className="py-5 text-center text-white">
        <Row className="py-5">
          <Col>
            <h1 className="display-4 fw-bold mb-4">Welcome to Found & Lost Platform</h1>
            <p className="lead mb-5">Helping people reunite with their lost belongings</p>
            
            <Row className="g-4 justify-content-center">
              <Col md={6} lg={4}>
                <Card className="h-100 shadow border-0">
                  <Card.Body className="p-4 text-center">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{width: '80px', height: '80px'}}>
                      <span className="fs-1">📍</span>
                    </div>
                    <Card.Title className="text-success">Found Something?</Card.Title>
                    <Card.Text>
                      Report items you've found and help return them to their owners
                    </Card.Text>
                    <Button 
                      variant="success" 
                      size="lg" 
                      onClick={() => navigate("/found-items")}
                      className="w-100"
                    >
                      Browse Found Items
                    </Button>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6} lg={4}>
                <Card className="h-100 shadow border-0">
                  <Card.Body className="p-4 text-center">
                    <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{width: '80px', height: '80px'}}>
                      <span className="fs-1">🔍</span>
                    </div>
                    <Card.Title className="text-warning">Lost Something?</Card.Title>
                    <Card.Text>
                      Report your lost items and search through found items
                    </Card.Text>
                    <Button 
                      variant="warning" 
                      size="lg" 
                      onClick={() => navigate("/lost-items")}
                      className="w-100"
                    >
                      Browse Lost Items
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Stats Section */}
            <Row className="mt-5 pt-5">
              <Col md={4}>
                <div className="text-white">
                  <h3 className="fw-bold">1000+</h3>
                  <p className="mb-0">Items Reunited</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-white">
                  <h3 className="fw-bold">500+</h3>
                  <p className="mb-0">Happy Users</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-white">
                  <h3 className="fw-bold">24/7</h3>
                  <p className="mb-0">Active Platform</p>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Home;