import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  PostStatus,
  addHistory,
  convertTimeStamp,
  formatDonations,
  getDonate,
  getHistory,
  getTotalDonated,
} from "../../../utils/donate";
import { toast } from "react-toastify";

import Loader from "../../utils/Loader";
import {
  Card,
  Col,
  Form,
  Row,
  Button,
  ProgressBar,
  ListGroup,
} from "react-bootstrap";

import {
  NotificationSuccess,
  NotificationError,
} from "../../utils/Notifications";
import NotFoundImage from "../../../assets/img/notfound.jpeg";
import { formatNearAmount } from "near-api-js/lib/utils/format";
import { getAccountId } from "../../../utils/near";

const Donate = () => {
  const { id } = useParams();

  const [history, setHistory] = useState(null);

  const [loading, setLoading] = useState(false);

  const [post, setPost] = useState({});

  const [donateAmount, setDonateAmount] = useState(0);

  const [donateComment, setDonateComment] = useState("");

  const [progress, setProgress] = useState(0);

  let format = formatDonations(post.amount, progress);

  const getProgress = async () => {
    try {
      setLoading(true);
      const total = await getTotalDonated(id);

      setProgress(total);
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  };

  const getPost = async () => {
    try {
      setLoading(true);
      setPost(await getDonate(id));
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  };

  const donatesHistory = async () => {
    try {
      setLoading(true);

      setHistory(await getHistory(id));
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  };

  const makeDonate = async (donate_id, history) => {
    console.log(donate_id);
    try {
      await addHistory(donate_id, history).then((resp) => getPost());
      toast(
        <NotificationSuccess text="Your donation was successfully added." />
      );
    } catch (error) {
      toast(<NotificationError text="Failed to donate." />);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPost();

    getProgress();

    donatesHistory();
  }, [id]);

  return (
    <>
      {!loading ? (
        <>
          {post ? (
            <>
              <Row>
                <Col lg={4}>
                  <Card style={{ width: "100%" }} className="mb-2">
                    <Card.Img
                      src={post.image_src || NotFoundImage}
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.src = NotFoundImage;
                      }}
                      alt={post.name}
                      style={{ objectFit: "cover", width: "100%" }}
                    />
                  </Card>
                  <Col md={12} className="my-2 d-flex justify-content-between">
                    <Col
                      md={4}
                      className="text-center"
                      style={{ fontSize: "12px" }}
                    >
                      0 NEAR
                    </Col>
                    <Col
                      md={4}
                      className="text-center"
                      style={{ fontSize: "12px" }}
                    >
                      {formatNearAmount(post.amount)} NEAR
                    </Col>
                  </Col>
                  <ProgressBar
                    now={format.perc}
                    label={format.perc + "%"}
                    max={100}
                  />
                </Col>
                <Col lg={8}>
                  <Card className="text-center mb-2 p-1">
                    {post.name || post.id}
                  </Card>

                  <Card className="text-center mb-2 p-1">
                    <Link to={`/user/${post.author}`}>
                      Author - {post.author}
                    </Link>
                  </Card>

                  <Card className="text-center mb-2 p-1">
                    Status - {PostStatus[post.status]}
                  </Card>

                  <Card className="text-center mb-2 p-1">
                    Currenty donated - {formatNearAmount(progress, 2)} NEAR
                  </Card>

                  <Card className="text-center mb-3 p-1">
                    Date - {convertTimeStamp(post.timestamp)}
                  </Card>

                  {post.status === 1 && (
                    <Card className="text-center mb-4 p-1">
                      <Form>
                        <Col md={{ span: 10, offset: 1 }} className="mb-2 mt-2">
                          <Form.Control
                            type="number"
                            onChange={(e) => {
                              setDonateAmount(e.target.value);
                            }}
                            placeholder="Amount to donate"
                            min={1}
                            required
                          />
                        </Col>

                        <Col md={{ span: 10, offset: 1 }} className="mb-2">
                          <Form.Control
                            type="text"
                            onChange={(e) => {
                              setDonateComment(e.target.value);
                            }}
                            placeholder="Comment to the donation"
                            required
                          />
                        </Col>

                        <Button
                          variant="dark"
                          className="mb-2"
                          disabled={!(donateAmount > 0)}
                          onClick={() =>
                            makeDonate(post.id, {
                              donor: getAccountId(),
                              amount: donateAmount,
                              comment: donateComment,
                            })
                          }
                        >
                          Donate
                        </Button>
                      </Form>
                    </Card>
                  )}
                </Col>
              </Row>
              <Row className="mt-2 p-3">
                <Card className="mb-1 p-2">
                  {post.description || "Description is Empty"}
                </Card>
              </Row>
              {history && (
                <Row className="mb-4">
                  <h2 className="text-center">Donations</h2>
                  {history.map((d, i) => (
                    <Col md={4} key={i}>
                      <Card>
                        <Card.Body>
                          <Card.Title className="text-center">
                            {formatNearAmount(d.amount)} NEAR
                          </Card.Title>
                          <Card.Text
                            dangerouslySetInnerHTML={{
                              __html: d.comment || "</br>",
                            }}
                          ></Card.Text>
                        </Card.Body>
                        <ListGroup className="list-group-flush">
                          <ListGroup.Item className="text-center">
                            {convertTimeStamp(d.timestamp)}
                          </ListGroup.Item>
                          <ListGroup.Item className="text-center">
                            <Link to={`user/${d.donor}`}>{d.donor}</Link>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </>
          ) : (
            <h1 className="text-center">Donate Post Not found</h1>
          )}
        </>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Donate;
