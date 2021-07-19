import { Route, Switch, BrowserRouter as Router } from "react-router-dom";
import { Layout } from "antd";

import Login from "./views/Login/Login";

import AdminDashboard from "./views/AdminDashboard/AdminDashboard.jsx"
import ECellFooter from "./common/ECellFooter";

import "./App.less";
import { PrivateRoute, PublicRoute } from "./common/SpecialRoutes";

const { Footer } = Layout;

const App = () => {
    return (
        <Layout className="App">
            <Router>
                <Switch>

                    <PrivateRoute path="/cap-p/admin-dashboard" component={AdminDashboard} />
                    <PrivateRoute exact path="/cap-p/admin-dashboard/leaderboard" component={AdminDashboard} />
                    <PublicRoute exact path="/cap-p/admin/login" component={Login} />
                    <Route path="*" component={() => window.location.href = "/cap-p/admin/login"} />
                </Switch>
            </Router>
            <Footer
                style={{
                    backgroundColor: "white",
                    boxShadow: "0px -1px 20px rgba(85, 85, 85, 0.2)",
                    padding: "20px",
                    marginTop: "1rem",
                    position: "sticky",
                    verticalAlign: "bottom",
                    width: "100%",
                    zIndex: 100,
                }}>
                <ECellFooter
                    developers={[
                        {
                            name: "Ashish",
                            whatsappNum: "+91 9983321407",
                            profileURL: "https://www.linkedin.com/in/ashish-kumar-shroti/",
                        },
                        {
                            name: "Abhijit",
                            whatsappNum: "+91 8895219514",
                            profileURL: "https://github.com/abhijit-hota",
                        },
                        {
                            name: "Harsh",
                            whatsappNum: "+91 9345105302",
                            profileURL: "",
                        },
                    ]}
                />
            </Footer>
        </Layout>
    );
};

export default App;
