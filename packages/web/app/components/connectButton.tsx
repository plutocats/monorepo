"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Connect = () => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div>
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="rounded-lg bg-gray-100 hover:bg-opacity-80 px-6 py-3 items-center transition min-w-36"
                  >
                    Connect
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="rounded-lg bg-gray-100 hover:bg-opacity-80 px-6 py-3 items-center transition min-w-36"
                  >
                    Wrong network
                  </button>
                );
              }
              return (
                <button
                  onClick={openAccountModal}
                  type="button"
                  className="rounded-lg bg-gray-100 hover:bg-opacity-80 px-2 py-3 items-center transition min-w-36"
                >
                  {account.displayName}
                </button>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
