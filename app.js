const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const path = require('path');
const ejs = require('ejs');
const jwt = require('jsonwebtoken');
const User = require('./src/models/user');
const { body, validationResult } = require('express-validator');
const loginRoutes = require('./src/routes/loginredis');
const loginjwt= require('./src/routes/loginjwt');

const crudtest= require('./src/routes/crud');
const cookieParser = require('cookie-parser');

// ...

//const login1= require('./src/routes/login')

const app = express();

const methodOverride = require('method-override');
app.use(methodOverride('_method'));


app.use(cookieParser());
// Configure EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const store = new MongoDBStore({
  uri: 'mongodb://127.0.0.1:27017/user-ict-3',
  collection: 'sessions',
  expires: 1000 * 60 * 60 * 24, // Session expiration time (1 day)
});

app.use(
  session({
    secret: 'your-secret-key', // Change this to a secure secret key
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

// Configure middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/user-ict-3', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4,
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


 app.use('/api/user', loginRoutes);
 app.use('/api/jwt',loginjwt);
 app.use('/api/crud',crudtest);
// app.use('/api/users1',login1);


// 

app.get('/', (req, res) => {
  res.render('index', { error: '' });
});


app.get('/api/users/login', (req, res) => {
  res.render('login', { error: '' });
});
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user with the provided email and password exists in the database
    const user = await User.findOne({ email, password });

    if (user) {
      // Set user session data upon successful login
      req.session.isLoggedIn = true;
      req.session.user = user; // Store user data in the session

      return res.redirect('/api/users/profile'); // Redirect to the home page after successful login
    }

    res.render('login', { error: 'Invalid email or password' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Define routes
app.get('/api/users/register', (req, res) => {
  res.render('registration', { errors: {} });
});

app.post(
  '/api/users/register',
  upload.array('files', 5),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('registration', { errors: errors.mapped() });
    }

    try {
      const { name, email, password } = req.body;
      const files = req.files.map((file) => file.filename);

      // Create a new user and save it to the database
      const user = new User({
        name,
        email,
        password,
        files,
      });

      await user.save();

      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

const isAuthenticated = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return next(); // Continue to the next route if the user is authenticated
  }

  // Redirect to the login page if the user is not authenticated
  res.redirect('/api/users/login');
};

// Example: Protect a route using the isAuthenticated middleware
app.get('/api/users/profile', isAuthenticated, (req, res) => {
  // Render the user's profile page
  res.render('profile', { user: req.session.user });
});

// Middleware to check for a valid JWT token
function authenticateToken(req, res, next) {
  const token = req.cookies.token; // Assuming you've stored the token in a cookie

  if (!token) {
    return res.redirect('/api/jwt/login'); // Redirect to the login page if no token is found
  }

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) {
      return res.redirect('/api/jwt/login'); // Redirect to the login page if the token is invalid
    }

    req.user = user; // Store the user object from the token in the request
    next(); // Continue to the dashboard route
  });
}

// Dashboard route
app.get('/api/users/dashboard', authenticateToken, (req, res) => {
  // Access user information from req.user
  res.render('dashboard', { user: req.user });
});
app.get('/api/users/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
    }
    res.redirect('/api/users/login'); // Redirect to the home page after logging out
  });
});
/// jwt logout
app.get('/logout', (req, res) => {
  // Clear the JWT token by setting an expired token or removing it from cookies/local storage
  // Example of setting an expired token (client-side)
  res.clearCookie('token'); // Clear the JWT token stored in a cookie

  // Redirect to the login page or home page
  res.redirect('/'); // Replace '/login' with your actual login page route
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
