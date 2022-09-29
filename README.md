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

Make a post request to / endpoint.
<br>
At minimum, your request must have source and target stac api urls. You should have get request permision for source stac-api and get,post and put request permision on target stac-api server.
<br>
Additional "update" paramter can be set to true, which will do an update of items which are already present on the stac-api server.
<br>
In addition to target and source stac api urls, all aditional search query params from official stac-item search standard can be used. <br> 
Those are available at: https://github.com/radiantearth/stac-api-spec/tree/main/item-search#Query%20Parameter%20Table <br>


## Deploying
Meant to be running on Azure serverless ACI.
## Environment Variables

| Env var | Used for | Default |
| --- | --- | --- |
|STAC_API_SELECTIVE_INGESTER_PROVIDER_SET_HOST_PROVIDER| Set our details as external provider for providers entry in stac record| True|
|STAC_API_SELECTIVE_INGESTER_PROVIDER_NAME| Setting ourselves as provider for stac-api-server stac entry| Sattelite Applications Catapult|
|STAC_API_SELECTIVE_INGESTER_PROVIDER_URL| Our organisation provider URL (i.e. organisation website) | https://sa.catapult.org.uk/|