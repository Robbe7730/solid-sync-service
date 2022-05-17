import mu from 'mu';

import { getPod } from './solid.js';
import { writeToStore } from './sparql.js';

import * as dotenv from 'dotenv';
dotenv.config();

checkEnv();

mu.app.post('/update', (_req, res) => {
  update().then(() => {
    res.send("OK");
  });
});

async function update() {
  const podBase = process.env.POD_BASE || "http://localhost:3000";

  const podName = process.env.POD_NAME || "robbevanherck";

  let podPath = podBase;

  if (podPath[podPath.length-1] !== '/') {
    podPath = podPath + "/" + podName + "/";
  } else {
    podPath = podPath + podName + "/";
  }

  const podStore = await getPod(podPath);
  await writeToStore(podStore);
}

function checkEnv() {
  if (!process.env.POD_BASE) {
    throw new Error("No POD_BASE specified");
  }
  if (!process.env.POD_NAME) {
    throw new Error("No POD_NAME specified");
  }
  if (!process.env.TOKEN_ID) {
    throw new Error("No TOKEN_ID specified");
  }
  if (!process.env.TOKEN_SECRET) {
    throw new Error("No TOKEN_SECRET specified");
  }
}
