import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

function App() {
  return (
    <div>
      <h1>HOME PAGE</h1>

      <SignedOut>
        <SignInButton mode="modal" /> {/* modal means wont open a new window for the sign in*/}
      </SignedOut>

      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}

export default App;
