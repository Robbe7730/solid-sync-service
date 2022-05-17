import { createDpopHeader, generateDpopKeyPair, buildAuthenticatedFetch  } from '@inrupt/solid-client-authn-core';
import fetch from 'node-fetch';
import * as rdflib from 'rdflib';

const LDP = rdflib.Namespace('http://www.w3.org/ns/ldp#');

async function getAuthenticatedFetch() {
  const accessTokenId = process.env.TOKEN_ID;
  const accessTokenSecret = process.env.TOKEN_SECRET;
  const podBase = process.env.POD_BASE || "http://localhost:3000";
  const tokenUrl = podBase + "/.oidc/token"

  if (!accessTokenId || !accessTokenSecret) {
      console.error("No TOKEN_ID or TOKEN_SECRET specified");
      process.exit(1);
  }

  const dpopKey = await generateDpopKeyPair();

  const authString = `${encodeURIComponent(accessTokenId)}:${encodeURIComponent(accessTokenSecret)}`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
      'content-type': 'application/x-www-form-urlencoded',
      dpop: await createDpopHeader(tokenUrl, 'POST', dpopKey),
    },
    body: 'grant_type=client_credentials&scope=webid',
  }).then(r => r.json());

  if (response.error) {
      throw new Error(`${response.error}: ${response.error_description}`);
  }
  return await buildAuthenticatedFetch(fetch, response["access_token"], { dpopKey });
}

async function getContainer(containerUri) {
  const authFetch = await getAuthenticatedFetch();
  const response = await authFetch(containerUri);

  if (response.status != 200) {
    throw new Error(`Got status code ${response.status} when requesting ${containerUri}`);
  }

  const ttl = await response.text();
  const store = rdflib.graph();
  rdflib.parse(ttl, store, containerUri, 'text/turtle');

  return store;
}

export async function getPod(podUri) {
  const visited = [];
  const toVisit = [podUri];
  const store = rdflib.graph();

  while (toVisit.length !== 0) {
    const uri = toVisit.pop();
    visited.push(uri);
    try {
      const currentGraph = await getContainer(uri);

      currentGraph.match(rdflib.sym(uri), LDP('contains'), null).forEach((quad) => {
        if (!visited.includes(quad.object.value) && !toVisit.includes(quad.object.value)) {
          toVisit.push(quad.object.value);
        }
      });

      store.addAll(currentGraph.statements);
    } catch (e) {
      console.error(e);
      continue;
    }
  }

  return store;
}

