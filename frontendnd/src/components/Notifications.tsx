import React, {useEffect, useState} from "react";
import { useParams, Link, Navigate, useNavigate} from "react-router-dom"
import {useStoreActions, useStoreState} from "../interface/hooks";
import {Card, Badge, Button, Spinner, ListGroup, Alert} from "react-bootstrap"
import {faHeart, faCommentAlt} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//
import { useTheme } from "./ThemeContext";
import api from "../api/forums";
import { formatWhen } from "../utils/dates";
const Notifications = () => {
    const {darkMode} = useTheme();
    const cardStyle = {
        backgroundColor : darkMode ? "#3E4B58" : "#ffffff",
        color: darkMode ? "white" : "black",
        borderRadius: "8px",
        padding: "12px 16px",
        marginBottom: "12px",
    }
    const bg = darkMode? "#583e3e" : "#ffffff";
    const color = darkMode ? "white" : "black";
    //const formatted = (date:Date) => formatDistanceToNow(new Date(date), {addSuffix : true})
    const notifications = useStoreState((s) => s.user.Notifications);
    const loading = useStoreState((s) => s.user.loading);
    const error = useStoreState((s) => s.user.error);
    const fetchNotifications = useStoreActions((a) => a.user.fetchNotifications);
    const navigate = useNavigate();
    const markAsRead = useStoreActions((a) => a.notification.MarkAsRead);
    const deleteNotification = useStoreActions((a) => a.notification.DeleteNotification);
    useEffect(() => {
        fetchNotifications();
    },[fetchNotifications]);

    const handleNotificationClick = async(notif: any) => {
        if(!notif.isRead){
            try{
                markAsRead(notif.id)
            }catch(err){
                console.error("Failed to mark notification as read", err);
            }
        }
        navigate(notif.url)
    }
    const deleteNotifications = async(id: number) => {
        await deleteNotification(id);
        await fetchNotifications();
    } 
    return (
        <div className="min-vh-100 z-1" style={{background: bg, color: color}} >
            <div className="container">

            <h2 className="pt-5">Notifications</h2>
            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && !error && notifications.length === 0 && <p className=" mt-4">No notifications yet.</p>}
            <ListGroup>
                {notifications.map((notif : any, index: number) => (
                    <>
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-start">
                        <div onClick={() => handleNotificationClick(notif)} className={notif.isRead ? '' : 'fw-bold'} style={{ cursor: 'pointer', flex: 1 }}>
                            {notif.message}
                        <div className="text-muted small">{formatWhen(notif.createdAt)}</div>
                        </div>
                        <button
                        onClick={() => deleteNotifications(notif.id)}
                        className="btn btn-sm btn-outline-danger ms-3"
                        >
                        &times;
                        </button>
                    </ListGroup.Item>
                    
                    </>
                ))}
            </ListGroup>
                        </div>
        </div>
    )
}
export default Notifications;