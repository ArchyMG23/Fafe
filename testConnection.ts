import { testFirestoreConnection } from './src/lib/firebase';
async function run() {
  const result = await testFirestoreConnection();
  console.log('Connection Test Result:', result);
}
run();
