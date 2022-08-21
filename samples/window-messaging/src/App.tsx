import "./App.css";
import ChildFrame from "./components/ChildFrame";
import ParentFrame from "./components/ParentFrame";

function App() {
  // If this app is not in an iFrame, render the parent frame.
  // Otherwise, render the child frame.
  const isParent = window.self === window.top;
  return (
    <div className="App">
      <h1>{isParent ? "Parent Test" : "Child Test"}</h1>
      {isParent && <ParentFrame />}
      {!isParent && <ChildFrame />}
    </div>
  );
}

export default App;
