import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Card,
  Button,
  Col,
  Badge,
  Stack,
  ProgressBar,
  Ratio,
} from "react-bootstrap";

import {
  PostStatus,
  convertTimeStamp,
  formatDonations,
  getTotalDonated,
} from "../../utils/donate";

import { formatNearAmount } from "near-api-js/lib/utils/format";

import NotFoundImage from "../../assets/img/notfound.jpeg";
import { Link } from "react-router-dom";

const DonatePost = ({ donate, editcallback }) => {
  let { id, amount, name, status, author, timestamp, image_src } = donate;

  const [progress, setProgress] = useState(0);

  let format = formatDonations(amount, progress);

  const getProgress = useCallback(async () => {
    try {
      const total = await getTotalDonated(id);

      setProgress(total);
    } catch (error) {
      console.log({ error });
    }
  }, [id]);

  useEffect(() => {
    getProgress();
  }, [getProgress]);

  return (
    <Col>
      <Card className="h-100">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <span className="font-monospace text-secondary">
              {convertTimeStamp(timestamp)}
            </span>
            <Badge
              bg={status === 1 ? "success" : "secondary"}
              className="ms-auto"
            >
              {PostStatus[status]}
            </Badge>
          </Stack>
        </Card.Header>
        <Ratio aspectRatio="4x3">
          <img
            src={image_src || NotFoundImage}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = NotFoundImage;
            }}
            alt={name}
            style={{ objectFit: "cover" }}
          />
        </Ratio>
        <Col md={12} className="my-2 d-flex justify-content-between">
          <Col md={4} className="text-center" style={{ fontSize: "12px" }}>
            0 NEAR
          </Col>
          <Col md={4} className="text-center" style={{ fontSize: "12px" }}>
            {formatNearAmount(amount)} NEAR
          </Col>
        </Col>
        <Col md={{ span: 10, offset: 1 }}>
          <ProgressBar now={format.perc} label={format.perc + "%"} max={100} />
        </Col>
        <Card.Body className="d-flex  flex-column text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Text className="text-secondary">
            <span>{author}</span>
          </Card.Text>
          <Link to={`/post/${id}`}>
            <Button variant="outline-dark" className="w-100 py-2">
              Show
            </Button>
          </Link>
          {editcallback && status !== 3 && (
            <Button
              variant="outline-dark"
              onClick={() => editcallback(id)}
              className="w-100 py-2 mt-1"
            >
              Edit
            </Button>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

DonatePost.propTypes = {
  donate: PropTypes.instanceOf(Object).isRequired,
  editcallback: PropTypes.func,
};

export default DonatePost;
