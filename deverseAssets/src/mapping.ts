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
  All, AssetToken, ExampleEntity, Owner, AssetTokenOwned
} from "../generated/schema"
import { log, store } from '@graphprotocol/graph-ts'
import { ipfs } from '@graphprotocol/graph-ts'

let ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
let ONE = BigInt.fromI32(1);
let ZERO = BigInt.fromI32(0);

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
  let timestamp = event.block.timestamp;
  let from = event.params.from.toHex();
  let to = event.params.to.toHex();
  let id = event.params.id.toString();
  let quantity = event.params.value;

  let all = All.load('all')
  if (all == null) {
    all = new All('all');
    all.numAssets = ZERO;
  }
  all.lastUpdate = timestamp;

  let assetToken = AssetToken.load(event.params.id.toString())
  if (assetToken == null) {
    let assetContract = Asset.bind(event.address);
    assetToken = new AssetToken(event.params.id.toString())

    assetToken.isNFT = (assetToken.supply == ONE)
    assetToken.tokenURI = assetContract.uri(event.params.id)
  }

  if (from != ADDRESS_ZERO) {
    let currentOwner = Owner.load(from);
    if (currentOwner != null) {
      currentOwner.numAssets = currentOwner.numAssets.minus(quantity);
      if (currentOwner.numAssets.equals(ZERO)) {
        all.numAssetOwners = all.numAssetOwners.minus(ONE);
      }

      let assetTokenOwned = AssetTokenOwned.load(from + '_' + id);
      if (assetTokenOwned != null) {
        assetTokenOwned.quantity = assetTokenOwned.quantity.minus(quantity);
        if (assetTokenOwned.quantity.le(ZERO)) {
          store.remove("AssetTokenOwned", assetTokenOwned.id);
        } else {
          assetTokenOwned.save();
        }
      }
      currentOwner.save();
    } else {
      log.error("error from non existing owner {from} {id}", [from, id]);
    }
    assetToken.supply = assetToken.supply.minus(quantity);
    all.numAssets = all.numAssets.minus(quantity);
  }

  if (to != ADDRESS_ZERO) {
    assetToken.owner = to;

    let newOwner = Owner.load(to);
    if (newOwner == null) {
      newOwner = new Owner(to);
      newOwner.timestamp = timestamp;
      newOwner.numAssets = ZERO;
    }

    assetToken.supply = assetToken.supply.plus(quantity);
    all.numAssets = all.numAssets.plus(quantity);

    let assetTokenOwned = AssetTokenOwned.load(to + '_' + id);
    if (assetTokenOwned == null) {
      assetTokenOwned = new AssetTokenOwned(to + '_' + id);
      assetTokenOwned.owner = newOwner.id;
      assetTokenOwned.token = id;
      assetTokenOwned.quantity = ZERO;
    }
    assetTokenOwned.quantity = assetTokenOwned.quantity.plus(quantity);
    assetTokenOwned.save();

    newOwner.numAssets = newOwner.numAssets.plus(quantity);
    if (newOwner.numAssets.equals(quantity)) {
      all.numAssetOwners = all.numAssetOwners.plus(ONE);
    }
    newOwner.save();
  } else {
    // ---------------------------------------------------------------------------------------------------------------
    // - TO ZERO ADDRESS: BURN (or void ?)
    // ---------------------------------------------------------------------------------------------------------------
    store.remove("AssetToken", assetToken.id);
  }

  assetToken.save()
  all.save()
}

export function handleTransferBatch(event: TransferBatch): void {}

export function handleURI(event: URI): void {}

export function handleSuperOperator(event: SuperOperator): void {}

export function handleAdminChanged(event: AdminChanged): void {}
