"use client";

import { ColorRing } from "react-loader-spinner";
import { useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import * as dn from "dnum";
import { useBlock, BaseError } from "wagmi";
import { decodeEventLog, formatEther, parseAbi } from "viem";
import plutocatsTokenABI from "@/app/abi/PlutocatsToken";
import marketBuyerABI from "@/app/abi/MarketBuyer";
import Plutocat from "./plutocat";
import { Switch } from "@headlessui/react";
import cx from "classnames";
import ENSAccount from "@/app/components/ens/ensAccount";
import { config, getChains, mainnetConfig } from "@/rainbowConfig";
import { getPublicClient } from "@wagmi/core";
import * as actions from "./actions";
import { bgColors } from "@/lib/art";
import { useConnectModal } from "@rainbow-me/rainbowkit";

/// the type of a token minted
type Token = {
  id: bigint;
  seed: any;
};

/// map to handle deduping subgraph requests on server / page load
const fetchMap = new Map<string, Promise<any>>();
const query = ({ key, fn }: { key: string; fn: (key: string) => Promise<any> }) => {
  if (!fetchMap.has(key)) {
    fetchMap.set(key, fn(key));
  }

  return fetchMap.get(key)!;
};

export default function Mint({ mints }: any) {
  const defaultChainId = getChains()[0].id;
  const [turboModeEnabled, setTurboModeEnabled] = useState(false);
  const [lastMintedToken, setLastMintedToken] = useState<Token | undefined>(undefined);
  const [recentMints, setRecentMints] = useState(mints);
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState(false);
  const ensPublicClient = getPublicClient(mainnetConfig);
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  /// subscribe to latest block
  const { data: block, queryKey: blockQueryKey } = useBlock({ watch: true, chainId: defaultChainId });
  const queryClient = useQueryClient();
  /// ========

  /// data fetching
  const { data: plutocatPrice, queryKey: priceQueryKey } = useReadContract({
    abi: plutocatsTokenABI,
    address: process.env.NEXT_PUBLIC_TOKEN! as `0x${string}`,
    functionName: "getPrice",
    chainId: defaultChainId,
  });

  const { data: totalSupply, queryKey: totalSupplyQueryKey } = useReadContract({
    abi: plutocatsTokenABI,
    address: process.env.NEXT_PUBLIC_TOKEN! as `0x${string}`,
    functionName: "totalSupply",
    chainId: defaultChainId,
  });
  /// ========

  /// mint tx and form handling
  const { data: mintHash, isPending, writeContract, error } = useWriteContract();
  const { data: mintReceipt } = useWaitForTransactionReceipt({
    hash: mintHash,
    confirmations: 2,
    query: {
      enabled: !!mintHash,
    },
    chainId: defaultChainId,
  });

  const {
    data: marketBuyHash,
    isPending: isPendingMarket,
    writeContract: writeContractMarket,
    error: errorMarket,
  } = useWriteContract();
  const { data: marketReceipt } = useWaitForTransactionReceipt({
    hash: marketBuyHash,
    confirmations: 2,
    query: {
      enabled: !!marketBuyHash,
    },
    chainId: defaultChainId,
  });

  useEffect(() => {
    if (mintReceipt) {
      // after mint get art to be rendered
      mintReceipt.logs.forEach((log) => {
        try {
          const decoded = decodeEventLog({ ...log, abi: plutocatsTokenABI });
          if (decoded.eventName === "PlutocatPurchased") {
            setLastMintedToken({
              id: decoded.args.tokenId,
              seed: decoded.args.seed,
            });

            setMinting(false);
          }
        } catch (ex) {}
        return;
      });
    }
  }, [mintReceipt]);

  useEffect(() => {
    if (marketReceipt) {
      // after mint get art to be rendered
      marketReceipt.logs.forEach((log) => {
        try {
          const decoded = decodeEventLog({ ...log, abi: plutocatsTokenABI });
          if (decoded.eventName === "PlutocatPurchased") {
            setLastMintedToken({
              id: decoded.args.tokenId,
              seed: decoded.args.seed,
            });

            setMinting(false);
          }
        } catch (ex) {}
        return;
      });
    }
  }, [marketReceipt]);

  const submit = async function () {
    let mintPrice = plutocatPrice || BigInt(1);
    if (turboModeEnabled) {
      mintPrice = mintPrice + (mintPrice * BigInt(10)) / BigInt(100);

      // use market buyer
      try {
        setMinting(true);
        writeContractMarket({
          abi: marketBuyerABI,
          address: process.env.NEXT_PUBLIC_MARKET_BUYER! as `0x${string}`,
          functionName: "buy",
          args: [],
          value: mintPrice,
        });
      } catch (ex) {
        console.log("writeContractMarket", ex);
        setMinting(false);
        setMintError(true);
      }

      return;
    }

    try {
      setMinting(true);
      writeContract({
        abi: plutocatsTokenABI,
        address: process.env.NEXT_PUBLIC_TOKEN! as `0x${string}`,
        functionName: "mint",
        args: [],
        value: mintPrice,
      });
    } catch (ex) {
      console.log("writeContract", ex);
      setMinting(false);
      setMintError(true);
    }
  };
  /// ========

  /// get recent mints on page load
  useEffect(() => {
    const fn = async () => {
      try {
        const mints = await query({
          key: `recentMints`,
          fn: actions.recentMints,
        });

        setRecentMints(mints || []);
      } catch (ex) {}
    };

    fn();
  }, []);

  /// refresh data every block
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: blockQueryKey });
    queryClient.invalidateQueries({ queryKey: priceQueryKey });
    queryClient.invalidateQueries({ queryKey: totalSupplyQueryKey });

    if (mintError) {
      setTimeout(() => {
        setMintError(false);
      }, 1000);
    }

    if ((error || errorMarket) && minting) {
      setMinting(false);
      setMintError(true);
    }
  }, [block, queryClient]);

  useEffect(() => {
    const fn = async () => {
      const mints = await actions.recentMints();
      setRecentMints(mints || []);
    };

    fn();
  }, [block?.number]);
  /// ========

  /// price rendering
  const pPrice = plutocatPrice || BigInt(0);

  let mintPrice = dn.format(dn.from(formatEther(pPrice)), { digits: 4 });
  let turboMintPrice = mintPrice;
  if (turboModeEnabled) {
    const turboPrice = pPrice + (pPrice * BigInt(10)) / BigInt(100);
    turboMintPrice = dn.format(dn.from(formatEther(turboPrice)), { digits: 4 });
  }
  /// =========

  /// network verification
  const chainId = useChainId();
  const isDefaultChain = chainId === getChains()[0].id;
  const { switchChain } = useSwitchChain();

  const getFormError = (error: BaseError) => {
    if (error.shortMessage.includes("reverted") || error.message.includes("reverted"))
      return "Mint failed. If there is currently high demand, Turbo Mode™️ can help increase the odds of a successful mint.";
    return error.shortMessage || error.message;
  };

  return (
    <div className="flex flex-col lg:flex-row lg:flex-nowrap mx-auto w-full h-full overflow-hidden" style={{ flex: 1 }}>
      <div
        className="flex basis-1/3 lg:basis-2/3 grow flex-col w-full h-full relative items-center justify-center bg-gray-100 rounded-tr"
        style={lastMintedToken ? { background: `#${bgColors[lastMintedToken.seed.background]}` } : {}}
      >
        <div className="relative h-full lg:h-[calc(100vh-96px)] w-full justify-center flex items-center pb-12">
          <div className="flex justify-center items-center py-4">
            <Plutocat seed={lastMintedToken?.seed} block={block} hasError={mintError} />
          </div>
        </div>
        {!lastMintedToken ? (
          <p className="absolute bottom-2 right-8 font-mono text-xs">Mint to reveal · {Number(block?.number) || 0}</p>
        ) : (
          <p className="absolute bottom-2 right-6 font-mono text-xs">Minted · {Number(block?.number) || 0}</p>
        )}
      </div>
      <div className="basis-1/3 lg:h-fit shrink lg:basis-1/3 px-8 relative w-full lg:min-w-[469px] h-full max-h-[calc(100vh-96px)]">
        <div className="py-8 mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold font-mono truncate prose">
            Plutocat #{totalSupply?.toString() || "0"}
          </h1>
          <p className="prose mt-2">
            Mint a cat to join! For more info on Plutocats please read{" "}
            <a
              className="text-blue-500 underline"
              href="https://mirror.xyz/tm0b1l.eth/URgZgA36Hhceg34yXbBOuwwcBRzV_416QATHX1pFu3k"
            >
              this blog post
            </a>
            .
          </p>
          <div
            className="w-full my-4 mb-5 bg-gray-100 rounded-lg py-4 px-4 cursor-pointer"
            onClick={() => setTurboModeEnabled(!turboModeEnabled)}
          >
            <Switch.Group as="div" className="flex items-center justify-between">
              <span className="flex flex-grow flex-col">
                <Switch.Label as="span" className="text-sm font-medium leading-6 text-gray-900" passive>
                  Turbo ⚡️
                </Switch.Label>
                <Switch.Description as="span" className="text-sm text-gray-500 pr-4">
                  Apply a 10% premium to increase the probability of mint during periods of high demand. Excess ETH is
                  refunded.
                </Switch.Description>
              </span>
              <Switch
                checked={turboModeEnabled}
                onChange={setTurboModeEnabled}
                className={cx(
                  turboModeEnabled ? "bg-black" : "bg-gray-300",
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    turboModeEnabled ? "translate-x-5" : "translate-x-0",
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                  )}
                />
              </Switch>
            </Switch.Group>
          </div>
          {(() => {
            if (!isDefaultChain) {
              return (
                <button
                  type="button"
                  className="w-full text-center bg-black hover:bg-opacity-80 transition-all rounded-full px-3 py-[1.25rem] mt-3 text-white flex justify-center items-center"
                  onClick={(e) => {
                    switchChain({ chainId: getChains()[0].id });
                  }}
                >
                  Switch Network
                </button>
              );
            }

            // skip if we are in a minting state
            if (!minting) {
              // after minted state
              if (lastMintedToken) {
                return (
                  <button
                    type="button"
                    className="w-full text-center bg-black hover:bg-opacity-80 transition-all rounded-full px-3 py-[1.25rem] mt-3 text-white flex justify-center items-center"
                    onClick={(e) => {
                      // show random animation if want to mint another token
                      setLastMintedToken(undefined);
                    }}
                  >
                    Mint another
                  </button>
                );
              }

              return (
                <>
                  <button
                    type="button"
                    disabled={isPending || isPendingMarket}
                    className="w-full text-center bg-black hover:bg-opacity-80 transition-all rounded-full px-3 py-[1.25rem] mt-3 text-white flex justify-center items-center"
                    onClick={(e) => {
                      if (!isConnected) {
                        if (openConnectModal) {
                          openConnectModal();
                        }

                        return;
                      }

                      submit();
                    }}
                  >
                    Mint for{" "}
                    {turboModeEnabled ? (
                      <span className="px-1">
                        max <s className="text-red-400">{mintPrice}</s> {turboMintPrice}
                      </span>
                    ) : (
                      mintPrice
                    )}{" "}
                    ETH
                  </button>
                  {turboModeEnabled ? (
                    <span className="w-full text-center py-1 block opacity-70 text-xs">Excess ETH is refunded</span>
                  ) : null}
                </>
              );
            }

            // we are currently mining a tx
            return (
              <button
                type="button"
                disabled={isPending || isPendingMarket}
                className="w-full text-center bg-black rounded-full px-3 py-[1.25rem] text-white mt-5 flex justify-center items-center gap-2 cursor-not-allowed"
              >
                Minting
                <ColorRing visible={true} height="24" width="24" colors={["#fff", "#fff", "#fff", "#fff", "#fff"]} />
              </button>
            );
          })()}
          {(error || errorMarket) && (
            <p
              className="w-full text-center text-sm mt-2 mx-auto opacity-70 font-semibold px-2"
              style={{ color: "#ff0000" }}
            >
              {getFormError((error || errorMarket) as BaseError)}
            </p>
          )}
          {recentMints?.length ? (
            <>
              <hr className="my-8 mb-6" />
              <section className="prose h-full">
                <h2 className="mt-0">Recent mints</h2>
                <ol className="w-full overflow-y-scroll h-[100%] h-full text-sm">
                  {recentMints?.map((item: any, i: number) => {
                    return (
                      <li className="w-full flex my-2" key={i}>
                        <span className="block w-7">{item.tokenId}.</span>
                        <div className="flex flex-row gap- w-full items-center text-sm gap-2">
                          <span className="min-w-20">
                            <span className="text-sm">Ξ</span>
                            {dn.format(dn.from(formatEther(item.amount)), { digits: 4 })}
                          </span>
                          <ENSAccount address={item.msgSender} turbo={item.turbo} client={ensPublicClient} />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
