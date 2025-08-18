import {useEffect, useState} from "react";
import {Container, Row, Col, Card, Spinner} from "react-bootstrap"
import UserSidebar from "./UserSidebar";
import {useStoreActions, useStoreState} from "../interface/hooks";
import api from "../api/forums";
import PostItem from "./PostItem";
import ThreadItem from "./ThreadItem";

const UserDashboard = () => {
    const activity = useStoreState((s) => s.user.Activity);
    const fetchActivity = useStoreActions((a) => a.user.fetchActivity);
    useEffect(() => {
        fetchActivity()
    },[])
    return(
        <Container fluid className="mt-5">
            <Row>
                <Col md={2} className="p-0">
                    <UserSidebar active="dashboard" />
                </Col>
                <Col md={10} className="p-4">
                    <h2>User Dashboard</h2>
                    <Row className="mt-4">
                    <Col md={3}>
                        <Card className="p-3 text-center">
                            <h4 className="border-bottom pb-2">Posts</h4>
                            {activity.posts.map((post) => 
                                <PostItem key={post.id} post={post} />
                            )}
                        </Card> 
                    </Col>
                    <Col md={3}>
                        <Card className="p-3 text-center">
                            <h4 className="border-bottom pb-2">Threads</h4>
                            {activity.threads.map((thread) => 
                                <ThreadItem key={thread.id} thread={thread} />
                            )}
                        </Card> 
                    </Col>
                    <Col md={2}>
                        <Card className="p-3 text-center">
                            <h4 className="border-bottom pb-2">Total Post Likes</h4>
                            <p>{(activity.totalPostLikeCount ?? 0).toString() }</p>
                        </Card> 
                    </Col>
                    <Col md={2}>
                        <Card className="p-3 text-center">
                            <h4 className="border-bottom pb-2">Total Thread Likes</h4>
                            <p>{(activity.totalThreadLikeCount ?? 0).toString() }</p>
                        </Card> 
                    </Col>
                    <Col md={2}>
                        <Card className="p-3 text-center">
                            <h4 className="border-bottom pb-2">Total Subscribed Forums</h4>
                            <p>{(activity.totalSubscribedForumCount ?? 0).toString() }</p>
                        </Card> 
                    </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    )
}
export default UserDashboard;