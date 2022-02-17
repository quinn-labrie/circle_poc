import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import WidgetBot from "@widgetbot/react-embed";
import styled from "styled-components";
import mugen from "./download-1.jpg";
import axios from "axios";
import Swal from "sweetalert2";

import openPGP from "./modules/openpgp";
import { v4 as uuidv4 } from "uuid";

const App = () => {
  const [pubKey, setPubKey] = useState(null);
  const [card, setCard] = useState(4007400000000007);
  const [month, setMonth] = useState();
  const [year, setYear] = useState();
  const [cvv, setCvv] = useState();

  const chooseCardOrCrypto = () => {
    Swal.fire({
      title: "Pay with Card or Crypto?",
      confirmButtonText: "Card",
      showDenyButton: true,
      denyButtonText: "Crypto",
    }).then(async (res) => {
      if (res.isConfirmed) {
        console.log("Card");
        await axios
          .post("http://localhost:5000/api/circle/getPublicKey")
          .then((res) => setPubKey(res.data))
          .catch((err) => {
            Swal.fire("Error Retrieving Public Key!");
          });
      }
      if (res.isDenied) {
        console.log("Crypto");
        await axios
          .post("http://localhost:5000/api/circle/crypto", { card: false })
          .then((res) => console.log(res));
      }
    });
  };

  const saveCardDetails = async () => {
    console.log(card, month, year, cvv, pubKey);
    const cardDetails = {
      number: card,
      cvv: cvv,
    };

    const encryptedData = await openPGP.encrypt(
      cardDetails,
      pubKey.keyId,
      pubKey.publicKey
    );
    console.log(encryptedData);

    const { encryptedMessage, keyId } = encryptedData;

    const payload = {
      idempotencyKey: uuidv4(),
      expMonth: month,
      expYear: year,
      keyId: keyId,
      encryptedData: encryptedMessage,
      billingDetails: {
        name: "Satoshi Nakamoto",
        city: "Boston",
        country: "US",
        line1: "100 Money Street",
        line2: "Suite 1",
        district: "MA",
        postalCode: "01234",
      },
      metadata: {
        email: "satoshi@circle.com",
        // sessionId: "DE6FA86F60BB47B379307F851E238617",
        ipAddress: "244.28.239.130",
      },
    };

    await axios
      .post("http://localhost:5000/api/circle/purchase", payload)
      .then((res) => console.log(res))
      .catch((err) => {
        Swal.fire("Error");
      });
  };

  return (
    <div>
      <NftCard>
        <span>NFT $5</span>
        <img src={mugen} />
        <button onClick={() => chooseCardOrCrypto()}>Purchase!</button>
      </NftCard>
      {pubKey && (
        <>
          <input
            type="text"
            placeholder="Card #"
            onChange={(e) => setCard(e.target.value)}
            value={card}
          />
          <input
            type="number"
            placeholder="Expiration Month (1)"
            onChange={(e) => setMonth(e.target.value)}
          />
          <input
            type="number"
            placeholder="Expiration Year (2022)"
            onChange={(e) => setYear(e.target.value)}
          />
          <input
            type="number"
            placeholder="CVV"
            onChange={(e) => setCvv(e.target.value)}
          />
          <button onClick={() => saveCardDetails()}>Submit</button>
        </>
      )}
    </div>
  );
};

const NftCard = styled.div`
  border: 1px solid black;
  background-color: lightgrey;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  width: 200px;

  & > img {
    width: 200px;
  }
`;

export default App;
