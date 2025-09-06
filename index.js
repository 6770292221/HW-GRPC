const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const PROTO_PATH = path.join(__dirname, './protos/menu.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const menuProto = grpc.loadPackageDefinition(packageDefinition).menu;

// Create gRPC client to connect to our gRPC server
const client = new menuProto.MenuService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Helper function to promisify gRPC calls
function promisifyCall(method, request) {
  return new Promise((resolve, reject) => {
    method(request, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

app.get("/", async (req, res) => {
  try {
    const data = await promisifyCall(client.listMenus.bind(client), {
      page: 1,
      limit: 10
    });
    if (!data.success) {
      res.render("menu", {
        results: [],
        error: "Failed to fetch menus"
      });
    } else {
      res.render("menu", {
        results: data.menus
      });
    }
  } catch (err) {
    console.error("Error fetching menus:", err);
    res.render("menu", {
      results: [],
      error: "Connection error to gRPC server. Make sure gRPC server is running on port 50051"
    });
  }
});

app.post("/save", async (req, res) => {
  try {
    let newMenuItem = {
      name: req.body.name,
      price: parseFloat(req.body.price)
    };

    const data = await promisifyCall(client.createMenu.bind(client), newMenuItem);
    if (data.success) {
      console.log("New Menu created successfully", data);
      res.redirect("/");
    } else {
      res.render("menu", {
        results: [],
        error: data.message
      });
    }
  } catch (err) {
    console.error("Error creating menu:", err);
    res.render("menu", {
      results: [],
      error: "Failed to create menu item"
    });
  }
});

app.post("/update", async (req, res) => {
  try {
    const updateMenuItem = {
      id: req.body.id,
      name: req.body.name,
      price: parseFloat(req.body.price)
    };
    console.log("update Item %s %s %d", updateMenuItem.id, req.body.name, req.body.price);

    const data = await promisifyCall(client.updateMenu.bind(client), updateMenuItem);
    if (data.success) {
      console.log("Menu Item updated successfully", data);
      res.redirect("/");
    } else {
      res.render("menu", {
        results: [],
        error: data.message
      });
    }
  } catch (err) {
    console.error("Error updating menu:", err);
    res.render("menu", {
      results: [],
      error: "Failed to update menu item"
    });
  }
});

app.post("/remove", async (req, res) => {
  try {
    const data = await promisifyCall(client.deleteMenu.bind(client), {
      id: req.body.menuitem_id
    });
    if (data.success) {
      console.log("Menu Item removed successfully");
      res.redirect("/");
    } else {
      res.render("menu", {
        results: [],
        error: data.message
      });
    }
  } catch (err) {
    console.error("Error removing menu:", err);
    res.render("menu", {
      results: [],
      error: "Failed to remove menu item"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Web Server running at port ${PORT}`);
});