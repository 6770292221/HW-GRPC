// Lightweight config loader with optional dotenv support
try {
  // Load environment variables from .env if available
  require('dotenv').config();
} catch (_) {
  // dotenv is optional; ignore if not installed
}

const config = {
  MONGODB_URI:
    process.env.MONGODB_URI || 'mongodb://localhost:27017/grpc_menu_db',
  GRPC_PORT: parseInt(process.env.GRPC_PORT || process.env.PORT || '50051', 10),
  WEB_PORT: parseInt(process.env.WEB_PORT || '3000', 10),
};

module.exports = config;

