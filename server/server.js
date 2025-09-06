const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const mongoose = require('mongoose');
const Menu = require('../models/Menu');

const PROTO_PATH = path.join(__dirname, '../protos/menu.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const menuProto = grpc.loadPackageDefinition(packageDefinition).menu;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rest_user:MySecret123!@cluster0.k8zthtm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

async function connectToDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

const menuService = {
    async createMenu(call, callback) {
        try {
            const { name, price } = call.request;
            const menu = new Menu({ name, price });
            const savedMenu = await menu.save();

            callback(null, {
                menu: {
                    id: savedMenu._id.toString(),
                    name: savedMenu.name,
                    price: savedMenu.price,
                    createdAt: savedMenu.createdAt.toISOString(),
                    updatedAt: savedMenu.updatedAt.toISOString()
                },
                message: 'Menu created successfully',
                success: true
            });
        } catch (error) {
            callback(null, {
                menu: null,
                message: error.message,
                success: false
            });
        }
    },

    async getMenu(call, callback) {
        try {
            const { id } = call.request;
            const menu = await Menu.findById(id);

            if (!menu) {
                callback(null, {
                    menu: null,
                    message: 'Menu not found',
                    success: false
                });
                return;
            }

            callback(null, {
                menu: {
                    id: menu._id.toString(),
                    name: menu.name,
                    price: menu.price,
                    createdAt: menu.createdAt.toISOString(),
                    updatedAt: menu.updatedAt.toISOString()
                },
                message: 'Menu found successfully',
                success: true
            });
        } catch (error) {
            callback(null, {
                menu: null,
                message: error.message,
                success: false
            });
        }
    },

    async updateMenu(call, callback) {
        try {
            const { id, name, price } = call.request;
            const menu = await Menu.findByIdAndUpdate(
                id,
                { name, price },
                { new: true, runValidators: true }
            );

            if (!menu) {
                callback(null, {
                    menu: null,
                    message: 'Menu not found',
                    success: false
                });
                return;
            }

            callback(null, {
                menu: {
                    id: menu._id.toString(),
                    name: menu.name,
                    price: menu.price,
                    createdAt: menu.createdAt.toISOString(),
                    updatedAt: menu.updatedAt.toISOString()
                },
                message: 'Menu updated successfully',
                success: true
            });
        } catch (error) {
            callback(null, {
                menu: null,
                message: error.message,
                success: false
            });
        }
    },

    async deleteMenu(call, callback) {
        try {
            const { id } = call.request;
            const menu = await Menu.findByIdAndDelete(id);

            if (!menu) {
                callback(null, {
                    message: 'Menu not found',
                    success: false
                });
                return;
            }

            callback(null, {
                message: 'Menu deleted successfully',
                success: true
            });
        } catch (error) {
            callback(null, {
                message: error.message,
                success: false
            });
        }
    },

    async listMenus(call, callback) {
        try {
            const { page = 1, limit = 10 } = call.request;
            const skip = (page - 1) * limit;

            const menus = await Menu.find()
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await Menu.countDocuments();

            const menuList = menus.map(menu => ({
                id: menu._id.toString(),
                name: menu.name,
                price: menu.price,
                createdAt: menu.createdAt.toISOString(),
                updatedAt: menu.updatedAt.toISOString()
            }));

            callback(null, {
                menus: menuList,
                total: total,
                success: true
            });
        } catch (error) {
            callback(null, {
                menus: [],
                total: 0,
                success: false
            });
        }
    }
};

async function startServer() {
    await connectToDatabase();

    const server = new grpc.Server();

    server.addService(menuProto.MenuService.service, menuService);

    const PORT = process.env.PORT || 50051;

    server.bindAsync(
        `0.0.0.0:${PORT}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                console.error('Failed to start server:', error);
                return;
            }
            console.log(`gRPC Menu Server running on port ${port}`);
            server.start();
        }
    );
}

startServer().catch(console.error);

