Asset subgraph

https://thegraph.com/hosted-service/subgraph/lth08091998/deverseassets

0x4663526746b8fDC6e67EEe35489f2D7706754d63
graph init --product hosted-service lth08091998/deverseAssets
/Users/hieuletrung/repos/side_projects/deverse/asset-subgraph/smart-contracts/artifacts/contracts/v2/Asset.sol/Asset.json

# redeploy with `graph codegen && graph build`
graph auth --product hosted-service 1bda92eaa3e3453ab87e7bd93d7788fd
graph deploy --product hosted-service lth08091998/deverseAssets
