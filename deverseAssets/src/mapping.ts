import { BigInt } from "@graphprotocol/graph-ts"
import {
  Asset,
  CreatorshipTransfer,
  DebugEvent,
  BouncerAdminChanged,
  Bouncer,
  MetaTransactionProcessor,
  Extraction,
  AssetUpdate,
  Transfer,
  Approval,
  ApprovalForAll,
  TransferSingle,
  TransferBatch,
  URI,
  SuperOperator,
  AdminChanged
} from "../generated/Asset/Asset"
import {
  All, AssetToken, ExampleEntity
} from "../generated/schema"
import { log } from '@graphprotocol/graph-ts'
import { ipfs } from '@graphprotocol/graph-ts'

export function handleCreatorshipTransfer(event: CreatorshipTransfer): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let entity = ExampleEntity.load(event.transaction.from.toHex())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if (!entity) {
    entity = new ExampleEntity(event.transaction.from.toHex())

    // Entity fields can be set using simple assignments
    entity.count = BigInt.fromI32(0)
  }

  // BigInt and BigDecimal math are supported
  entity.count = entity.count + BigInt.fromI32(1)

  // Entity fields can be set based on event parameters
  entity.original = event.params.original
  entity.from = event.params.from

  // Entities can be written to the store with `.save()`
  entity.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //
  // let contract = Contract.bind(event.address)
  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract.balanceOf(...)
  // - contract.supportsInterface(...)
  // - contract.name(...)
  // - contract.getApproved(...)
  // - contract.uri(...)
  // - contract.collectionIndexOf(...)
  // - contract.isBouncer(...)
  // - contract.balanceOfBatch(...)
  // - contract.creatorOf(...)
  // - contract.uri2(...)
  // - contract.basePrefixTokenURI(...)
  // - contract.ownerOf(...)
  // - contract.isSuperOperator(...)
  // - contract.getAdmin(...)
  // - contract.balanceOf(...)
  // - contract.rarity(...)
  // - contract.isPackIdUsed(...)
  // - contract.symbol(...)
  // - contract.getBouncerAdmin(...)
  // - contract._metadataHash(...)
  // - contract.isCollection(...)
  // - contract.collectionOf(...)
  // - contract.tokenURI(...)
  // - contract.mint(...)
  // - contract.wasEverMinted(...)
  // - contract.isMetaTransactionProcessor(...)
  // - contract.isApprovedForAll(...)
  // - contract.baseSuffixTokenURI(...)
  // - contract.mintMultiple(...)
}

export function handleDebugEvent(event: DebugEvent): void {}

export function handleBouncerAdminChanged(event: BouncerAdminChanged): void {}

export function handleBouncer(event: Bouncer): void {}

export function handleMetaTransactionProcessor(
  event: MetaTransactionProcessor
): void {}

export function handleExtraction(event: Extraction): void {}

export function handleAssetUpdate(event: AssetUpdate): void {}

export function handleTransfer(event: Transfer): void {}

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleTransferSingle(event: TransferSingle): void {
  log.debug("Handle Transfer Single, {}", [event.params.value.toI32().toString()]);
  let all = All.load('all')
  if (all == null) {
    all = new All('all');
    all.numAssets = 0;
  }

  let assetToken = AssetToken.load(event.params.id.toString())
  if (assetToken == null) {
    let assetContract = Asset.bind(event.address);
    assetToken = new AssetToken(event.params.id.toString())

    assetToken.supply = event.params.value.toI32()
    assetToken.isNFT = (assetToken.supply == 1)
    assetToken.tokenURI = assetContract.uri(event.params.id)
    all.numAssets = all.numAssets + 1
  }
  assetToken.save()
  all.save()
}

export function handleTransferBatch(event: TransferBatch): void {}

export function handleURI(event: URI): void {}

export function handleSuperOperator(event: SuperOperator): void {}

export function handleAdminChanged(event: AdminChanged): void {}
