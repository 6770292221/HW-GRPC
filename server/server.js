const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const mongoose = require('mongoose');
const Menu = require('../models/Menu');

const PROTO_PATH = path.join(__dirname, '../protos/restaurant.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const restaurantProto = grpc.loadPackageDefinition(packageDefinition);

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

const restaurantService = {
    async GetAllMenu(call, callback) {
        try {
            const menus = await Menu.find().sort({ createdAt: -1 });
            
            const menuList = menus.map(menu => ({
                id: menu._id.toString(),
                name: menu.name,
                price: Math.floor(menu.price)
            }));

            callback(null, {
                menu: menuList
            });
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    },

    async Get(call, callback) {
        try {
            const { id } = call.request;
            const menu = await Menu.findById(id);

            if (!menu) {
                callback({
                    code: grpc.status.NOT_FOUND,
                    message: 'Menu not found'
                });
                return;
            }

            callback(null, {
                id: menu._id.toString(),
                name: menu.name,
                price: Math.floor(menu.price)
            });
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    },

    async Insert(call, callback) {
        try {
            const { name, price } = call.request;
            const menu = new Menu({ name, price });
            const savedMenu = await menu.save();

            callback(null, {
                id: savedMenu._id.toString(),
                name: savedMenu.name,
                price: Math.floor(savedMenu.price)
            });
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    },

    async Update(call, callback) {
        try {
            const { id, name, price } = call.request;
            const menu = await Menu.findByIdAndUpdate(
                id,
                { name, price },
                { new: true, runValidators: true }
            );

            if (!menu) {
                callback({
                    code: grpc.status.NOT_FOUND,
                    message: 'Menu not found'
                });
                return;
            }

            callback(null, {
                id: menu._id.toString(),
                name: menu.name,
                price: Math.floor(menu.price)
            });
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    },

    async Remove(call, callback) {
        try {
            const { id } = call.request;
            const menu = await Menu.findByIdAndDelete(id);

            if (!menu) {
                callback({
                    code: grpc.status.NOT_FOUND,
                    message: 'Menu not found'
                });
                return;
            }

            callback(null, {});
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            });
        }
    }
};

async function startServer() {
    await connectToDatabase();

    const server = new grpc.Server();

    server.addService(restaurantProto.RestaurantService.service, restaurantService);

    const PORT = process.env.PORT || 50051;

    server.bindAsync(
        `0.0.0.0:${PORT}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                console.error('Failed to start server:', error);
                return;
            }
            console.log(`gRPC Restaurant Server running on port ${port}`);

            // Graceful shutdown to release the port properly
            const shutdown = () => {
                console.log('Shutting down gRPC server...');
                server.tryShutdown(() => {
                    console.log('gRPC server stopped.');
                    process.exit(0);
                });
                // Fallback in case tryShutdown hangs
                setTimeout(() => {
                    console.warn('Force shutting down gRPC server.');
                    server.forceShutdown();
                    process.exit(1);
                }, 3000).unref();
            };
            process.on('SIGINT', shutdown);
            process.on('SIGTERM', shutdown);
        }
    );
}

startServer().catch(console.error);
