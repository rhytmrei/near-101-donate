import React from "react";
import SpinnerImg from "../../assets/img/infinite-spinner.svg";

import { Col, Container, Row } from "react-bootstrap";

const Loader = () => {
  return (
    <Container fluid className="loader">
      <Row className="h-100 justify-content-center align-items-center">
        <Col md={6} className="mx-auto text-center">
          <img src={SpinnerImg} alt="spinner" />
        </Col>
      </Row>
    </Container>
  );
};
export default Loader;
