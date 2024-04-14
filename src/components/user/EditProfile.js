import React, { useLayoutEffect, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";
import { setUser } from "../../utils/user";

import Loader from "../utils/Loader";

import { NotificationSuccess, NotificationError } from "../utils/Notifications";

const EditProfile = ({ userData, account, callback }) => {
  const [loading, setLoading] = useState(false);

  const [image_src, setImageSrc] = useState("");

  const [description, setDescription] = useState("");

  const saveUser = async () => {
    setLoading(true);
    try {
      await setUser({
        account,
        image_src,
        description,
      }).then((resp) => {
        callback();
      });
      toast(<NotificationSuccess text="Profile updated successfully." />);
    } catch (error) {
      console.log(error);
      toast(
        <NotificationError text="Failed to update info, check the console." />
      );
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    setImageSrc(userData.image_src);

    setDescription(userData.description);
  }, [userData]);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      {!loading ? (
        <>
          <Button variant="dark" size="sm" onClick={handleShow} className="m-2">
            Edit Profile
          </Button>

          <Modal show={show} onHide={handleClose} centered>
            <Form>
              <Modal.Body>
                <FloatingLabel
                  controlId="image_src"
                  label="Image src"
                  className="mb-3"
                >
                  <Form.Control
                    type="text"
                    onChange={(e) => {
                      setImageSrc(e.target.value);
                    }}
                    defaultValue={image_src}
                    placeholder="Enter image src"
                  />
                </FloatingLabel>

                <FloatingLabel
                  controlId="description"
                  label="Description"
                  className="mb-3"
                >
                  <Form.Control
                    type="text"
                    onChange={(e) => {
                      setDescription(e.target.value);
                    }}
                    defaultValue={description}
                    placeholder="Enter Description"
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
                onClick={() => {
                  saveUser();
                  handleClose();
                }}
              >
                Save profile
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
};

EditProfile.propTypes = {
  userData: PropTypes.instanceOf(Object).isRequired,
  account: PropTypes.string.isRequired,
  callback: PropTypes.func.isRequired,
};

export default EditProfile;
