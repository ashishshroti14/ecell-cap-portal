import React, { useState, useEffect, useRef } from 'react'
import "./AdminDashboard.css"

import { Layout, Breadcrumb, Row, Col, Typography, Card, Modal, Button, Divider, Spin, Avatar, InputNumber, Form } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Route, Link, Switch, BrowserRouter as Router } from "react-router-dom";
import Axios from 'axios';
import openNotification from '../../utils/openAntdNotification';

const { Title } = Typography

const axios = Axios.create({
    baseURL: "https://ecell.iitm.ac.in/data",
    withCredentials: true,
});

function titleCase(str) {
    var splitStr = str.toLowerCase().split(' ');
    for (var i = 0; i < splitStr.length; i++) {
        // You do not need to check if i is larger than splitStr length, as your for does that for you
        // Assign it back to the array
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    // Directly return the joined string
    return splitStr.join(' ');
}

function Ambassador(props) {
    const { task, ambassador } = props
    const pointsRef = useRef(null)
    const [points, setPoints] = useState(ambassador.points)
    const [avenues, setAvenues] = useState([])
    const [visible, setVisible] = useState(false);
    const [modalAvenue, setModalAvenue] = useState()

    const getAvenues = async (task, ambassador) => {
        const res = await axios.get("/cap-admin/admin/task/ambassador/submissions", {
            params: { taskId: task._id, ambassadorId: ambassador.ambassadorId }
        })
        await setAvenues(res.data.data)
    }

    useEffect(() => {
        getAvenues(task, ambassador)

    }, [])

    const handleSubmit = async (input) => {
        if(input < points){
            openNotification("warning", "Value to be updated must be greater than current value")
        }
        else{

     
        const res = await axios.post("/cap-admin/admin/task/ambassador/submissions/update-points", { points: input, ambassadorId: ambassador.ambassadorId })
        const updatedPoints = res.data.data
        setPoints(updatedPoints)
    }
    }

    return (
        <div>
            <Router>
                <Switch>
                    <Route exact path={`/cap-p/admin-dashboard/${task._id}/${ambassador.ambassadorId}` || `/cap-p/admin-dashboard/${task._id}/${ambassador.ambassadorId}/`}>
                        <Breadcrumb style={{ margin: '16px 0' }}>
                            <Breadcrumb.Item>Home</Breadcrumb.Item>
                            <Breadcrumb.Item>{task.taskName}</Breadcrumb.Item>
                            <Breadcrumb.Item>{ambassador.name}</Breadcrumb.Item>

                        </Breadcrumb>
                        <div className="site-layout-content">
                            <Title level={3}> Submissions by </Title>
                            <Row>
                                <Col span={8}>

                                    <Avatar src={ambassador.avatarURL} style={{ backgroundColor: "forestgreen" }} size={80}>
                                        <UserOutlined size={80} />
                                    </Avatar>

                                </Col>
                                <Col>
                                    <Row>
                                        <Title level={3}>
                                            {ambassador.name}
                                        </Title>
                                    </Row>
                                    <Row>

                                        <Title level={5} style={{ color: "gray" }}>
                                            {ambassador.collegeName}
                                        </Title>
                                    </Row>
                                    <Row>

                                        <Title level={5} style={{ color: "gray" }}>
                                            {ambassador.email}
                                        </Title>
                                    </Row>
                                </Col>
                            </Row>
                            <Row>
                                {
                                    avenues.length ? (avenues.map(avenue => {
                                        return (<Col>
                                            <Card title={titleCase(avenue.avenue)} style={{ width: 2000 }} extra={<a onClick={async () => {
                                                await setModalAvenue(avenue)
                                                setVisible(true)
                                            }} >View Submissions</a>} style={{ width: 300 }}>
                                                <Row>
                                                    <Col span={20}>
                                                        No. of Submissions:
                        </Col>
                                                    <Col span={4}>
                                                        {avenue.urls.length}
                                                    </Col>
                                                </Row>
                                            </Card>
                                        </Col>
                                        )
                                    })) : <Row justify="center">
                                            <Divider />
                                            <Spin size="large" />
                                        </Row>
                                }
                            </Row>
                            <Divider />
                            <Row justify="center">
                                <Title level={4}>Current Points: {points}</Title>
                            </Row>
                            <Row justify="center">
                                <Form
                                    layout="horizontal"
                                >
                                    <Form.Item >
                                        <Row justify="center">
                                            <Title level={3}>
                                                Update Points:</Title>
                                        </Row>
                                        <Row justify="center">
                                            <InputNumber ref={pointsRef} defaultValue={points} min={points}
                                              />
                                        </Row>
                                    </Form.Item>
                                    <Form.Item >
                                        <Row justify="center">
                                            <Button type="primary" onClick={() => handleSubmit(pointsRef.current.currentValue)}>Update</Button>
                                        </Row>
                                    </Form.Item>
                                </Form>
                            </Row>
                            <Modal
                                title="Submissions"
                                centered
                                visible={visible}
                                onOk={() => setVisible(false)}
                                onCancel={() => setVisible(false)}
                                width={1000}
                                destroyOnClose={true}

                            >

                                {
                                    modalAvenue ? modalAvenue.urls.map(url => {
                                        return <div style={{ height: 1200, backgroundColor: "silver" }}>
                                            <iframe
                                                alt={url}
                                                width="100%"
                                                height="100%"
                                                src={url}

                                            ></iframe>

                                        </div>
                                    }) : null
                                }

                            </Modal>

                        </div>
                    </Route>
                </Switch>
            </Router>
        </div>
    )
}

export default Ambassador
