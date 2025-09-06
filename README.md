# gRPC Menu Service with MongoDB

A complete gRPC server implementation with MongoDB integration for menu CRUD operations.

## 🚀 Features

- **gRPC Server** with MenuService
- **MongoDB Integration** using Mongoose
- **CRUD Operations**: Create, Read, Update, Delete menus
- **Async/Await** pattern for database operations
- **Client Testing** with comprehensive CRUD demonstration

## 📁 Project Structure

```
├── models/
│   └── Menu.js          # Mongoose model for Menu
├── protos/
│   └── menu.proto       # gRPC protocol buffer definition
├── server/
│   └── server.js        # gRPC server implementation
├── client/
│   └── index.js         # gRPC client for testing
└── package.json         # Dependencies
```

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. MongoDB Setup Options

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Set environment variable:
   ```bash
   export MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/grpc_menu_db"
   ```

### 3. Start the gRPC Server
```bash
npm start
# or
node server/server.js
```

### 4. Test with Client
```bash
node client/index.js
```

## 📋 Menu Schema

```javascript
{
  name: String,     // Required, trimmed
  price: Number,    // Required, minimum 0
  createdAt: Date,  // Auto-generated
  updatedAt: Date   // Auto-generated
}
```

## 🔧 gRPC Service Methods

| Method | Description |
|--------|-------------|
| `CreateMenu` | Create a new menu item |
| `GetMenu` | Get menu by ID |
| `UpdateMenu` | Update existing menu |
| `DeleteMenu` | Delete menu by ID |
| `ListMenus` | List all menus with pagination |

## 📝 Example Usage

### Create Menu
```javascript
const response = await client.createMenu({
  name: 'Pad Thai',
  price: 12.99
});
```

### Get Menu
```javascript
const response = await client.getMenu({
  id: 'menu_id_here'
});
```

### Update Menu
```javascript
const response = await client.updateMenu({
  id: 'menu_id_here',
  name: 'Updated Name',
  price: 15.99
});
```

### Delete Menu
```javascript
const response = await client.deleteMenu({
  id: 'menu_id_here'
});
```

### List Menus
```javascript
const response = await client.listMenus({
  page: 1,
  limit: 10
});
```

## 🧪 Testing

Run the client to test all CRUD operations:

```bash
node client/index.js
```

This will:
1. ✅ Create two menu items
2. 📋 List all menus
3. 🔍 Get menu by ID
4. ✏️ Update menu
5. 🗑️ Delete menu
6. 📋 Show final menu list

## 🔒 Environment Variables

- `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017/grpc_menu_db`)
- `PORT`: gRPC server port (default: `50051`)

## 📦 Dependencies

- `@grpc/grpc-js`: gRPC implementation
- `@grpc/proto-loader`: Protocol buffer loader
- `mongoose`: MongoDB ODM
- `express`: HTTP server framework
- `uuid`: UUID generation

## 🎯 Assignment Requirements Completed

- ✅ **Create model file**: `models/Menu.js` with name and price schema
- ✅ **Mongoose integration**: Required mongoose dependency
- ✅ **Database connection**: Server connects to MongoDB via connection string
- ✅ **Service functions**: All CRUD operations with async/await
- ✅ **Client testing**: Complete CRUD demonstration in `client/index.js`
- ✅ **MongoDB support**: Works with both local MongoDB and MongoDB Atlas