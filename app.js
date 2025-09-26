const express = require('express');
const bodyParser = require('body-parser');
const Omise = require('omise');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const omise = Omise({
  publicKey: 'pkey_test_63cqbxr2v8h5z0zgks6',
  secretKey: 'skey_test_63otwm0opq1lexgnhv9'
});

app.post('/charge', async (req, res) => {
  try {
    const { token, amount } = req.body;

    if (!token || !amount) {
      return res.status(400).json({ error: 'Missing token or amount' });
    }

    const charge = await omise.charges.create({
      amount,
      currency: 'thb',
      card: token
    });

    if (charge.status === 'successful') {
      res.json({ 
        message: 'Payment successful',
        chargeId: charge.id, 
        charge,
      });
    } else {
      res.status(400).json({ error: 'Payment failed', charge });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.post('/pay-with-card', async (req, res) => {
  try {
    const { card, amount, description } = req.body;

    if (!card || !amount) {
      return res.status(400).json({ error: 'Missing card info or amount' });
    }

    // 1. สร้าง token จากข้อมูลบัตร
    const token = await omise.tokens.create({ card });

    // 2. เรียก charge จาก token ที่สร้างได้
    const charge = await omise.charges.create({
      amount,
      currency: 'thb',
      card: token.id,
      description: description || 'Training Payment',
    });

    if (charge.status === 'successful') {
      return res.json({
        status: 'successful',
        chargeId: charge.id,
        amount: charge.amount,
        paidAt: charge.paid_at,
        charge,
      });
    } else {
      return res.status(400).json({
        status: 'failed',
        message: charge.failure_message || 'Charge failed',
        charge,
      });
    }

  } catch (err) {
    console.error('Error in /pay-with-card:', err);
    return res.status(500).json({ error: err.message });
  }
});



app.listen(3000, '0.0.0.0', () => {
  console.log('✅ Server running at your.ip.number:3000');
}); 