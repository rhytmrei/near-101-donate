import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import AddDonate from "./AddDonate";

import Loader from "../utils/Loader";
import { Form, Row } from "react-bootstrap";
import { NotificationSuccess, NotificationError } from "../utils/Notifications";
import { getDonates as getDonatesList, createDonate } from "../../utils/donate";
import DonatePost from "./DonatePost";

const Index = () => {
  const [donates, setDonates] = useState([]);
  const [loading, setLoading] = useState(false);

  const getDonates = useCallback(async () => {
    try {
      setLoading(true);
      setDonates(await getDonatesList());
    } catch (error) {
      console.log({ error });
    } finally {
      setLoading(false);
    }
  }, []);

  const addDonate = async (data) => {
    try {
      setLoading(true);
      createDonate(data).then((resp) => {
        getDonates();
      });
      toast(<NotificationSuccess text="Donate post added successfully." />);
    } catch (error) {
      console.log({ error });
      toast(<NotificationError text="Failed to create a post." />);
    } finally {
      setLoading(false);
    }
  };

  const [filter, setFilter] = useState(0);

  useEffect(() => {
    getDonates();
  }, [getDonates]);

  return (
    <>
      {!loading ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="fs-4 fw-bold mb-0">
              <Form.Select
                size="sm"
                value={filter}
                onChange={(e) => {
                  setFilter(parseInt(e.target.value));
                }}
              >
                <option value={0}>All</option>
                <option value={1}>Active</option>
              </Form.Select>
            </h1>
            <AddDonate save={addDonate} />
          </div>
          <Row xs={1} sm={3} lg={3} className="g-3 mb-5 g-xl-4 g-xxl-5">
            {donates
              .map((_donate) => {
                return (
                  (filter === 0 || _donate.status === filter) && (
                    <DonatePost
                      donate={{
                        ..._donate,
                      }}
                      key={_donate.id}
                    />
                  )
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

export default Index;
