import React, { useState, useEffect, } from 'react'
import "./AdminDashboard.css"
import { Layout, Breadcrumb, Row, Col, Typography, Card, Divider, Spin, Button } from 'antd';
import { LogoutOutlined, HomeOutlined, RocketOutlined } from '@ant-design/icons';
import Axios from 'axios';

import { Route, Link, Switch, BrowserRouter as Router, useHistory } from "react-router-dom";

import Task from "./Task"
import Leaderboard from './Leaderboard';
import openNotification from "../../utils/openAntdNotification";

const { Title } = Typography

const axios = Axios.create({
  baseURL: "https://ecell.iitm.ac.in/data",
  withCredentials: true,
});

const { Header, Content } = Layout;

function AdminDashboard() {
  const history = useHistory()
  const [tasks, setTasks] = useState({})

  const handleLogout = async () => {
    try {
      console.log("logout")
      await axios.get("/cap-admin/admin/logout", { withCredentials: true });
      history.push("/cap-p/admin/login");
    } catch (error) {
      const errMsg = error.response ? error.response.data.msg : error.message;
      openNotification("error", errMsg);
    }
  };

  const getTasks = async () => {
    const res = await axios.get("/cap-admin/admin/tasks", { withCredentials: true, credentials: 'include' })
    await setTasks(res.data.data)

  }

  useEffect(() => {
    getTasks()
  }, [])

  return (
    <div>
      <Layout className="layout">
        <Header>
          <div className="logo" />
          <Row>
            <Col
              xs={{ span: 8, offset: 0 }}
              sm={{ span: 16, offset: 0 }}
              md={{ span: 19, offset: 0 }}
              lg={{ span: 19, offset: 0 }}>
              <Title
                style={{
                  paddingTop: 10,
                  color: "white",
                  textAlign: "left",
                  fontSize: 35,
                  fontFamily: "Andika",
                  fontWeight: 30,
                }}>
                CAP
                        </Title>
            </Col>
            <Col>
              <Button type="primary" shape="circle" size="large" ><a href="/cap-p/admin-dashboard"><HomeOutlined /></a></Button>
            _
            <Button type="primary" shape="circle" size="large" ><a href="/cap-p/admin-dashboard/leaderboard"><RocketOutlined /></a></Button>
            _
            <Button type="primary" shape="circle" size="large" ><LogoutOutlined onClick={handleLogout} /></Button>
            </Col>
          </Row>

        </Header>
        <Content style={{ padding: '0 50px', minHeight: 775 }}>
          <Router>
            <Switch>
              <Route exact path={`/cap-p/admin-dashboard/` || `/cap-p/admin-dashboard`}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                  <Breadcrumb.Item>Home</Breadcrumb.Item>
                </Breadcrumb>
                <div className="site-layout-content">
                  <Title>Tasks</Title>
                  <Row>
                    {
                      tasks.length ? (tasks.map(task => {
                        return (<div><Col>
                          <Card title={task.taskName} extra={<Link to={`/cap-p/admin-dashboard/${task._id}`}>Go To Task</Link>} style={{ width: 300 }}>
                            <Row>
                              <Col span={20}>
                                No. of Ambassadors:
                        </Col>
                              <Col span={4}>
                                {task.ambassadorIds.length}
                              </Col>
                            </Row>
                          </Card>
                        </Col>
                        </div>)
                      })) : <Row justify="center">
                          <Divider />
                          <Spin size="large" />
                        </Row>
                    }

                  </Row>

                </div>
              </Route>
              
              {
                tasks.length ? (tasks.map(task => {
                  return (
                    <Route path={`/cap-p/admin-dashboard/${task._id}`}>
                      <Task task={task}></Task>
                    </Route>
                  )
                })) : <Row justify="center">
                    <Divider />
                    <Spin size="large" />
                  </Row>
              }
              <Route exact path="/cap-p/admin-dashboard/leaderboard" >

                <Leaderboard></Leaderboard>
              </Route>
            </Switch>
          </Router>
        </Content>
      </Layout>
    </div>
  )
}

export default AdminDashboard


