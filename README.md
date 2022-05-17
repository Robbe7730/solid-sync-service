# solid-sync-service

Synchronizes the database with a Solid pod, currently only for community servers
and no write-back.

## Config

`.env.example` contains all the environment variables that should be set,
copying this to .env allows them to be used. Otherwise they have to be set
before starting the application

- `TOKEN_ID`: The id of the CSS access token
- `TOKEN_SECRET`: The secret part of the CSS access token
- `POD_BASE`: Base URI of the Solid pod
- `POD_NAME`: Name of the pod (full pod URI will be `POD_BASE`/`POD_NAME`)
