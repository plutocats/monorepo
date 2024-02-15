"use client";

import { Disclosure } from "@headlessui/react";
import { MinusSmallIcon, PlusSmallIcon } from "@heroicons/react/24/outline";

const faqs = [
  {
    question: "Summary",
    answer: `
      <div>
        <p style="margin-bottom: 2rem;">Coming soon to Blast!</p>
        <p>Plutocats is an experiment in social staking. Mint an NFT to join. ETH from the sale of each plutocat is sent to a Reserve that earns Blast native yield. Members can leave the club at anytime to claim their pro rata share of the Reserve.</p>
        <ul style="margin-top:2rem;">
          <li>- Onchain Art</li>
          <li>- Continous Dutch Auction (VRGDA)</li>
          <li>- No pre-minted NFTs or founder allocation</li>
          <li>- Future & Governance Bootstrap (see section below)</li>
        </ul>
      </div>
      `,
  },
  {
    question: "What is a Plutocat?",
    answer:
      "A plutocat is a generative NFT pfp stored entirely onchain. Holding the NFT provides membership to Plutocats, an experiment in social staking.",
  },
  {
    question: "Reserve",
    answer:
      "Proceeds from the sale of each plutocat go to the Reserve. ETH stored in the Reserve accumulates Blast native yield. Members can exit Plutocats at anytime. On exit, members claim their pro rata share of the Reserve in exchange for their NFTs.",
  },
  {
    question: "Dynamic Pricing",
    answer:
      "Membership price is based on a continuous dutch auction (VRGDA). The minimum price is dynamic and equal to plutocat book value (the number of Plutocats in circulation / the amount of ETH in the Reserve). Membership price increases or decreases relative to daily demand.",
  },
  {
    question: "Fair launch and distribution",
    answer:
      "There are no pre-sales, no pre-minted NFTs, and no founder allocation. Plutocats exists as a community owned and directed club for crypto natives and enthusiasts.",
  },
  {
    question: "Future & Governance boostrap",
    answer: `
    <p style="margin-bottom: 2rem;">Initially, all contracts are owned by a bootstrap contract which enables a smooth, trustless start of DAO governance. Soon, we will use the bootstrap contract to propose a migration of contract ownership to a DAO governed by the community.</p><p style="margin-bottom: 2rem;">The bootstrap contract is a simple governor which only allows the creators (wiz, tm0b1l) to propose the DAO address that will become the owner of all Plutocats contracts. We believe that holding proposer rights is important to prevent griefing attacks against members until the transition to a DAO is complete. These proposer rights *do not* enable modification of the Plutocats protocol in any way.</p>

    <p style="margin-bottom: 2rem;">Plutocat holders will vote on the address proposed. If passed, the bootstrap contract will be locked and transfer ownership of all Plutocats contracts to the DAO. Following migration, Blast native yield can only be sent to the DAO treasury. ETH from plutocat sales will continue to collect in the Reserve and members will retain exit functionality (exit to claim pro rata share of Reserve).</p>

    <p style="margin-bottom: 2rem;">Governance rights will be fairly distributed to Plutocats members as erc20 tokens. This token will allow holders to vote on DAO proposals in the future.</p>
    `,
  },
];

export default function FAQ() {
  return (
    <section className="flex flex-col items-center bg-indigo-600">
      <div className="w-full px-5 py-12 sm:px-8 sm:py-24 sm:pb-20">
        <div className="w-full divide-y divide-white/10">
          <h2 className="text-4xl sm:text-6xl font-bold leading-10 tracking-tight text-white">WTF?</h2>
          <dl className="mt-12 space-y-6 divide-y divide-white/10">
            {faqs.map((faq, i) => (
              <Disclosure as="div" key={faq.question + i} className="pt-6">
                {({ open }) => (
                  <>
                    <dt>
                      <Disclosure.Button className="flex w-full items-start justify-between text-left text-white py-6">
                        <span className="text-2xl sm:text-3xl font-semibold leading-7">{faq.question}</span>
                        <span className="ml-6 flex h-7 items-center">
                          {open ? (
                            <MinusSmallIcon className="h-6 w-6" aria-hidden="true" />
                          ) : (
                            <PlusSmallIcon className="h-6 w-6" aria-hidden="true" />
                          )}
                        </span>
                      </Disclosure.Button>
                    </dt>
                    <Disclosure.Panel as="dd" className="mt-6 pr-12">
                      <div
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                        className="text-lg sm:text-2xl !leading-relaxed text-white"
                      ></div>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
