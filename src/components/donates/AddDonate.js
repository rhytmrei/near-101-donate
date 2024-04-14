import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";

const AddDonate = ({ save }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image_src, setImageSrc] = useState("");
  const [status, setStatus] = useState(1);
  const [amount, setAmount] = useState("");

  const author = window.walletConnection.getAccountId();

  const isFormFilled = () => description && status && amount && name;

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button
        onClick={handleShow}
        variant="dark"
        className="rounded-pill px-0"
        style={{ width: "38px" }}
      >
        <i className="bi bi-plus"></i>
      </Button>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Donate Post</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            <FloatingLabel controlId="NameInput" label="Name" className="mb-3">
              <Form.Control
                type="text"
                defaultValue={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder="Enter name of the post"
              ></Form.Control>
            </FloatingLabel>

            <FloatingLabel
              controlId="DescriptionInput"
              label="Description"
              className="mb-3"
            >
              <Form.Control
                type="text"
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
                placeholder="Enter description of the post"
              />
            </FloatingLabel>

            <FloatingLabel
              controlId="ImageInput"
              label="Image Src"
              className="mb-3"
            >
              <Form.Control
                type="text"
                onChange={(e) => {
                  setImageSrc(e.target.value);
                }}
                placeholder="Enter description of the post"
              />
            </FloatingLabel>

            <FloatingLabel
              controlId="StatusInput"
              label="Status"
              className="mb-3"
            >
              <Form.Control
                as="select"
                defaultValue={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                }}
                placeholder="Enter description of the post"
              >
                <option value={1}>Active</option>
                <option value={2}>Disabled</option>
              </Form.Control>
            </FloatingLabel>

            <FloatingLabel
              controlId="AmountInput"
              label="Amount"
              className="mb-3"
            >
              <Form.Control
                type="number"
                min={1}
                required
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
                placeholder="Enter description of the post"
              />
            </FloatingLabel>
          </Modal.Body>
        </Form>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="dark"
            disabled={!isFormFilled()}
            onClick={() => {
              save({
                name,
                author,
                image_src,
                description,
                amount,
                status,
              });
              handleClose();
            }}
          >
            Save post
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

AddDonate.propTypes = {
  save: PropTypes.func.isRequired,
};

export default AddDonate;
