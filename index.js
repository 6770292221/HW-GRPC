
const { client } = require('./client/client.js');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set("views", path.join(__dirname, "web"));
app.set("view engine", "hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
    const data = await promisifyCall(client.GetAllMenu.bind(client), {});
    res.render("menu", {
      results: data.menu || []
    });
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
      price: Math.floor(parseFloat(req.body.price))
    };

    const data = await promisifyCall(client.Insert.bind(client), newMenuItem);
    if (data && data.id) {
      console.log("New Menu created successfully", data);
      res.redirect("/");
    } else {
      res.render("menu", {
        results: [],
        error: "Failed to create menu item"
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
      price: Math.floor(parseFloat(req.body.price))
    };
    console.log("update Item %s %s %d", updateMenuItem.id, req.body.name, req.body.price);

    const data = await promisifyCall(client.Update.bind(client), updateMenuItem);
    if (data && data.id) {
      console.log("Menu Item updated successfully", data);
      res.redirect("/");
    } else {
      res.render("menu", {
        results: [],
        error: "Failed to update menu item"
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
    const data = await promisifyCall(client.Remove.bind(client), {
      id: req.body.menuitem_id
    });
    console.log("Menu Item removed successfully");
    res.redirect("/");
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
