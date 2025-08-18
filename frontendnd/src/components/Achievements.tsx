import React, {useEffect, useState} from "react";
import {Container, Form, Button, Row, Col, Alert, Spinner, Card} from "react-bootstrap"
import api from "../api/forums";
import { useStoreActions, useStoreState } from "../interface/hooks";
import { Profile } from "../interface/ProfileModel";
import { useParams } from "react-router-dom";
import { useTheme } from "./ThemeContext";
const Achievements = () => {
    const id = useStoreState((s) => s.user.Id);
    const fetchProfile = useStoreActions((a) => a.profile.fetchSelectedProfile);
    const profile = useStoreState((s) => s.profile.selectedProfile);
    useEffect(() => {
        if(id){
            fetchProfile(id);
        }
    },[])
    const {darkMode} = useTheme();
    const bg2 = darkMode ? "#000000e8" : "#ffffff";
    const color = darkMode ? "white": "black";
    const reputationPoints = profile?.reputation;
    const badges = [
        {name: "Iron", icon: "https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/1.png?v=9", points: 10},
        {name: "Bronze", icon: "/badges/bronze.png", points: 50},
        {name: "Silver", icon: "https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/3.png?v=9", points: 100},
        {name: "Gold", icon: "https://i.namu.wiki/i/TI2BGk5sLXtNrvv3Hyf9MK_cKw82C6S0UFIVrf6owcqcWRntupBUGftmek8Dj2bK9wwhC_7-qkJXZfIDLLj-Bg.webp", points: 200},
        {name: "Platinum", icon : "https://www.proguides.com/guides/wp-content/uploads/2023/06/Season_2022_-_Platinum.webp", points: 500}
    ]
    const latestUnlocked = badges.filter( b => reputationPoints! >= b.points)
                                 .sort((a,b) => b.points - a.points)[0];
    
    return(
        <div style={{background: bg2}}>
        <Container className="min-vh-100">
            <Row className="justify-content-center">
                <Col md={6}>
                <Card className="p-4 " style={{color: color, background: bg2}}>
                    <div className="text-center" >
                        <p>Ranks</p>
                        <div className="d-flex justify-content-center flex-wrap gap-1 mt-3" >
                            {badges.map((badge) => (
                                <div key={badge.name} className="text-center p-3 ms-3 "
                                    style={{
                                        cursor: "pointer",
                                        border: badge.name === latestUnlocked?.name ? "2px solid #0d6efd" : "2px solid transparent"
                                    }}
                                >
                                    <img src={badge.icon}
                                        alt={badge.name}
                                        title={badge.name}
                                        style={{ width: "140px", height: '140px', backgroundColor: "transparent",backgroundBlendMode: "multiply"}}
                                        />
                                     <div style={{fontSize: '0.75rem'}}>{badge.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-center mt-3 text-body-tertiary">10 Points = Iron</p>
                    <p className="text-center text-warning-emphasis">50 Points = Bronze</p>
                    <p className="text-center text-dark-emphasis">100 Points = Silver</p>
                    <p className="text-center text-warning">200 Points = Gold</p>
                    <p className="text-center text-info">500 Points = Platinum</p>
                    <p className="text-start">5 Points for 1 Post</p>
                    <hr/>
                    <p className="text-start">10 Points for 1 Thread</p>
                </Card>
                </Col>
            </Row>
        </Container>
        </div>
    )
}
export default Achievements