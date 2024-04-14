import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Row,
  Col,
  Stack,
  Modal,
  Form,
  FloatingLabel,
  Button,
} from "react-bootstrap";
import { getUser } from "../../utils/user";
import EditProfile from "./EditProfile";
import { getAccountId } from "../../utils/near";
import { useParams } from "react-router-dom";
import Loader from "../utils/Loader";

import { NotificationSuccess, NotificationError } from "../utils/Notifications";

import {
  getDonate,
  getDonates as getDonatesList,
  updateDonate,
} from "../../utils/donate";
import DonatePost from "../donates/DonatePost";

const Profile = () => {
  const [userData, setUserData] = useState([]);

  const [donates, setDonates] = useState([]);

  const [loading, setLoading] = useState(false);

  const { address } = useParams();

  const account = getAccountId();

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  const [editPost, setEditPost] = useState("");

  const showEdit = async (id) => {
    setShow(true);

    try {
      const d = await getDonate(id);

      setEditData({
        name: d.name,
        description: d.description,
        image_src: d.image_src,
        status: d.status,
      });

      setEditPost(d);
    } catch (error) {
      console.log({ error });
    }
  };

  const getDonates = useCallback(async () => {
    try {
      const d = await getDonatesList();

      let temp = [];

      d.forEach((element) => {
        if (element.author === address) temp.push(element);
      });

      setDonates(temp);
    } catch (error) {
      console.log({ error });
    }
  }, []);

  const getUserData = useCallback(async () => {
    setLoading(true);

    const unknown = {
      account: address,
      image_src: "https://i.imgur.com/S2IRHcz.png",
      description: "",
    };

    let data = (await getUser(address)) ?? [];

    try {
      setUserData({ ...unknown, ...data });
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, [address]);

  const [editData, setEditData] = useState({
    name: "",
    description: "",
    image_src: "",
    status: 1,
  });

  const updatePost = async () => {
    try {
      updateDonate({ ...editPost, ...editData }).then((resp) => {
        getDonates();
      });
      toast(<NotificationSuccess text="Donate post updated successfully." />);
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to update a post." />);
    }
  };

  useEffect(() => {
    getUserData();

    getDonates();
  }, [getUserData]);

  return (
    <>
      {!loading ? (
        <>
          <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
              <Modal.Title>Edit donate post</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <FloatingLabel
                  controlId="NameInput"
                  label="Name"
                  className="mb-3"
                >
                  <Form.Control
                    type="text"
                    defaultValue={editData.name}
                    onChange={(e) => {
                      setEditData({ ...editData, name: e.target.value });
                    }}
                    placeholder="Enter name of the post"
                  />
                </FloatingLabel>

                <FloatingLabel
                  controlId="DescriptionInput"
                  label="Description"
                  className="mb-3"
                >
                  <Form.Control
                    type="text"
                    defaultValue={editData.description}
                    onChange={(e) => {
                      setEditData({ ...editData, description: e.target.value });
                    }}
                    placeholder="Enter description of the post"
                  />
                </FloatingLabel>

                <FloatingLabel
                  controlId="ImageSrcInput"
                  label="Image Src"
                  className="mb-3"
                >
                  <Form.Control
                    type="text"
                    defaultValue={editData.image_src}
                    onChange={(e) => {
                      setEditData({ ...editData, image_src: e.target.value });
                    }}
                    placeholder="Enter image of the post"
                  />
                </FloatingLabel>

                <FloatingLabel
                  controlId="StatusInput"
                  label="Status"
                  className="mb-3"
                >
                  <Form.Control
                    as="select"
                    defaultValue={editData.status}
                    onChange={(e) => {
                      setEditData({ ...editData, status: e.target.value });
                    }}
                    placeholder="Enter description of the post"
                  >
                    <option value={1}>Active</option>
                    <option value={2}>Disabled</option>
                  </Form.Control>
                </FloatingLabel>

                <Modal.Footer>
                  <Button variant="outline-secondary" onClick={handleClose}>
                    Close
                  </Button>
                  <Button
                    variant="dark"
                    onClick={() => {
                      updatePost();
                      handleClose();
                    }}
                  >
                    Update post
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal.Body>
          </Modal>
          <Stack
            direction="horizontal"
            gap={2}
            className="justify-content-center mb-4"
          >
            <i className="bi bi-person-circle fs-4" />
            <a
              href={`https://explorer.testnet.near.org/accounts/${address}`}
              rel="noreferrer"
              target="_blank"
            >
              <span className="font-monospace">{address}</span>
            </a>
          </Stack>
          <Row className="mt-2 mb-2">
            <Col md={4} className="text-center">
              <img
                alt={userData.account}
                src={userData.image_src}
                style={{ maxWidth: "100%" }}
              />
              <br />
              {address === account && (
                <EditProfile
                  userData={userData}
                  account={account}
                  callback={getUserData}
                />
              )}
            </Col>
            <Col md={8}>{userData.description || "Empty Description"}</Col>
          </Row>
          <Stack
            direction="horizontal"
            gap={2}
            className="justify-content-center mt-2"
          >
            <span className="font-monospace">Donate Posts</span>
          </Stack>

          <Row xs={1} sm={3} lg={3} className="g-3 mb-5 mt-2">
            {donates
              .map((_donate) => {
                return (
                  <DonatePost
                    donate={{
                      ..._donate,
                    }}
                    editcallback={showEdit}
                    key={_donate.id}
                  />
                );
              })
              .reverse()}
          </Row>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Profile;
