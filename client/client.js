const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../protos/restaurant.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const restaurantProto = grpc.loadPackageDefinition(packageDefinition);

const client = new restaurantProto.RestaurantService(
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
  console.log('Testing gRPC Restaurant Service with MongoDB');
  console.log('='.repeat(50));

  try {
    console.log('\nCreating menus...');
    const createMenu1 = await promisifyCall(client.Insert.bind(client), {
      name: 'Pad Thai',
      price: 13
    });
    console.log('Created:', createMenu1);

    const createMenu2 = await promisifyCall(client.Insert.bind(client), {
      name: 'Green Curry',
      price: 16
    });
    console.log('Created:', createMenu2);

    console.log('\nListing all menus...');
    const listMenus = await promisifyCall(client.GetAllMenu.bind(client), {});
    console.log('All menus:', listMenus);

    if (createMenu1 && createMenu1.id) {
      console.log('\nGetting menu by ID...');
      const getMenu = await promisifyCall(client.Get.bind(client), {
        id: createMenu1.id
      });
      console.log('Found menu:', getMenu);

      console.log('\nUpdating menu...');
      const updateMenu = await promisifyCall(client.Update.bind(client), {
        id: createMenu1.id,
        name: 'Pad Thai Special',
        price: 15
      });
      console.log('Updated menu:', updateMenu);

      console.log('\nDeleting menu...');
      const deleteMenu = await promisifyCall(client.Remove.bind(client), {
        id: createMenu1.id
      });
      console.log('Deleted menu:', deleteMenu);
    }

    console.log('\nFinal menu list...');
    const finalList = await promisifyCall(client.GetAllMenu.bind(client), {});
    console.log('Final menus:', finalList);

  } catch (error) {
    console.error('Error during CRUD operations:', error);
  } finally {
    console.log('\nCRUD test completed!');
    console.log('='.repeat(50));
  }
}

if (require.main === module) {
  testCRUDOperations();
}

module.exports = { testCRUDOperations, client };
