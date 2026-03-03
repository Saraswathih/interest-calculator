import { Routes, Route } from "react-router-dom";

import AppLayout from "./layout/AppLayout";

import Home from "./pages/Home";
import Reports from "./pages/Reports";
import Portfolio from "./pages/Portfolio";
import Investments from "./pages/Investments";
import Profile from "./pages/Profile";
import Money from "./pages/Money";

/* Payment flow pages */
import Payment from "./pages/payment/Payment";
import SelectCard from "./pages/payment/SelectCard";
import AddCard from "./pages/payment/AddCard";
import EnterPin from "./pages/payment/EnterPin";
import PaymentSuccess from "./pages/payment/PaymentSuccess";

import AddCustomer from "./pages/AddCustomer";
import AddTransaction from "./pages/AddTransaction";
import InterestCalculator from "./InterestCalculator";
import AddInvestor from "./pages/AddInvestor";

import Reminders from "./pages/Reminders";
import InvestorDetails from "./pages/InvestorDetails";
import EditInvestor from "./pages/EditInvestor";
import AddInvestorTransaction from "./pages/AddInvestorTransaction";

import LendToCustomer from "./pages/LeadToCustomer";
import Drafts from "./pages/Drafts";

export default function App() {
  return (
    <Routes>
      {/* Pages WITH BottomNav */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />

        <Route path="/money" element={<Money />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/profile" element={<Profile />} />

        {/* Payment flow */}
        <Route path="/payment/:id" element={<Payment />} />
        <Route path="/payment/select-card" element={<SelectCard />} />
        <Route path="/payment/add-card" element={<AddCard />} />
        <Route path="/payment/pin" element={<EnterPin />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />

        {/* Investor flow */}
        <Route path="/investor/:id" element={<InvestorDetails />} />
        <Route path="/edit-investor/:id" element={<EditInvestor />} />
        <Route
          path="/add-investor-transaction/:id"
          element={<AddInvestorTransaction />}
        />
      </Route>

      {/* Pages WITHOUT BottomNav */}
      <Route path="/add-customer" element={<AddCustomer />} />
      <Route path="/drafts" element={<Drafts />} />
      <Route path="/add-transaction" element={<AddTransaction />} />
      <Route path="/lend/:customerId" element={<LendToCustomer />} />
      <Route path="/calculator" element={<InterestCalculator />} />
      <Route path="/reminders" element={<Reminders />} />
      <Route path="/add-investor" element={<AddInvestor />} />

      {/* 404 */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
