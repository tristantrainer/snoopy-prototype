import AccountsList from '@/components/accounts/AccountsList/AccountsList'
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

loadDevMessages();
loadErrorMessages();

export default function Home() {
  return (
    <main>
      {/* <AccountsList /> */}
    </main>
  )
}
