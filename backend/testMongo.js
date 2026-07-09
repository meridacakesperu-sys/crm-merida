const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://meridacakesperu:KP3V67KW1j1jeu9y@cluster0.pqmlmlz.mongodb.net/crmVIP?retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.dir(error);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
