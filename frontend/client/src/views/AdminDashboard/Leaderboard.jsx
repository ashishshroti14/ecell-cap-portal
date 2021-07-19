import React, { useState, useEffect, useRef, useCallback } from 'react'
import "./AdminDashboard.css"

import { Route, Switch, BrowserRouter as Router } from "react-router-dom";

import { Layout, Row, Col, Typography, Table, Input, Space, Button, } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';

import Axios from 'axios';
import Avatar from 'antd/lib/avatar/avatar';
import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";

const { Title } = Typography
const axios = Axios.create({
    baseURL: "https://ecell.iitm.ac.in/data",
    withCredentials: true,
});


function Leaderboard() {
    const [ambassadors, setAmbassadors] = useState([])
    const myref = useRef(null)
    const screen = useBreakpoint();
    const [loading, setLoading] = useState(false)
    const [searchState, setSearchState] = useState({
        searchText: '',
        searchedColumn: '',
    })


    const [sortState, setSortState] = useState({
        filteredInfo: null,
        sortedInfo: null,
    })

    const handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        setSortState({
            ...sortState,

            sortedInfo: sorter,
        });
    };




    const getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={myref}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
          </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
          </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) => {
            return record[dataIndex]
                ? record[dataIndex].toLowerCase().includes(value.toLowerCase())
                : ''
        },
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => myref.current.select(), 100);
            }
        },
        render: text =>
            searchState.searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchState.searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                    text
                ),
    });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    const handleReset = clearFilters => {
        clearFilters();
        setSearchState({ searchText: '' });
    };

    const getAmbassadors = async (task) => {
        setLoading(true)
        const res = await axios.get("/cap-admin/admin/all-ambassadors")
        await setAmbassadors(res.data.data)
        setLoading(false)
    }

    useEffect(() => {
        getAmbassadors()


    }, [])

    const usersPointsSorted = [...ambassadors].sort((a, b) => b.points - a.points);
    const dataSource = usersPointsSorted.map((ambassador, i) => ({ ...ambassador, rank: i + 1 }));

    let { sortedInfo, filteredInfo } = sortState;
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const columns = [

        {
            title: '',

            key: 'avatarUrl',
            width: "10%",
            render: (text, ambassador) => (
                <Space size="small">
                    <Avatar src={ambassador.avatarURL} style={{ backgroundColor: "green" }}>
                        <UserOutlined />
                    </Avatar>

                </Space>
            )
        },
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            width: "10%",
            sorter: (a, b) => a.rank - b.rank,
            sortOrder: sortedInfo.columnKey === 'points' && sortedInfo.order,
            ellipsis: true,

        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: "30%",
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ...getColumnSearchProps('email'),

            width: "20%",
            align: "center",
        },
        {
            title: 'Institution',
            dataIndex: 'collegeName',
            key: 'collegeName',
            ...getColumnSearchProps('collegeName'),

            width: "30%",
            align: "center",
        },

        {
            title: 'Points',
            dataIndex: 'points',
            key: 'points',
            sorter: (a, b) => a.points - b.points,
            sortOrder: sortedInfo.columnKey === 'points' && sortedInfo.order,
            width: "10%",
            ellipsis: true,

        },
    ];

    const columnsForMobile = [

        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            width: "20%",
            sorter: (a, b) => a.rank - b.rank,
            sortOrder: sortedInfo.columnKey === 'points' && sortedInfo.order,
            ellipsis: true,
            align: "center"

        },

        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name'),

            width: "40%",
            align: "center",
        },

        {
            title: 'Points',
            dataIndex: 'points',
            key: 'points',
            sorter: (a, b) => a.points - b.points,
            sortOrder: sortedInfo.columnKey === 'points' && sortedInfo.order,
            ellipsis: true,
            width: "20%",
            align: "center"

        },
    ];

    return (
        <div>

            <Router>

                <Switch>
                    <Route exact path={`/cap-p/admin-dashboard/leaderboard` || `/cap-p/admin-dashboard/leaderboard`}>

                        <div className="site-layout-content">
                            <Title level={3}>Leaderboard </Title>


                            <Row>
                                <Col span={24}>
                                    {
                                        screen.md ? <Table loading={loading} dataSource={dataSource} columns={columns} onChange={handleChange} expandable={{
                                            expandedRowRender: (ambassador => {
                                                return <Row>
                                                    <Col span={12}>

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

                                            }
                                            ),
                                        }} size="small" />
                                            :
                                            screen.md ? <Table dataSource={dataSource} columns={columnsForMobile} onChange={handleChange}
                                                expandable={{
                                                    expandedRowRender: (ambassador => {
                                                        return <Row>
                                                            <Col span={12}>

                                                                <Avatar src={ambassador.avatarURL} style={{ backgroundColor: "forestgreen" }} size={80}>
                                                                    <UserOutlined />
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

                                                    }
                                                    ),

                                                }}
                                                size="small" /> :
                                                <Table dataSource={dataSource} columns={columnsForMobile} onChange={handleChange}
                                                    expandable={{
                                                        width: "5%",
                                                        expandedRowRender: (ambassador => {
                                                            return <Row>
                                                                <Col>

                                                                    <Row>

                                                                        <Title level={5} style={{ color: "gray", fontSize: 10 }}>
                                                                            {ambassador.collegeName}
                                                                        </Title>
                                                                    </Row>
                                                                    <Row>

                                                                        <Title level={5} style={{ color: "gray", fontSize: 10 }}>
                                                                            {ambassador.email}
                                                                        </Title>
                                                                    </Row>
                                                                </Col>
                                                            </Row>
                                                        }
                                                        ),
                                                        rowExpandable: ambassador => ambassador.name !== 'Not Expandable',
                                                    }}
                                                    size="small" />
                                    }
                                </Col>
                            </Row>


                        </div>

                    </Route>

                </Switch>
            </Router>

        </div>



    )
}

export default Leaderboard
