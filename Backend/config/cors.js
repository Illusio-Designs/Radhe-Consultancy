const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173', // Vite default port
  'https://radheconsultancy.co.in',
  'https://www.radheconsultancy.co.in',
  'https://api.radheconsultancy.co.in'
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log('\n=== CORS Origin Check ===');
    console.log('Request Origin:', origin);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Allowed Origins:', allowedOrigins);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Decision: No origin, allowing request');
      return callback(null, true);
    }

    // In development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
      console.log('Decision: Development environment, allowing localhost request');
      return callback(null, true);
    }

    // In production, check against allowed origins
    if (allowedOrigins.includes(origin)) {
      console.log('Decision: Origin allowed in production');
      return callback(null, true);
    }

    console.log('Decision: Origin not allowed');
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

module.exports = {
  corsOptions,
  allowedOrigins
}; 