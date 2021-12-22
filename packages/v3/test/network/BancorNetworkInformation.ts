import Contracts from '../../components/Contracts';
import { TokenGovernance } from '../../components/LegacyContracts';
import {
    BancorNetworkInfo,
    MasterVault,
    ExternalProtectionVault,
    ExternalRewardsVault,
    IERC20,
    IPoolToken,
    NetworkSettings,
    PoolToken,
    TestBancorNetwork,
    TestMasterPool,
    TestPendingWithdrawals,
    TestPoolCollection,
    TestPoolCollectionUpgrader
} from '../../typechain-types';
import { ZERO_ADDRESS, MAX_UINT256, BNT, ETH, TKN } from '../helpers/Constants';
import { createSystem, depositToPool, setupSimplePool, PoolSpec, initWithdraw } from '../helpers/Factory';
import { shouldHaveGap } from '../helpers/Proxy';
import { latest } from '../helpers/Time';
import { toWei } from '../helpers/Types';
import { createWallet, TokenWithAddress } from '../helpers/Utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, Wallet } from 'ethers';
import { ethers } from 'hardhat';

describe('BancorNetworkInfo', () => {
    let deployer: SignerWithAddress;

    shouldHaveGap('BancorNetworkInfo');

    before(async () => {
        [deployer] = await ethers.getSigners();
    });

    describe('construction', () => {
        let network: TestBancorNetwork;
        let networkToken: IERC20;
        let govToken: IERC20;
        let networkInfo: BancorNetworkInfo;
        let networkSettings: NetworkSettings;
        let networkTokenGovernance: TokenGovernance;
        let govTokenGovernance: TokenGovernance;
        let masterPool: TestMasterPool;
        let masterPoolToken: IPoolToken;
        let poolCollectionUpgrader: TestPoolCollectionUpgrader;
        let masterVault: MasterVault;
        let externalProtectionVault: ExternalProtectionVault;
        let externalRewardsVault: ExternalRewardsVault;
        let pendingWithdrawals: TestPendingWithdrawals;

        beforeEach(async () => {
            ({
                network,
                networkToken,
                govToken,
                networkInfo,
                networkSettings,
                networkTokenGovernance,
                govTokenGovernance,
                masterPool,
                masterPoolToken,
                poolCollectionUpgrader,
                masterVault,
                externalProtectionVault,
                externalRewardsVault,
                pendingWithdrawals
            } = await createSystem());
        });

        it('should revert when attempting to create with an invalid network contract', async () => {
            await expect(
                Contracts.BancorNetworkInfo.deploy(
                    ZERO_ADDRESS,
                    networkTokenGovernance.address,
                    govTokenGovernance.address,
                    networkSettings.address,
                    masterVault.address,
                    externalProtectionVault.address,
                    externalRewardsVault.address,
                    masterPool.address,
                    pendingWithdrawals.address,
                    poolCollectionUpgrader.address
                )
            ).to.be.revertedWith('InvalidAddress');
        });

        it('should revert when attempting to create with an invalid network token governance contract', async () => {
            await expect(
                Contracts.BancorNetworkInfo.deploy(
                    network.address,
                    ZERO_ADDRESS,
                    govTokenGovernance.address,
                    networkSettings.address,
                    masterVault.address,
                    externalProtectionVault.address,
                    externalRewardsVault.address,
                    masterPool.address,
                    pendingWithdrawals.address,
                    poolCollectionUpgrader.address
                )
            ).to.be.revertedWith('InvalidAddress');
        });

        it('should revert when attempting to create with an invalid gov token governance contract', async () => {
            await expect(
                Contracts.BancorNetworkInfo.deploy(
                    network.address,
                    networkTokenGovernance.address,
                    ZERO_ADDRESS,
                    networkSettings.address,
                    masterVault.address,
                    externalProtectionVault.address,
                    externalRewardsVault.address,
                    masterPool.address,
                    pendingWithdrawals.address,
                    poolCollectionUpgrader.address
                )
            ).to.be.revertedWith('InvalidAddress');
        });

        it('should revert when attempting to create with an invalid network settings contract', async () => {
            await expect(
                Contracts.BancorNetworkInfo.deploy(
                    network.address,
                    networkTokenGovernance.address,
                    govTokenGovernance.address,
                    ZERO_ADDRESS,
                    masterVault.address,
                    externalProtectionVault.address,
                    externalRewardsVault.address,
                    masterPool.address,
                    pendingWithdrawals.address,
                    poolCollectionUpgrader.address
                )
            ).to.be.revertedWith('InvalidAddress');
        });

        it('should revert when attempting to create with an invalid master vault contract', async () => {
            await expect(
                Contracts.BancorNetworkInfo.deploy(
                    network.address,
                    networkTokenGovernance.address,
                    govTokenGovernance.address,
                    networkSettings.address,
                    ZERO_ADDRESS,
                    externalProtectionVault.address,
                    externalRewardsVault.address,
                    masterPool.address,
                    pendingWithdrawals.address,
                    poolCollectionUpgrader.address
                )
            ).to.be.revertedWith('InvalidAddress');
        });

        it('should revert when attempting to create with an invalid external protection vault contract', async () => {
            await expect(
                Contracts.BancorNetworkInfo.deploy(
                    network.address,
                    networkTokenGovernance.address,
                    govTokenGovernance.address,
                    networkSettings.address,
                    masterVault.address,
                    ZERO_ADDRESS,
                    externalRewardsVault.address,
                    masterPool.address,
                    pendingWithdrawals.address,
                    poolCollectionUpgrader.address
                )
            ).to.be.revertedWith('InvalidAddress');
        });

        it('should revert when attempting to create with an invalid external rewards vault contract', async () => {
            await expect(
                Contracts.BancorNetworkInfo.deploy(
                    network.address,
                    networkTokenGovernance.address,
                    govTokenGovernance.address,
                    networkSettings.address,
                    masterVault.address,
                    externalProtectionVault.address,
                    ZERO_ADDRESS,
                    masterPool.address,
                    pendingWithdrawals.address,
                    poolCollectionUpgrader.address
                )
            ).to.be.revertedWith('InvalidAddress');
        });

        it('should revert when attempting to create with an invalid master pool contract', async () => {
            await expect(
                Contracts.BancorNetworkInfo.deploy(
                    network.address,
                    networkTokenGovernance.address,
                    govTokenGovernance.address,
                    networkSettings.address,
                    masterVault.address,
                    externalProtectionVault.address,
                    externalRewardsVault.address,
                    ZERO_ADDRESS,
                    pendingWithdrawals.address,
                    poolCollectionUpgrader.address
                )
            ).to.be.revertedWith('InvalidAddress');
        });

        it('should revert when attempting to create with an invalid pending withdrawals contract', async () => {
            await expect(
                Contracts.BancorNetworkInfo.deploy(
                    network.address,
                    networkTokenGovernance.address,
                    govTokenGovernance.address,
                    networkSettings.address,
                    masterVault.address,
                    externalProtectionVault.address,
                    externalRewardsVault.address,
                    masterPool.address,
                    ZERO_ADDRESS,
                    poolCollectionUpgrader.address
                )
            ).to.be.revertedWith('InvalidAddress');
        });

        it('should revert when attempting to create with an invalid pool collection upgrader contract', async () => {
            await expect(
                Contracts.BancorNetworkInfo.deploy(
                    network.address,
                    networkTokenGovernance.address,
                    govTokenGovernance.address,
                    networkSettings.address,
                    masterVault.address,
                    externalProtectionVault.address,
                    externalRewardsVault.address,
                    masterPool.address,
                    pendingWithdrawals.address,
                    ZERO_ADDRESS
                )
            ).to.be.revertedWith('InvalidAddress');
        });

        it('should be properly initialized', async () => {
            expect(await networkInfo.version()).to.equal(1);

            expect(await networkInfo.network()).to.equal(network.address);
            expect(await networkInfo.networkToken()).to.equal(networkToken.address);
            expect(await networkInfo.networkTokenGovernance()).to.equal(networkTokenGovernance.address);
            expect(await networkInfo.govToken()).to.equal(govToken.address);
            expect(await networkInfo.govTokenGovernance()).to.equal(govTokenGovernance.address);
            expect(await networkInfo.networkSettings()).to.equal(networkSettings.address);
            expect(await networkInfo.masterVault()).to.equal(masterVault.address);
            expect(await networkInfo.externalProtectionVault()).to.equal(externalProtectionVault.address);
            expect(await networkInfo.externalRewardsVault()).to.equal(externalRewardsVault.address);
            expect(await networkInfo.masterPool()).to.equal(masterPool.address);
            expect(await networkInfo.masterPoolToken()).to.equal(masterPoolToken.address);
            expect(await networkInfo.pendingWithdrawals()).to.equal(pendingWithdrawals.address);
            expect(await networkInfo.poolCollectionUpgrader()).to.equal(poolCollectionUpgrader.address);
        });
    });

    describe('trade amounts', () => {
        let network: TestBancorNetwork;
        let networkInfo: BancorNetworkInfo;
        let networkSettings: NetworkSettings;
        let networkToken: IERC20;
        let poolCollection: TestPoolCollection;

        let sourceToken: TokenWithAddress;
        let targetToken: TokenWithAddress;

        let trader: Wallet;

        const INITIAL_RATE = { n: 1, d: 2 };
        const MIN_LIQUIDITY_FOR_TRADING = toWei(100_000);
        const NETWORK_TOKEN_LIQUIDITY = toWei(100_000);

        beforeEach(async () => {
            ({ network, networkToken, networkInfo, networkSettings, poolCollection } = await createSystem());

            await networkSettings.setMinLiquidityForTrading(MIN_LIQUIDITY_FOR_TRADING);
        });

        const setupPools = async (source: PoolSpec, target: PoolSpec) => {
            trader = await createWallet();

            ({ token: sourceToken } = await setupSimplePool(
                source,
                deployer,
                network,
                networkInfo,
                networkSettings,
                poolCollection
            ));

            ({ token: targetToken } = await setupSimplePool(
                target,
                deployer,
                network,
                networkInfo,
                networkSettings,
                poolCollection
            ));

            await depositToPool(deployer, networkToken, NETWORK_TOKEN_LIQUIDITY, network);

            await network.setTime(await latest());
        };

        interface TradeAmountsOverrides {
            sourceTokenAddress?: string;
            targetTokenAddress?: string;
        }
        const tradeTargetAmount = async (amount: number, overrides: TradeAmountsOverrides = {}) => {
            const { sourceTokenAddress = sourceToken.address, targetTokenAddress = targetToken.address } = overrides;

            return networkInfo.tradeTargetAmount(sourceTokenAddress, targetTokenAddress, amount);
        };

        const tradeSourceAmount = async (amount: number, overrides: TradeAmountsOverrides = {}) => {
            const { sourceTokenAddress = sourceToken.address, targetTokenAddress = targetToken.address } = overrides;

            return networkInfo.tradeSourceAmount(sourceTokenAddress, targetTokenAddress, amount);
        };

        const testTradesAmounts = (source: PoolSpec, target: PoolSpec) => {
            const isSourceETH = source.symbol === ETH;

            context(`when trading from ${source.symbol} to ${target.symbol}`, () => {
                const testAmount = 1000;

                beforeEach(async () => {
                    await setupPools(source, target);

                    if (!isSourceETH) {
                        const reserveToken = await Contracts.TestERC20Token.attach(sourceToken.address);

                        await reserveToken.transfer(await trader.getAddress(), testAmount);
                        await reserveToken.connect(trader).approve(network.address, testAmount);
                    }
                });

                it('should revert when attempting to query using an invalid source pool', async () => {
                    await expect(
                        tradeTargetAmount(testAmount, { sourceTokenAddress: ZERO_ADDRESS })
                    ).to.be.revertedWith('InvalidAddress');
                    await expect(
                        tradeSourceAmount(testAmount, { sourceTokenAddress: ZERO_ADDRESS })
                    ).to.be.revertedWith('InvalidAddress');
                });

                it('should revert when attempting to query using an invalid target pool', async () => {
                    await expect(
                        tradeTargetAmount(testAmount, { targetTokenAddress: ZERO_ADDRESS })
                    ).to.be.revertedWith('InvalidAddress');
                    await expect(
                        tradeSourceAmount(testAmount, { targetTokenAddress: ZERO_ADDRESS })
                    ).to.be.revertedWith('InvalidAddress');
                });

                it('should revert when attempting to  query using an invalid amount', async () => {
                    const amount = 0;

                    await expect(tradeTargetAmount(amount)).to.be.revertedWith('ZeroValue');
                    await expect(tradeSourceAmount(amount)).to.be.revertedWith('ZeroValue');
                });

                it('should revert when attempting to query using unsupported tokens', async () => {
                    const reserveToken2 = await Contracts.TestERC20Token.deploy(TKN, TKN, 1_000_000);

                    await reserveToken2.transfer(await trader.getAddress(), testAmount);
                    await reserveToken2.connect(trader).approve(network.address, testAmount);

                    // unknown source token
                    await expect(
                        tradeTargetAmount(testAmount, { sourceTokenAddress: reserveToken2.address })
                    ).to.be.revertedWith('InvalidToken');
                    await expect(
                        tradeSourceAmount(testAmount, { sourceTokenAddress: reserveToken2.address })
                    ).to.be.revertedWith('InvalidToken');

                    // unknown target token
                    await expect(
                        tradeTargetAmount(testAmount, { targetTokenAddress: reserveToken2.address })
                    ).to.be.revertedWith('InvalidToken');
                    await expect(
                        tradeSourceAmount(testAmount, { targetTokenAddress: reserveToken2.address })
                    ).to.be.revertedWith('InvalidToken');
                });

                it('should revert when attempting to query using same source and target tokens', async () => {
                    await expect(
                        tradeTargetAmount(testAmount, { targetTokenAddress: sourceToken.address })
                    ).to.be.revertedWith('InvalidTokens');
                    await expect(
                        tradeSourceAmount(testAmount, { targetTokenAddress: sourceToken.address })
                    ).to.be.revertedWith('InvalidTokens');
                });
            });
        };

        for (const [sourceSymbol, targetSymbol] of [
            [TKN, BNT],
            [TKN, ETH],
            [`${TKN}1`, `${TKN}2`],
            [BNT, ETH],
            [BNT, TKN],
            [ETH, BNT],
            [ETH, TKN]
        ]) {
            // perform a basic/sanity suite over a fixed input
            testTradesAmounts(
                {
                    symbol: sourceSymbol,
                    balance: toWei(1_000_000),
                    requestedLiquidity: toWei(1_000_000).mul(1000),
                    initialRate: INITIAL_RATE
                },
                {
                    symbol: targetSymbol,
                    balance: toWei(5_000_000),
                    requestedLiquidity: toWei(5_000_000).mul(1000),
                    initialRate: INITIAL_RATE
                }
            );
        }
    });

    describe('pending withdrawals', () => {
        let poolToken: PoolToken;
        let networkInfo: BancorNetworkInfo;
        let networkSettings: NetworkSettings;
        let network: TestBancorNetwork;
        let networkToken: IERC20;
        let pendingWithdrawals: TestPendingWithdrawals;
        let poolCollection: TestPoolCollection;

        let provider: SignerWithAddress;
        let poolTokenAmount: BigNumber;

        const MIN_LIQUIDITY_FOR_TRADING = toWei(100_000);

        before(async () => {
            [, provider] = await ethers.getSigners();
        });

        beforeEach(async () => {
            ({ network, networkToken, networkInfo, networkSettings, poolCollection, pendingWithdrawals } =
                await createSystem());

            await networkSettings.setMinLiquidityForTrading(MIN_LIQUIDITY_FOR_TRADING);
            await networkSettings.setPoolMintingLimit(networkToken.address, MAX_UINT256);

            await pendingWithdrawals.setTime(await latest());

            ({ poolToken } = await setupSimplePool(
                {
                    symbol: TKN,
                    balance: toWei(1_000_000),
                    requestedLiquidity: toWei(1_000_000).mul(1000),
                    initialRate: { n: 1, d: 2 }
                },
                provider,
                network,
                networkInfo,
                networkSettings,
                poolCollection
            ));

            poolTokenAmount = await poolToken.balanceOf(provider.address);
        });

        it('should return withdrawal status', async () => {
            const { id, creationTime } = await initWithdraw(
                provider,
                network,
                pendingWithdrawals,
                poolToken,
                poolTokenAmount
            );

            expect(await networkInfo.isReadyForWithdrawal(id)).to.be.false;

            const withdrawalDuration =
                (await pendingWithdrawals.lockDuration()) + (await pendingWithdrawals.withdrawalWindowDuration());
            await pendingWithdrawals.setTime(creationTime + withdrawalDuration - 1);

            expect(await networkInfo.isReadyForWithdrawal(id)).to.be.true;
        });
    });
});
