import { getPod } from './solid.js';
import * as dotenv from 'dotenv';
dotenv.config();

const podBase = process.env.POD_BASE || "http://localhot:3000";

const podName = process.env.POD_NAME || "robbevanherck";

let podPath = podBase;

if (podPath[podPath.length-1] !== '/') {
  podPath = podPath + "/" + podName + "/";
} else {
  podPath = podPath + podName + "/";
}

const podStore = await getPod(podBase + "/" + podName + "/");
console.log(podStore);
