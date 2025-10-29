const mongoose = require('mongoose');
const Deployment = require('../src/models/deployment');

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/cloudops_insight';
async function run(){
  await mongoose.connect(mongoUrl);
  console.log('Connected');
  await Deployment.deleteMany({});
  const docs = [];
  for(let i=0;i<8;i++){
    docs.push({ id: `seed-${i}`, timestamp: new Date(Date.now()-i*3600*1000), status: i%3===0? 'failed' : 'success', duration: 10 + i*3, branch: 'main' });
  }
  await Deployment.insertMany(docs);
  console.log('Seeded');
  process.exit(0);
}

run().catch(err=>{console.error(err); process.exit(1)});
