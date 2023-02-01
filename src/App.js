import React from 'react';
import { useEffect, useState } from 'react';
import './App.css';
import { WechatOutlined ,LoadingOutlined} from '@ant-design/icons';
import { Input, Space,Spin,Button,Watermark,message } from 'antd';



function App() {
  const [error, setError] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [prevAnswer, setPrevAnswer] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [connectionError, setConnectionError] = useState(false);
  const inputRef = React.useRef();
  const { Search } = Input;
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const DOMAIN = process.env.REACT_APP_DOMAIN;
  const [messageApi, contextHolder] = message.useMessage();
   
  const suffix = (
    <WechatOutlined
      style={{
        fontSize: 16,
        color: '#2a2a2A',
      }}
    />
  );
  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const handleSubmit = (e) => {
    setQuestions([...questions, e]);
    setSearchValue('');
    setIsLoading(true);
    setPrevAnswer(prevAnswer + '<div class="question"><div class="question-text">' + e + '</div></div>');
  }
  
  const getAnswer = async () => {
    if (questions.length === 0) {
      return;
    }
    try {
      setIsLoading(true);
      let response = await fetch(`http://${DOMAIN}:5001/ask?q=${questions[0]}&conversation_id=${conversationId}`);
      response = await response.json();
      setAnswers([...answers, response.answers]);
      setQuestions([]);
      setPrevAnswer(prevAnswer + '<div class="answer"><div class="answer-text">' + response.answers + '</div></div>');
      setError(false);
      setIsLoading(false);
    } catch (e) {
      setError(true);
      messageApi.open({
        type: 'info',
        content: '请重新发送',
        maxCount: 1,
        duration: 2
      });
      setIsLoading(false);
    }
  }
  
  
  useEffect(() => {
    getAnswer();
  }, [questions]);
  useEffect(() => {
    inputRef.current.value = '';
  }, []);

  useEffect(() => {
    const getNewConversationId = async () => {
      try {
        let response = await fetch(`http://${DOMAIN}:5001/new-conversation`);
        response = await response.json();
        const id = response.id;
        setConversationId(id);
      } catch (e) {
        setConnectionError(true);
      }
    };
    getNewConversationId();
  }, []);
  useEffect(() => {
    document.querySelector('.answer-area').scrollTop = document.querySelector('.answer-area').scrollHeight;
  }, [prevAnswer]);

  return (
    <Watermark content="">
      {contextHolder}
    <div className='container'>
      <div className="answer-area" dangerouslySetInnerHTML={{__html: prevAnswer}} />  
      <Space direction="vertical">    
        <div className='alert-container'>    
          {isLoading && <Spin indicator={antIcon}/>} 
        </div> 
        <Search
          placeholder="跟我聊两句吧"
          enterButton="Send"
          size="large"
          ref={inputRef}
          suffix={suffix}
          onSearch={handleSubmit}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          />
      </Space>
      </div>
    </Watermark>
  );
}

export default App;
