const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../protos/menu.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const menuProto = grpc.loadPackageDefinition(packageDefinition).menu;

const client = new menuProto.MenuService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

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

async function testCRUDOperations() {
  console.log('🚀 Testing gRPC Menu Service with MongoDB');
  console.log('=' .repeat(50));

  try {
    console.log('\n📝 Creating menus...');
    const createMenu1 = await promisifyCall(client.createMenu.bind(client), {
      name: 'Pad Thai',
      price: 12.99
    });
    console.log('✅ Created:', createMenu1);

    const createMenu2 = await promisifyCall(client.createMenu.bind(client), {
      name: 'Green Curry',
      price: 15.50
    });
    console.log('✅ Created:', createMenu2);

    console.log('\n📋 Listing all menus...');
    const listMenus = await promisifyCall(client.listMenus.bind(client), {
      page: 1,
      limit: 10
    });
    console.log('📋 All menus:', listMenus);

    if (createMenu1.success && createMenu1.menu) {
      console.log('\n🔍 Getting menu by ID...');
      const getMenu = await promisifyCall(client.getMenu.bind(client), {
        id: createMenu1.menu.id
      });
      console.log('🔍 Found menu:', getMenu);

      console.log('\n✏️ Updating menu...');
      const updateMenu = await promisifyCall(client.updateMenu.bind(client), {
        id: createMenu1.menu.id,
        name: 'Pad Thai Special',
        price: 14.99
      });
      console.log('✏️ Updated menu:', updateMenu);

      console.log('\n🗑️ Deleting menu...');
      const deleteMenu = await promisifyCall(client.deleteMenu.bind(client), {
        id: createMenu1.menu.id
      });
      console.log('🗑️ Deleted menu:', deleteMenu);
    }

    console.log('\n📋 Final menu list...');
    const finalList = await promisifyCall(client.listMenus.bind(client), {
      page: 1,
      limit: 10
    });
    console.log('📋 Final menus:', finalList);

  } catch (error) {
    console.error('❌ Error during CRUD operations:', error);
  } finally {
    console.log('\n🏁 CRUD test completed!');
    console.log('=' .repeat(50));
  }
}

if (require.main === module) {
  testCRUDOperations();
}

module.exports = { testCRUDOperations, client };