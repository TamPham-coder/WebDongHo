const express = require('express');
const router = express.Router();

// daos
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
const CustomerDAO = require('../models/CustomerDAO');
const OrderDAO = require('../models/OrderDAO');

// utils
const CryptoUtil = require('../utils/CryptoUtil');
const EmailUtil = require('../utils/EmailUtil');
const JwtUtil = require('../utils/JwtUtil');

// category
router.get('/categories', async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});

// product
router.get('/products/new', async function (req, res) {
  const products = await ProductDAO.selectTopNew(3);
  res.json(products);
});

router.get('/products/hot', async function (req, res) {
  const products = await ProductDAO.selectTopHot(4);
  res.json(products);
});

router.get('/products/category/:cid', async function (req, res) {
  const _cid = req.params.cid;
  const products = await ProductDAO.selectByCatID(_cid);
  res.json(products);
});

// search product
router.get('/products/search/:keyword', async function (req, res) {
  const keyword = req.params.keyword;
  const products = await ProductDAO.selectByKeyword(keyword);
  res.json(products);
});

// product detail
router.get('/products/:id', async function (req, res) {
  const _id = req.params.id;
  const product = await ProductDAO.selectByID(_id);
  res.json(product);
});

// customer signup
router.post('/signup', async function (req, res) {
  try {
    const { username, password, name, phone, email } = req.body;
    const dbCust = await CustomerDAO.selectByUsernameOrEmail(username, email);

    if (dbCust) {
      res.json({ success: false, message: 'Username or email already exists' });
    } else {
      const now = new Date().getTime();
      const token = CryptoUtil.md5(now.toString());

      const newCust = {
        username,
        password,
        name,
        phone,
        email,
        active: 1,  // Auto-activate account
        token
      };

      const result = await CustomerDAO.insert(newCust);

      if (result) {
        // Try to send email but don't block signup
        try {
          await EmailUtil.send(email, result._id, token);
          console.log('Verification email sent to:', email);
        } catch (emailErr) {
          console.warn('Email send warning:', emailErr.message);
        }
        
        res.json({ 
          success: true, 
          message: 'Sign-up successful! Your account is ready to use. You can login now.',
          data: {
            _id: result._id,
            token: token,
            username: result.username,
            name: result.name,
            email: result.email
          }
        });
      } else {
        res.json({ success: false, message: 'Failed to create account' });
      }
    }
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

// customer active
router.post('/active', async function (req, res) {
  const { id, token } = req.body;

  if (!id || !token) {
    return res.json({ success: false, message: 'ID and token are required' });
  }

  const result = await CustomerDAO.active(id, token, 1);

  if (result) {
    return res.json({ success: true, message: 'Account activated successfully', data: result });
  }

  return res.json({ success: false, message: 'Activation failed. Invalid ID or token.' });
});

// customer login
router.post('/login', async function (req, res) {
  const { username, password } = req.body;

  if (username && password) {
    const customer = await CustomerDAO.selectByUsernameAndPassword(username, password);

    if (customer) {
      if (customer.active === 1) {
        const token = JwtUtil.genToken();
        const loggedCustomer = {
          _id: customer._id,
          username: customer.username,
          password: customer.password,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          active: customer.active,
          token: customer.token
        };
        res.json({
          success: true,
          message: 'Authentication successful',
          token,
          customer: loggedCustomer
        });
      } else {
        res.json({ success: false, message: 'Account is deactive' });
      }
    } else {
      res.json({ success: false, message: 'Incorrect username or password' });
    }
  } else {
    res.json({ success: false, message: 'Please input username and password' });
  }
});

// check token
router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  res.json({ success: true, message: 'Token is valid', token });
});

// myprofile
router.put('/customers/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const { username, password, name, phone, email } = req.body;
    const _id = req.params.id;

    console.log('Update request received:', { _id, username, hasPassword: !!password, name, phone, email });

    if (!username || !name || !phone || !email) {
      console.log('Validation failed: missing required fields');
      return res.status(400).json({ success: false, message: 'Username, name, phone, and email are required' });
    }

    const updateData = { username, name, phone, email };
    if (password) {
      updateData.password = password;
    }

    const customer = { _id, ...updateData };
    console.log('Updating with data:', customer);
    const result = await CustomerDAO.update(customer);

    console.log('Update result:', result);
    if (result) {
      res.json({ success: true, message: 'Profile updated successfully', data: result });
    } else {
      res.status(400).json({ success: false, message: 'Failed to update profile' });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// mycart - checkout
router.post('/checkout', JwtUtil.checkToken, async function (req, res) {
  const now = new Date().getTime();
  const { total, items, customer, paymentInfo } = req.body;
  const method = paymentInfo?.method || 'card';

  let payment = {
    method,
    transactionId: `TXN${now}`
  };

  let status = 'PENDING';

  if (method === 'card') {
    payment = {
      ...payment,
      status: 'PAID',
      cardLast4: paymentInfo?.cardNumber ? paymentInfo.cardNumber.slice(-4) : ''
    };
    status = 'PAID';
  } else if (method === 'qr') {
    payment = {
      ...payment,
      status: 'QR_PENDING',
      qrCodeRef: `QR${now}`
    };
    status = 'QR_PENDING';
  } else if (method === 'cod') {
    payment = {
      ...payment,
      status: 'COD_PENDING'
    };
    status = 'COD_PENDING';
  }

  const order = {
    cdate: now,
    total: total,
    status: status,
    customer: customer,
    items: items,
    payment: payment
  };

  const result = await OrderDAO.insert(order);
  res.json(result);
});

// myorders
router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
  const _cid = req.params.cid;
  const orders = await OrderDAO.selectByCustID(_cid);
  res.json(orders);
});

module.exports = router;