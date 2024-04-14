import React, { useEffect, useCallback, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import { login, logout as destroy, accountBalance } from "./utils/near";
import Wallet from "./components/Wallet";
import Profile from "./components/user/Profile";

import { Notification } from "./components/utils/Notifications";

import Index from "./components/donates/Index";

import Cover from "./components/utils/Cover";
import "./App.css";
import Donate from "./components/donates/view/Donate";

const App = function AppWrapper() {
  const account = window.walletConnection.account();
  const [balance, setBalance] = useState("0");

  const getBalance = useCallback(async () => {
    if (account.accountId) {
      setBalance(await accountBalance());
    }
  }, [account]);

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  return (
    <>
      <Notification />
      {account.accountId ? (
        <BrowserRouter>
          <Container fluid="md">
            <Nav className="justify-content-between pt-3 pb-5">
              <Navbar.Brand>
                <Link to={"/"} className="align-middle">
                  JustDonate
                </Link>
              </Navbar.Brand>
              <Nav.Item>
                <Wallet
                  address={account.accountId}
                  amount={balance}
                  symbol="NEAR"
                  destroy={destroy}
                />
              </Nav.Item>
            </Nav>
            <main>
              <Routes>
                <Route index element={<Index />} />
                <Route path="/user/:address" element={<Profile />} />
                <Route path="/post/:id?" element={<Donate />} />
              </Routes>
            </main>
          </Container>
        </BrowserRouter>
      ) : (
        <Cover name="Donate" login={login} coverImg={"/logo.png"} />
      )}
    </>
  );
};

export default App;
