import React, { useEffect, useState, useRef } from 'react'
import Chatting from "../Chatting";
import { SOCKET_URL } from '../../../config/api';
import { EditorState, Editor } from "draft-js";
import background from "../../../assets/photography.png";



// let socket;
const local = JSON.parse(localStorage.getItem('userlogin'))

const ContentChatting = ({ id, room_id, name, picture, tipe, socket, newChat }) => {
    const messagesEndRef = useRef(null);
    const [listChats, setListChats] = useState([])
    const [message, setMessage] = useState("")
    const [editors, setEditors] = useState(() => EditorState.createEmpty())


    const scrollToBottom = () => {
        const scroll = messagesEndRef.current?.scrollHeight - messagesEndRef.current?.clientHeight;
        messagesEndRef.current.scrollTo(10, scroll)
    };

    useEffect(() => {
        const getListMessage = () => {
            if (id !== undefined) {
                fetch(`${SOCKET_URL}/api/v1/getChat/${tipe}/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${local.token}`,
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json())
                    .then((res) => {
                        setListChats(res.data)
                        scrollToBottom()
                    })
                    .catch((err) => {
                        console.log('err', err)
                    })
            }
        }
        getListMessage()
    }, [id, tipe])

    useEffect(() => {
        if (typeof newChat === 'object') {
            if (Object.keys(newChat).length > 0) {
                // console.log('chat baru object bigger 0', typeof newChat)
                setListChats(msgs => [...msgs, newChat])
            }
            scrollToBottom()
        }

    }, [newChat])



    // useEffect(() => {
    //     socket.on('message', message => {
    //         setListChats(msgs => [...msgs, message])
    //         scrollToBottom()
    //     })
    //     return () => { };
    //     // return () => getMessage();
    // }, [])



    const handleSend = (e) => {
        e.preventDefault();
        socket.emit("chatMessage", { msg: message, username: local.id, room: room_id, tipe, targetId: id }) // emit the message to server
        setMessage("")
        scrollToBottom()
    }
    return (
        <div className="content" style={{ backgroundImage: `url(${background})` }}>
            <div className="contact-profile">
                <img src={picture} alt="" />
                <p>{name}</p>
                {/* <div className="social-media">
                    <i className="fa fa-facebook" aria-hidden="true" />
                    <i className="fa fa-twitter" aria-hidden="true" />
                    <i className="fa fa-instagram" aria-hidden="true" />
                </div> */}
            </div>
            <div className="messages" ref={messagesEndRef}>
                <ul>
                    {
                        listChats.map((item, index) => {
                            let isMe;
                            if (item.send_by === null) {
                                isMe = false
                            }
                            else {
                                isMe = local.id === parseInt(item.send_by) ? true : false;
                            }
                            const myPic = "http://emilcarlsson.se/assets/mikeross.png"
                            return <Chatting key={index} isMe={isMe} picture={isMe ? myPic : picture} message={item.message} time={item.time} />
                        })
                    }
                </ul>
            </div>
            <div className="message-input">
                <div className="wrap">
                    <form onSubmit={handleSend} >
                    <Editor editorState={editors} onChange={setEditors} />
                        <input type="text" placeholder="Write your message..." value={message} onChange={(e) => setMessage(e.target.value)} />
                        <i className="fa fa-paperclip attachment" aria-hidden="true" />
                        <button className="submit" >
                            <i className="fa fa-paper-plane" aria-hidden="true" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ContentChatting
