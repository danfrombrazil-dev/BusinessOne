import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import Calculadora from "./Calculadora";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<Calculadora />} />
      </Routes>
    </BrowserRouter>
  );
}
