import * as actions from "./actions";
import Mint from "./mint";

export default async function Page() {
  let recentMints = [];
  try {
    recentMints = await actions.recentMints();
  } catch (ex) {}

  return <Mint mints={recentMints} />;
}
