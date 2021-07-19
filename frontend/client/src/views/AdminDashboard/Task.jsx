import React, { useState, useEffect, useRef, } from 'react'
import "./AdminDashboard.css"

import { Route, Link, Switch, BrowserRouter as Router } from "react-router-dom";

import {  Breadcrumb, Row, Col, Typography, Table, Input, Space, Button, Spin, Divider } from 'antd';
import Highlighter from 'react-highlight-words';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';

import Axios from 'axios';
import Ambassador from './Ambassador';
import Avatar from 'antd/lib/avatar/avatar';

import useBreakpoint from "antd/lib/grid/hooks/useBreakpoint";

const { Title } = Typography

const axios = Axios.create({
  baseURL: "https://ecell.iitm.ac.in/data",
  withCredentials: true,
});


function Task(props) {
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
        ? record.name.toLowerCase().includes(value.toLowerCase())
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
  const { task } = props


  const getAmbassadors = async (task) => {
    setLoading(true)
    const res = await axios.get("/cap-admin/admin/task/ambassadors", {
      params: { taskId: task._id }
    })
    await setAmbassadors(res.data.data)
    setLoading(false)
  }

  useEffect(() => {
    getAmbassadors(task)
  }, [])

  let i = 0
  var dataSource = ambassadors ? ambassadors.map(ambassador => {
    if (ambassador) {
      i++
      var avenueList = ""
      const concatinater = ambassador ? ambassador.avenues.map(avenue => {
        avenueList = avenueList.concat(titleCase(avenue), " ")
      }) : ""
      return { ...ambassador, key: String(i), avenueList: ambassador ? avenueList : "" }
    }

  }) : []


  let { sortedInfo, filteredInfo } = sortState;
  sortedInfo = sortedInfo || {};
  filteredInfo = filteredInfo || {};
  const columns = [
    {
      title: '',

      key: 'avatarUrl',
      render: (text, ambassador) => (
        <Space size="small">
          <Avatar src={ambassador.avatarURL} style={{ backgroundColor: "green" }}>
            <UserOutlined />
          </Avatar>
        </Space>
      )
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      
      ...getColumnSearchProps('name'),
    },

    {
      title: 'Avenue',
      dataIndex: 'avenueList',
      key: 'avenueList',
      filters: [
        { text: 'Linkedin', value: 'Linkedin' },
        { text: 'Whatsapp', value: 'Whatsapp' },
        { text: 'Instagram', value: 'Instagram' },
        { text: 'Email', value: 'Email' },
        { text: 'Others', value: 'Others' },
      ],
      onFilter: (value, record) => record.avenueList.indexOf(value) === 0,
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
      sorter: (a, b) => a.points - b.points,
      sortOrder: sortedInfo.columnKey === 'points' && sortedInfo.order,
      ellipsis: true,

    },
    {
      title: 'Submissions',
      dataIndex: 'numOfDocs',
      key: 'numOfDocs',
      sorter: (a, b) => a.numOfDocs - b.numOfDocs,
      sortOrder: sortedInfo.columnKey === 'numOfDocs' && sortedInfo.order,
      ellipsis: true,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, ambassador) => (
        <Space size="middle">
          <Link to={`/cap-p/admin-dashboard/${task._id}/${ambassador.ambassadorId}`}>View Submissions</Link>
        </Space>
      ),
    },
  ];

  const columnsForMobile = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ...getColumnSearchProps('name'),
      render: (text, ambassador) => (
        <Space size="middle">
          <Link to={`/cap-p/admin-dashboard/${task._id}/${ambassador.ambassadorId}`}>{ambassador.name}</Link>
        </Space>),
      width: 100,
      align: "center",
    },
    {
      title: 'Submissions',
      dataIndex: 'numOfDocs',
      key: 'numOfDocs',
      sorter: (a, b) => a.numOfDocs - b.numOfDocs,
      sortOrder: sortedInfo.columnKey === 'numOfDocs' && sortedInfo.order,
      ellipsis: true,
      width: 65,
      align: "center",
    },
  ];



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

  return (
    <div>
      <Router>
        <Switch>
          <Route exact path={`/cap-p/admin-dashboard/${task._id}` || `/cap-p/admin-dashboard/${task._id}/`}>
            <Breadcrumb style={{ margin: '16px 0' }}>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>{task.taskName}</Breadcrumb.Item>
            </Breadcrumb>
            <div className="site-layout-content">
              <Title level={3}>Ambassadors who have completed the task : {task.taskName} </Title>
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
                      <Table dataSource={dataSource} columns={columnsForMobile} onChange={handleChange}
                       size="small" />
                  }
                </Col>
              </Row>
            </div>
          </Route>
          {
            ambassadors.length ? (ambassadors.map(ambassador => {

              if (ambassador) {
                return (
                  <Route path={`/cap-p/admin-dashboard/${task._id}/${ambassador.ambassadorId}` || `/cap-p/admin-dashboard/${task._id}/${ambassador.ambassadorId}/`}>
                    <Ambassador task={task} ambassador={ambassador} ></Ambassador>
                  </Route>
                )
              }
            })) : <Row justify="center">
                <Divider />
                <Spin size="large" />
              </Row>
          }
        </Switch>
      </Router>
    </div>
  )
}

export default Task
