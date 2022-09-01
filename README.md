# stac-api-selective-ingester
Utility that ingest the stac collection(s) and it's items from source
stac-api into target-api.
<br>

## How it works
The /search endpoint is called on the source stac-api and the retreived
records are added into the target stac-api.
<br>
The search parameters can be passed trough on a ingest request, togather
with any other optional flags (for example to replace already present records or not).

### Starting the ingest


## Deploying
Meant to be running on Azure serverless ACI. Will run the selective ingestation
once the ingest request is sent.

## Environment Variables

| Env var | Used for | Default |
| --- | --- | --- |