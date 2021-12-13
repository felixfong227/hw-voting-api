import { useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthContext, AuthContextProvider } from "./Context/Auth";
import { CampaignsPage } from "./Pages/Campaigns";
import { CreateNewCampaign } from "./Pages/CreateNewCampaign";
import LoginPage from "./Pages/Login";

function App() {
  const UseAuthContext = useContext(AuthContext);
  return (
    <AuthContextProvider>
      {
        UseAuthContext.HKIDHash ? (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<CampaignsPage />} />
              <Route path="/new/campaign" element={<CreateNewCampaign />} />
            </Routes>
          </BrowserRouter>
        ) : <LoginPage />
      }
    </AuthContextProvider>
  );
}

export default App;
