const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();

const getPublicKey = async () => {};

axios.create({
  baseURL: process.env.BASE_URL,
});

router.post("/getPublicKey", async (req, res) => {
  try {
    const pubKey = await axios
      .get(process.env.BASE_URL + "/v1/encryption/public", {
        headers: {
          Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
        },
      })
      .then((res) => {
        return res;
      });
    if (pubKey.data.data.publicKey) {
      res.status(200).send(pubKey.data.data);
    } else {
      res.status(500).send("Key not found");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.post("/purchase", async (req, res) => {
  try {
    console.log("/purchase hit");
    req.body.sessionId = req.sessionId;
    const card = await axios
      .get(process.env.BASE_URL + "/v1/cards", {
        headers: {
          Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
        },
        body: req.body,
      })
      .then((res) => {
        return res.data.data;
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
    // console.log(card);

    const payment = await axios
      .get(process.env.BASE_URL + "/v1/payments", {
        headers: {
          Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
        },
        body: JSON.stringify({
          metadata: {
            email: "satoshi@circle.com",
            ipAddress: req.ip,
            sessionId: "DE6FA86F60BB47B379307F851E238617",
          },
          amount: { amount: "5.00", currency: "USD" },
          autoCapture: true,
          source: { id: card[0].id, type: card },
          verification: "cvv",
          idempotencyKey: req.body.idempotencyKey,
        }),
      })
      .then((res) => {
        return res.data.data;
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
    console.log("payment", payment);
    if (payment[0].id) {
      res.status(200).send("Succesful Fiat Payment!");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

module.exports = router;
